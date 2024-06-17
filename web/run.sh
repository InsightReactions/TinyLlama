#!/bin/bash

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [ ! -d "$SCRIPT_DIR/venv" ]; then
    python3 -m venv $SCRIPT_DIR/venv
fi

source $SCRIPT_DIR/venv/bin/activate
pip install -r $SCRIPT_DIR/requirements.txt
./app.py
