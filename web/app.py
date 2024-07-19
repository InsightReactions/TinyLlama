#!/usr/bin/env python3
import subprocess
from flask import Flask, request, jsonify, send_from_directory
import os
from datetime import datetime, timezone
import logging
import json

TL_TESTING = bool(os.environ.get('TL_TESTING', False))
if TL_TESTING:
    logging.basicConfig(level=logging.DEBUG)

# Maximum amount of patchnotes to serve to the client at once
PATCHNOTE_LIMIT = 10

app = Flask("Tiny Llama Service", 
            static_url_path='', 
            static_folder='static')
app.config["JSON_AS_ASCII"] = False
app.config["JSONIFY_MIMETYPE"] = "application/json; charset=utf-8"


def get_default_route_ip():
    # Get the default route IP address
    result = subprocess.run(['ip', 'route'], stdout=subprocess.PIPE)
    output = result.stdout.decode('utf-8').strip()

    for line in output.split('\n'):
        if 'default' in line:
            for idx, e in enumerate(line.split()):
                if 'src' in e:
                    return line.split()[idx + 1]
    
    return None

DEFAULT_ROUTE = get_default_route_ip()


def check_pid_running(pid):
    # Use pgrep to search for a process with the given PID
    result = subprocess.run(['ps', '-q', str(pid), '-o', 'comm='], stdout=subprocess.PIPE)

    # If pgrep finds a matching process, return True
    if result.stdout:
        return True

    # Otherwise, return False
    return False


def get_patchnote_files(since: datetime):
    share_dir = '/etc/tinyllama/patchnotes.d/'  # Added a trailing slash to ensure correct path concatenation
    filepaths = []
    creation_times = []

    if not os.path.exists(share_dir):
        print(f"Directory '{share_dir}' does not exist.")
        return filepaths, creation_times

    for filename in os.listdir(share_dir):
        filepath = os.path.join(share_dir, filename)  # Use os.path.join to ensure correct path concatenation
        if os.path.isfile(filepath):
            # Get the creation time of the file
            creation_time = datetime.fromtimestamp(os.stat(filepath).st_ctime, tz=timezone.utc)

            # Strip off microsconds from the creation_time (since they are not supported by the client)
            creation_time = creation_time.replace(microsecond=0)

            # print the comparisons between dates
            print(f"Comparing {creation_time} > {since} = {creation_time > since}")

            # Check if the file was created after the provided `since` date
            if creation_time > since:
                filepaths.append(filepath)
                creation_times.append(creation_time)

    print(f"Found {len(filepaths)} patchnotes since {since}")
    return filepaths, creation_times


def find_patchnotes(since):
    filepaths, creation_times = get_patchnote_files(since)

    # Sort filepaths based on creation_times, and take the top PATCHNOTE_LIMIT most recent filepaths
    sorted_filepaths = sorted(zip(filepaths, creation_times), reverse=True)[0:PATCHNOTE_LIMIT]

    # Create a list of dictionaries with the filename and creation time for each patchnote
    patchnotes = []
    for (filepath, creation_time) in sorted_filepaths:
        # Open the file and read its contents
        with open(filepath, 'r') as f:
            content = f.read()

        patchnotes.append({
            'filename': os.path.basename(filepath),
            'creationTime': str(creation_time),
            'content': content
        })

    return patchnotes


@app.route('/has-updates', methods=['GET'])
def has_updates():
    print("Checking for updates")
    has_updates = False
    try:
        output = subprocess.check_output(["apt", "update"]).decode("utf-8")
        if " can be upgraded." in output:
            has_updates = True
    except Exception as e:
        print(f"Error checking for updates: {e}")

    return jsonify(hasUpdates=has_updates)


@app.route('/upgrade', methods=['POST'])
def upgrade():
    subprocess.run(["systemctl", "start", "tinyllama-upgrade"])
    return jsonify({"message": "Upgrade started successfully"})


