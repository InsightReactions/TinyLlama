#!/bin/bash
set -e

rsync -avz -e ssh ./ tinyllama@192.168.122.204:~/TinyLlama
xdg-open http://192.168.122.204

ssh tinyllama@192.168.122.204 -t "sudo ~/TinyLlama/install_tinyllama.sh"

ssh tinyllama@192.168.122.204 -t "sudo ~/TinyLlama/configure_tinyllama.sh"