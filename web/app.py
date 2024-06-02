#!/usr/bin/env python3
import subprocess
from flask import Flask, request, jsonify
import os
from datetime import datetime, timezone, timedelta
#import logging

#logging.basicConfig(level=logging.DEBUG)

# Maximum amount of patchnotes to serve to the client at once
PATCHNOTE_LIMIT = 10


app = Flask(__name__, 
            static_url_path='', 
            static_folder='static')


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
    output = subprocess.check_output(["apt", "update"]).decode("utf-8")
    if " can be upgraded." in output:
        return jsonify(hasUpdates=True)
    else:
        return jsonify(hasUpdates=False)


@app.route('/upgrade', methods=['POST'])
def upgrade():
    process = subprocess.Popen(["apt", "upgrade", "-y"])
    print(f"Starting upgrade with PID {process.pid}")
    return jsonify(pid=process.pid)


@app.route('/pid-exists/<int:pid>', methods=['GET'])
def pid_exists(pid):
    is_running = check_pid_running(pid)
    print("PID {} running?: {}".format(pid, is_running))
    return jsonify({'exists': is_running})


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


@app.route('/')
def root():
    return app.send_static_file('index.html')