@app.route("/upgrade/status")
def check_upgrade_status():
    # Run shell command to get systemd service status and parse output
    result = subprocess.run(["systemctl", "is-active", "tinyllama-upgrade"], capture_output=True, text=True)
    state = result.stdout.strip()
    if state == "failed":
        result = subprocess.run(["journalctl", "-u", "tinyllama-upgrade", "--since", "1 minutes ago", "--no-pager"], capture_output=True, text=True)
        error_message = result.stdout.strip()

        # Try to fix broken packages automatically
        print("Running 'dpkg --configure -a' to try and fix broken packages automatically")
        subprocess.run(["dpkg", "--configure", "-a"])
    else:
        error_message = ""
    return jsonify({"state": state, "errorMessage": error_message})


@app.route('/default-route', methods=['GET'])
def default_route():
    DEFAULT_ROUTE = get_default_route_ip()
    print("Default route IP:", DEFAULT_ROUTE)
    return jsonify(defaultRoute=DEFAULT_ROUTE)

@app.route('/patchnotes', methods=['GET'])
def get_patchnotes():
    since_str = request.args.get('since')
    print(since_str)
    try:
        since_date = datetime.fromisoformat(since_str)
    except:
        since_date = datetime(1970, 1, 1, tzinfo=timezone.utc)
    print(since_date.tzinfo)

    print("fetching patchnotes since", since_date)
    patchnotes = list(find_patchnotes(since_date))

    # Sort patchnotes by creation time in descending order
    patchnotes.sort(key=lambda x: x['creationTime'], reverse=True)

    return jsonify(patchnotes=patchnotes)

PLUGIN_MARKETPLACE_DIR = "/usr/share/tinyllama/plugin-marketplace"
@app.route('/plugin-marketplace/<plugin_file>', methods=['GET'])
def get_plugin_file(plugin_file):
    return send_from_directory(PLUGIN_MARKETPLACE_DIR, plugin_file)


@app.route('/plugin-marketplace/status/<plugin_name>', methods=['GET'])
def get_plugin_state(plugin_name):
    installed = os.path.exists("/etc/systemd/system/" + plugin_name + ".service")
    active = False
    if installed:
        result = subprocess.run(["systemctl", "is-active", plugin_name], capture_output=True, text=True)
        active = result.stdout.strip() == "active"

    return jsonify(installed=installed, active=active)


@app.route('/plugin-marketplace/list' ,methods=['GET'])
def get_plugins():
    # Open the PLUGIN_MARKETPLACE_DIR directory and list all json files in it
    plugins = []
    for filename in os.listdir(PLUGIN_MARKETPLACE_DIR):
        if filename.endswith(".json"):
            # Append the filenames without the extension to the plugins list
            plugins.append(filename[:-5])

    return jsonify(plugins=plugins)


@app.route('/plugin-marketplace/install/<plugin_name>', methods=['GET'])
def install_plugin(plugin_name):
    plugin_json_path = os.path.join(PLUGIN_MARKETPLACE_DIR, f"{plugin_name}.json")
    if not os.path.exists(plugin_json_path):
        return jsonify({"error": "Plugin not found"}), 404
    
    with open(plugin_json_path, 'r') as f:
        plugin_metadata = json.load(f)

    package = plugin_metadata['package']
    # Install the apt package
    try:
         subprocess.run(['apt', 'install', '-y', package], check=True)
    except subprocess.CalledProcessError as e:
        return jsonify({"error": "Failed to install plugin", "details": str(e)}), 500
    
    # Enable and start the systemd service
    try:
        subprocess.run(['systemctl', 'enable', f'{plugin_name}.service'], check=True)
        subprocess.run(['systemctl', 'start', f'{plugin_name}.service'], check=True)
    except subprocess.CalledProcessError as e:
        return jsonify({"error": "Failed to start plugin service", "details": str(e)}), 500
    
    return jsonify({"message": "Plugin installed successfully"}), 200


