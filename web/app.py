#!/usr/bin/env python3

from flask import Flask

app = Flask(__name__)
app.static_folder = 'static'

@app.route('/')
def root():
    return app.send_static_file('root.html')
