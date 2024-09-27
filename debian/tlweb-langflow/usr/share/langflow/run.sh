#!/bin/bash

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/.venv/bin/activate"
python -m langflow run --host 0.0.0.0 --port 8081 --env-file "$SCRIPT_DIR/.env" 
