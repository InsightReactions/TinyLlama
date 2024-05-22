#!/bin/bash

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$(dirname "$SCRIPT_DIR/../..")" && pwd)"

if ! command -v avahi-browse &> /dev/null; then
    echo "avahi-browse could not be found. Installing..."
    sudo apt install -y avahi-daemon
fi

rsync -az -e ssh $SCRIPT_DIR/os_baseline.sh tinyllama@192.168.122.204:/tmp/
xdg-open http://192.168.122.204 
ssh tinyllama@192.168.122.204 -t "sudo /tmp/os_baseline.sh"

server=$(avahi-browse -art | grep -a2 "Tiny Llama" | grep address | cut -d'[' -f2 | cut -d']' -f1)
if [ -z "$server" ]; then
    echo "Error: Server is empty." >&2
    exit 1
else
    echo "Detected Tiny Llama Server: $server"
fi
