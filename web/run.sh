#!/bin/bash

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

if [ ! -d "venv" ]; then
    python3 -m venv ./venv
fi

source venv/bin/activate
pip install -r requirements.txt

export TL_TESTING=True
python3 -m gunicorn -w 2 -k gevent 'app:app'
