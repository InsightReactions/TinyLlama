#!/bin/bash
set -e

# Post-OS Setup

if [ "$(id -u)" != 0 ]; then
    echo "This script must be run as root or with superuser privileges."
    exit 1
fi

# Docker
apt update && apt-get install -y ca-certificates curl

install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/debian/gpg -o /etc/apt/keyrings/docker.asc
chmod a+r /etc/apt/keyrings/docker.asc

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/debian \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  tee /etc/apt/sources.list.d/docker.list > /dev/null

# NVIDIA Container Toolkit for Docker
curl -fsSL https://nvidia.github.io/libnvidia-container/gpgkey | gpg --dearmor -o /usr/share/keyrings/nvidia-container-toolkit-keyring.gpg \
&& curl -s -L https://nvidia.github.io/libnvidia-container/stable/deb/nvidia-container-toolkit.list | \
    sed 's#deb https://#deb [signed-by=/usr/share/keyrings/nvidia-container-toolkit-keyring.gpg] https://#g' | \
    tee /etc/apt/sources.list.d/nvidia-container-toolkit.list
    
apt update && apt-get install -y nvidia-container-toolkit docker-ce docker-ce-cli containerd.io

# InsightReactions repository
# Install the InsightReactions GPG key
curl -s --compressed "https://debian.insightreactions.com/KEY.gpg" | gpg --dearmor | sudo tee /etc/apt/trusted.gpg.d/insightreactions.gpg >/dev/null

# Download the InsightReactions apt sources list
curl -s --compressed -o /etc/apt/sources.list.d/insightreactions.list "https://debian.insightreactions.com/insightreactions.list"

# Install the packages
apt update && apt-get install -y tinyllama tinyllama-mdns ollama open-webui stableswarmui

# Ollama
#ollama pull yi
#ollama pull llama3:instruct
#ollama pull codeqwen:chat
#ollama pull codeqwen:code

# StableSwarmUI
# Download models...
