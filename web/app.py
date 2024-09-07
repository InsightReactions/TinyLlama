#!/usr/bin/env python3
import subprocess
from flask import Flask, request, jsonify, send_from_directory
import os
from datetime import datetime, timezone
import logging
import json
import jsonschema
import re

TL_TESTING = bool(os.environ.get('TL_TESTING', False))
if TL_TESTING:
    logging.basicConfig(level=logging.DEBUG)

PLUGIN_MARKETPLACE_DIR = "/usr/share/tinyllama/plugin-marketplace"

# Maximum amount of patchnotes to serve to the client at once
PATCHNOTE_LIMIT = 10

app = Flask("Tiny Llama Service",
            static_url_path='',
            static_folder='static')
app.config["JSON_AS_ASCII"] = False
app.config["JSONIFY_MIMETYPE"] = "application/json; charset=utf-8"


def get_default_route_ip():
    """
    This function retrieves the default route IP address of the system.
    It uses the 'ip route' command to get the output, then parses the output to find the line containing 'default'.
    If such a line is found, it searches for the word 'src' and returns the next word in the line as the IP address.
    If no default route is found or if the 'src' keyword is not present, the function returns None.

    Returns:
        str or None: The default route IP address of the system if found; otherwise, None.
    """
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
    """
    This function checks if a process with the given PID is currently running.

    Args:
        pid (int): The Process ID to be checked.

    Returns:
        bool: True if a process with the given PID is running; otherwise, False.
    """
    # Use ps command to search for a process with the given PID
    result = subprocess.run(
        ['ps', '-q', str(pid), '-o', 'comm='], stdout=subprocess.PIPE)

    # If ps finds a matching process, return True
    if result.stdout:
        return True

    # Otherwise, return False
    return False


def get_patchnote_files(since: datetime):
    """
    This function searches for patchnotes in a specified directory that were created after a given date.

    Args:
        since (datetime): The date and time after which to search for patchnotes.

    Returns:
        tuple[list[str], list[datetime]]: A tuple containing two lists - one with the filepaths of the relevant patchnotes,
                                           and another with their corresponding creation times. Both lists are empty if there is an issue
                                           accessing the directory or no patchnotes were found that meet the criteria.
    """
    share_dir = '/etc/tinyllama/patchnotes.d/'  # Added a trailing slash to ensure correct path concatenation
    filepaths = []
    creation_times = []

    if not os.path.exists(share_dir):
        print(f"Directory '{share_dir}' does not exist.")
        return filepaths, creation_times

    for filename in os.listdir(share_dir):
        # Use os.path.join to ensure correct path concatenation
        filepath = os.path.join(share_dir, filename)
        if os.path.isfile(filepath):
            # Get the creation time of the file
            creation_time = datetime.fromtimestamp(
                os.stat(filepath).st_ctime, tz=timezone.utc)

            # Strip off microseconds from the creation_time (since they are not supported by the client)
            creation_time = creation_time.replace(microsecond=0)

            # Print the comparisons between dates
            print(f"Comparing {creation_time} > {since} = {creation_time > since}")

            # Check if the file was created after the provided `since` date
            if creation_time > since:
                filepaths.append(filepath)
                creation_times.append(creation_time)

    print(f"Found {len(filepaths)} patchnotes since {since}")
    return filepaths, creation_times


def find_patchnotes(since):
    """
    This function finds and returns a list of patchnote files that were created after a given date.
    For each file, it also reads its content and includes it in the output.

    Args:
        since (datetime): The date and time after which to search for patchnotes.

    Returns:
        list[dict]: A list of dictionaries, where each dictionary contains metadata about a patchnote file.
                    Each dictionary has 'filename', 'creationTime', and 'content' keys.
                    If no patchnotes were found that meet the criteria, an empty list is returned.
    """
    filepaths, creation_times = get_patchnote_files(since)

    # Sort filepaths based on creation_times, and take the top PATCHNOTE_LIMIT most recent filepaths
    sorted_filepaths = sorted(zip(filepaths, creation_times), reverse=True)[
        0:PATCHNOTE_LIMIT]

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


