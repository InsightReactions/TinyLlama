#!/bin/bash

if ! command -v avahi-browse &> /dev/null; then
    echo "avahi-browse could not be found. Installing..."
    sudo apt install -y avahi-daemon
fi

rsync -avz -e ssh --exclude .venv/ ./ tinyllama@192.168.122.204:~/TinyLlama
xdg-open http://192.168.122.204
ssh tinyllama@192.168.122.204 -t "sudo ~/TinyLlama/install_tinyllama.sh"
ssh tinyllama@192.168.122.204 -t "sudo ~/TinyLlama/configure_tinyllama.sh"

server=$(avahi-browse -art | grep -a2 "Tiny Llama" | grep address | cut -d'[' -f2 | cut -d']' -f1)
if [ -z "$server" ]; then
    echo "Error: Server is empty." >&2
    exit 1
else
    echo "Detected Tiny Llama Server: $server"
fi
