#!/bin/bash
# Post-OS Setup
set -eu

if [ "$(id -u)" != 0 ]; then
    echo "This script must be run as root or with superuser privileges."
    exit 1
fi

echo "Baselining the operating system will prepare and secure your operating system by disabling sleep modes, setting the default theme to Dark, updating package repository sources, installing necessary drivers and packages, configuring Docker and NVIDIA Container Toolkit for GPU acceleration, and enhancing remote desktop security."
echo "If 'n' is selected, baselining will be skipped and the Tiny Llama installation will proceed."
read -p "Would you like to baseline the operating system? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  # Configure system to not go to sleep
  systemctl mask sleep.target suspend.target hibernate.target hybrid-sleep.target

  # Set default Dark theme
  gsettings set org.gnome.desktop.interface gtk-theme 'Adwaita-dark'
  gsettings set org.gnome.desktop.interface color-scheme 'prefer-dark'

  export DEBIAN_FRONTEND=noninteractive

  # Install NVIDIA driver
  sed -i "s/bookworm main/bookworm main contrib non-free non-free-firmware/g" /etc/apt/sources.list
  apt update
  apt-get install -y nvidia-driver firmware-misc-nonfree

  # Docker
  apt-get install -y ca-certificates curl ssh

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
      
  apt update && apt-get install -y nvidia-container-toolkit docker-ce docker-ce-cli containerd.io xrdp

  #  Configure xdrp user to allow secure connections
  sudo adduser xrdp ssl-cert
fi

# InsightReactions repository
# Install the InsightReactions GPG key
curl -s --compressed "https://debian.insightreactions.com/KEY.gpg" | gpg --dearmor | sudo tee /etc/apt/trusted.gpg.d/insightreactions.gpg >/dev/null

# Download the InsightReactions apt sources list
curl -s --compressed -o /etc/apt/sources.list.d/insightreactions.list "https://debian.insightreactions.com/insightreactions.list"

# Install the packages
apt update && apt-get install -y tinyllama tinyllama-mdns tinyllama-ollama tlweb-open-webui tlweb-swarmui