def get_service_active(service):
    """
    This function checks if a given service is currently active using systemctl.
    Args:
        service (str): The name of the service to check.

    Returns:
        bool: True if the service is active; False otherwise or in case of any error.
              Also prints an error message if there's a problem checking the service status.
    """
    try:
        result = subprocess.run(
            ["systemctl", "is-active", service], capture_output=True, text=True)
        return result.stdout.strip() == "active"
    except Exception as e:
        print(f"Error checking service status for {service}: {e}")
        return False


def restart_services(services, only_running=True):
    """
    This function restarts a list of services using systemctl.

    Args:
        services (list[str]): A list of service names to be restarted.
        only_running (bool, optional): If True, only running services from the list will be restarted. Default is True.

    Returns:
        dict: A dictionary with the result of the operation for each service.
              The keys are service names and values are dictionaries with 'success' as boolean
              and 'message' or 'error' as string.
    """
    results = {}
    for service in services:
        try:
            if not get_service_active(service):
                print(f"Unable to restart {service}: service is not running")
                results[service] = {"success": only_running,
                                    "error": f"Service '{service}' is not running"}
                continue

            subprocess.run(['systemctl', 'restart',
                            f'{service}.service'], check=True)
            results[service] = {"success": True,
                                "message": "Service restarted successfully"}
        except subprocess.CalledProcessError as e:
            results[service] = {"success": False, "error": str(e)}
    return jsonify(results), 200 if all([result["success"] for result in results.values()]) else 500


@app.route('/has-updates', methods=['GET'])
def has_updates():
    """
    This function checks for available updates on the system by running 'apt update'.

    Returns:
        dict: A dictionary with a single key 'hasUpdates' and a boolean value indicating if there are updates available.
              If an error occurs during the check, it returns False and prints the error message.
    """
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
    """
    This function initiates a system upgrade by starting the 'tinyllama-upgrade' service using systemctl.

    Returns:
        dict: A dictionary with a single key 'message' and a string value indicating the result of the operation.
              If the service is started successfully, it returns "Upgrade started successfully".
    """
    subprocess.run(["systemctl", "start", "tinyllama-upgrade"])
    return jsonify({"message": "Upgrade started successfully"})


@app.route("/upgrade/status")
def check_upgrade_status():
    """
    This function checks the status of the 'tinyllama-upgrade' service and retrieves any error messages if it has failed.
    It attempts to automatically fix broken packages using 'dpkg --configure -a'.

    Returns:
        dict: A dictionary with two keys: 'state', which contains the current state of the service, and 'errorMessage',
              which is a string that contains any error messages if the service has failed. If the service is not in a
              failed state, 'errorMessage' will be an empty string.
    """
    # Run shell command to get systemd service status and parse output
    result = subprocess.run(
        ["systemctl", "is-active", "tinyllama-upgrade"], capture_output=True, text=True)
    state = result.stdout.strip()
    if state == "failed":
        result = subprocess.run(["journalctl", "-u", "tinyllama-upgrade", "--since",
                                "1 minutes ago", "--no-pager"], capture_output=True, text=True)
        error_message = result.stdout.strip()

        # Try to fix broken packages automatically
        print("Running 'dpkg --configure -a' to try and fix broken packages automatically")
        subprocess.run(["dpkg", "--configure", "-a"])
    else:
        error_message = ""
    return jsonify({"state": state, "errorMessage": error_message})


@app.route('/default-route', methods=['GET'])
def default_route():
    """
    This function retrieves the IP address of the default route and returns it as a JSON response.

    Returns:
        dict: A dictionary with a single key 'defaultRoute' and a string value containing the IP address of the default route.
    """
    DEFAULT_ROUTE = get_default_route_ip()
    print("Default route IP:", DEFAULT_ROUTE)
    return jsonify(defaultRoute=DEFAULT_ROUTE)