@app.route('/plugin-marketplace/uninstall/<plugin_name>', methods=['GET'])
def uninstall_plugin(plugin_name):
    plugin_json_path = os.path.join(PLUGIN_MARKETPLACE_DIR, f"{plugin_name}.json")
    if not os.path.exists(plugin_json_path):
        return jsonify({"error": "Plugin not found"}), 404
    
    with open(plugin_json_path, 'r') as f:
        plugin_metadata = json.load(f)
    
    package = plugin_metadata['package']
    # Remove the apt package
    try:
         subprocess.run(['apt', 'remove', '-y', package], check=True)
    except subprocess.CalledProcessError as e:
         # Try to fix broken packages automatically
        print("Running 'dpkg --configure -a' to try and fix broken packages automatically")
        try:
            subprocess.run(["dpkg", "--configure", "-a"])
        except subprocess.CalledProcessError as e:
            return jsonify({"error": "Failed to remove plugin", "details": str(e)}), 500
    
    return jsonify({"message": "Plugin uninstalled successfully"}), 200


@app.route('/plugin-marketplace/start/<plugin_name>', methods=['GET'])
def start_plugin(plugin_name):
    plugin_json_path = os.path.join(PLUGIN_MARKETPLACE_DIR, f"{plugin_name}.json")
    print(plugin_json_path)
    if not os.path.exists(plugin_json_path):
        return jsonify({"error": "Plugin not found"}), 404
    
    # Start the systemd service
    try:
        subprocess.run(['systemctl', 'start', f'{plugin_name}.service'], check=True)
    except subprocess.CalledProcessError as e:
        return jsonify({"error": "Failed to start plugin service", "details": str(e)}), 500
    
    return jsonify({"message": "Plugin started successfully"}), 200


@app.route('/plugin-marketplace/stop/<plugin_name>', methods=['GET'])
def stop_plugin(plugin_name):
    plugin_json_path = os.path.join(PLUGIN_MARKETPLACE_DIR, f"{plugin_name}.json")
    if not os.path.exists(plugin_json_path):
        return jsonify({"error": "Plugin not found"}), 404

    # Stop the systemd service
    try:
        subprocess.run(['systemctl', 'stop', f'{plugin_name}.service'], check=True)
        subprocess.run(['systemctl', 'disable', f'{plugin_name}.service'], check=True)
    except subprocess.CalledProcessError as e:
        return jsonify({"error": "Failed to stop plugin service", "details": str(e)}), 500
    
    return jsonify({"message": "Plugin stopped and disabled successfully"}), 200


@app.route('/gpu/usage/memory/<id>', methods=['GET'])
def get_gpu_usage(id):
    total, reserved, used, free = None, None, None, None
    try:
        output = subprocess.check_output(['nvidia-smi', '-q', '-i', id, '-d', 'MEMORY'])
        lines = [line.strip() for line in output.decode('utf-8').split('\n')]
        seek_done = False
        for line in lines:
            # Seek to line that contains "FB Memory Usage"
            if not seek_done:
                if "FB Memory Usage" == line:
                    seek_done = True
                continue
            # Extract the following fields: Total, Reserved, Used, and Free
            if "Total" in line:
                total = int(line.split(":")[1].strip().split()[0])
            elif "Reserved" in line:
                reserved = int(line.split(":")[1].strip().split()[0])
            elif "Used" in line:
                used = int(line.split(":")[1].strip().split()[0])
            elif "Free" in line:
                free = int(line.split(":")[1].strip().split()[0])
            
            if total is not None and reserved is not None and used is not None and free is not None:
                break
        
        if total is None or reserved is None or used is None or free is None:
            return jsonify({"error": "Failed to parse GPU usage output"}), 500

        return jsonify({"total": total, "reserved": reserved, "used": used, "free": free})
    except subprocess.CalledProcessError as e:
        return jsonify({"error": "Failed to get GPU usage", "details": str(e)}), 500


@app.route('/')
def root():
    return app.send_static_file('index.html')


if __name__ == '__main__':
    app.run(host="0.0.0.0")
