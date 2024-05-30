#!/usr/bin/env python3

import subprocess
from flask import Flask, jsonify

app = Flask(__name__, 
            static_url_path='', 
            static_folder='static')

@app.route('/hasUpdates', methods=['GET'])
def has_updates():
    output = subprocess.check_output(["apt", "update"]).decode("utf-8")
    print(output)
    if " can be upgraded." in output:
        return jsonify(hasUpdates=True)
    else:
        return jsonify(hasUpdates=False)

@app.route('/upgrade', methods=['POST'])
def upgrade():
    output = subprocess.check_output(["apt", "upgrade", "-y"]).decode("utf-8")
    print(output)
    return jsonify(log=output)

@app.route('/')
def root():
    return app.send_static_file('index.html')