@app.route('/patchnotes', methods=['GET'])
def get_patchnotes():
    """
    This function retrieves patch notes since a specified date in ISO format.

    Parameters:
        since (str, optional): A string representing the date since which to retrieve patch notes. Should be in ISO format. Default is 1970-01-01T00:00:00Z.

    Returns:
        dict: A dictionary with a single key 'patchnotes' and a list of dictionaries as value. Each dictionary contains the filename, creation time, and content of a patch note file. The list is sorted by creation time in descending order.

    Example:
        To retrieve patch notes since 2023-01-01T00:00:00Z, use /patchnotes?since=2023-01-01T00:00:00Z in the GET request.
    """
    since_str = request.args.get('since') or '1970-01-01'
    try:
        since_date = datetime.fromisoformat(since_str)
    except:
        since_date = datetime(1970, 1, 1, tzinfo=timezone.utc)

    print("fetching patchnotes since", since_date)
    patchnotes = list(find_patchnotes(since_date))

    # Sort patchnotes by creation time in descending order
    patchnotes.sort(key=lambda x: x['creationTime'], reverse=True)

    return jsonify(patchnotes=patchnotes)


@app.route('/plugin-marketplace/<plugin_file>', methods=['GET'])
def get_plugin_file(plugin_file):
    """
    This function returns a plugin file from the plugin marketplace directory.

    Parameters:
        plugin_file (str): The name of the plugin file to be returned.

    Returns:
        send_from_directory: A Flask function that sends the requested plugin file as an attachment, or a 404 error if the file is not found.
    """
    return send_from_directory(PLUGIN_MARKETPLACE_DIR, plugin_file)


@app.route('/plugin-marketplace/status/<plugin_name>', methods=['GET'])
def get_plugin_state(plugin_name):
    """
    This function checks if a plugin is installed and its active status.

    Parameters:
        plugin_name (str): The name of the plugin to be checked.

    Returns:
        dict: A dictionary with two keys: 'installed' and 'active'. Both values are booleans.
              'installed' is True if the plugin service file exists in /etc/systemd/system/, False otherwise.
              'active' is True if the plugin service is active, False otherwise. If the plugin is not installed, 'active' will be False.
    """
    installed = os.path.exists(
        "/etc/systemd/system/" + plugin_name + ".service")
    active = False
    if installed:
        active = get_service_active(plugin_name)

    return jsonify(installed=installed, active=active)


@app.route('/plugin-marketplace/list', methods=['GET'])
def get_plugins():
    """
    This function lists all available plugins in the plugin marketplace directory.

    Returns:
        dict: A dictionary with a single key 'plugins' and a list of strings as value. Each string is the name of a plugin, without the '.json' extension.
    """
    # Open the PLUGIN_MARKETPLACE_DIR directory and list all json files in it
    plugins = []
    for filename in os.listdir(PLUGIN_MARKETPLACE_DIR):
        if filename.endswith(".json"):
            # Append the filenames without the extension to the plugins list
            plugins.append(filename[:-5])

    return jsonify(plugins=plugins)


@app.route('/plugin-marketplace/install/<plugin_name>', methods=['GET'])
def install_plugin(plugin_name):
    """
    This function installs a plugin from the plugin marketplace directory by its name.

    Parameters:
        plugin_name (str): The name of the plugin to be installed.

    Returns:
        dict: A dictionary with two keys: 'message' and 'error'. If the installation is successful, 'message' will contain a success message. Otherwise, 'error' will contain an error message and the HTTP response code will be 500 or 404.
    """
    plugin_json_path = os.path.join(
        PLUGIN_MARKETPLACE_DIR, f"{plugin_name}.json")
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
        subprocess.run(['systemctl', 'enable',
                        f'{plugin_name}.service'], check=True)
        subprocess.run(['systemctl', 'start',
                        f'{plugin_name}.service'], check=True)
    except subprocess.CalledProcessError as e:
        return jsonify({"error": "Failed to start plugin service", "details": str(e)}), 500

    return jsonify({"message": "Plugin installed successfully"}), 200


