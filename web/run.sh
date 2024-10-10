#!/bin/bash

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

if [ ! -d "venv" ]; then
    python3 -m venv ./venv
fi

source venv/bin/activate
echo "Updating requirements..."
pip install -r requirements.txt 2>&1 >/dev/null

export TL_TESTING=True
python3 -m gunicorn -k geventwebsocket.gunicorn.workers.GeventWebSocketWorker -b 127.0.0.1:8008 'app:app'