@app.route('/plugin-marketplace/uninstall/<plugin_name>', methods=['GET'])
def uninstall_plugin(plugin_name):
    """
    This function uninstalls a plugin from the system by its name.

    Parameters:
        plugin_name (str): The name of the plugin to be uninstalled.

    Returns:
        dict: A dictionary with two keys: 'message' and 'error'. If the uninstallation is successful, 'message' will contain a success message. Otherwise, 'error' will contain an error message and the HTTP response code will be 500 or 404.
    """
    plugin_json_path = os.path.join(
        PLUGIN_MARKETPLACE_DIR, f"{plugin_name}.json")
    if not os.path.exists(plugin_json_path):
        return jsonify({"error": "Plugin not found"}), 404

    with open(plugin_json_path, 'r') as f:
        plugin_metadata = json.load(f)

    package = plugin_metadata['package']
    # Remove the apt package
    try:
        subprocess.run(['apt', 'remove', '-y', package], check=True)
        subprocess.run(['apt', 'autoremove', '-y'])
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
    """
    This function starts a plugin service by its name.

    Parameters:
        plugin_name (str): The name of the plugin to be started.

    Returns:
        dict: A dictionary with two keys: 'message' and 'error'. If the start is successful, 'message' will contain a success message. Otherwise, 'error' will contain an error message and the HTTP response code will be 500 or 404.
    """
    plugin_json_path = os.path.join(
        PLUGIN_MARKETPLACE_DIR, f"{plugin_name}.json")
    print(plugin_json_path)
    if not os.path.exists(plugin_json_path):
        return jsonify({"error": "Plugin not found"}), 404

    # Start the systemd service
    try:
        subprocess.run(['systemctl', 'start',
                        f'{plugin_name}.service'], check=True)
    except subprocess.CalledProcessError as e:
        return jsonify({"error": "Failed to start plugin service", "details": str(e)}), 500

    return jsonify({"message": "Plugin started successfully"}), 200


@app.route('/plugin-marketplace/stop/<plugin_name>', methods=['GET'])
def stop_plugin(plugin_name):
    """
    This function stops and disables a plugin service by its name.

    Parameters:
        plugin_name (str): The name of the plugin to be stopped and disabled.

    Returns:
        dict: A dictionary with two keys: 'message' and 'error'. If the stop is successful, 'message' will contain a success message. Otherwise, 'error' will contain an error message and the HTTP response code will be 500 or 404.
    """
    plugin_json_path = os.path.join(
        PLUGIN_MARKETPLACE_DIR, f"{plugin_name}.json")
    if not os.path.exists(plugin_json_path):
        return jsonify({"error": "Plugin not found"}), 404

    # Stop the systemd service and disable it
    try:
        subprocess.run(
            ['systemctl', 'stop', f'{plugin_name}.service'], check=True)
        subprocess.run(['systemctl', 'disable',
                        f'{plugin_name}.service'], check=True)
    except subprocess.CalledProcessError as e:
        return jsonify({"error": "Failed to stop plugin service", "details": str(e)}), 500

    return jsonify({"message": "Plugin stopped and disabled successfully"}), 200


@app.route('/gpu/flush', methods=['POST'])
def flush_gpu_memory():
    """
    This function restarts specific GPU-related services to free up memory.

    Returns:
        dict: A dictionary with two keys: 'message' and 'error'. If the restart is successful, 'message' will contain a success message. Otherwise, 'error' will contain an error message and the HTTP response code will be 500.
    """
    return restart_services(["ollama", "openedai-speech", "swarmui"])


@app.route('/gpu/usage/memory/<id>', methods=['GET'])
def get_gpu_usage(id):
    """
    This function retrieves GPU usage details by its ID. It uses nvidia-smi to obtain memory usage information, parses the output, and returns a dictionary with total, reserved, used, and free memory.

    Parameters:
        id (str): The ID of the GPU for which memory usage is requested.
    Returns:
        dict: A dictionary containing 'total', 'reserved', 'used', and 'free' keys representing the GPU memory in MiB. If there's an error during execution, a dictionary with 'error' and optionally 'details' keys will be returned instead. The HTTP response code will also indicate failure (500).
    """
    total, reserved, used, free = None, None, None, None
    try:
        output = subprocess.check_output(
            ['nvidia-smi', '-q', '-i', id, '-d', 'MEMORY'])
        lines = [line.strip() for line in output.decode('utf-8').split('\n')]
        seek_done = False
        for line in lines:
            # Seek to the line that contains "FB Memory Usage"
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
    """
    This function serves the main application page when the root URL ("/") is accessed.

    Returns:
        Response: The static 'index.html' file from the application's static folder.
    """
    return app.send_static_file('index.html')


if __name__ == '__main__':
    app.run(host="0.0.0.0")
