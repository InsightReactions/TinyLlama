#!/bin/bash
set -e

if [ "$(id -u)" != 0 ]; then
    echo "This script must be run as root or with superuser privileges."
    exit 1
fi

get_script_dir() {
  local source="${BASH_SOURCE[0]}"
  while [ -h "$source" ] ; do
    local dir="$( cd -P "$( dirname "$source" )" && pwd )"
    source="$( readlink "$source" )"
    [[ $source != /* ]] && source="$dir/$source"
  done
  echo "$( cd -P "$( dirname "$source" )" && pwd )"
}

SCRIPT_DIR=$(get_script_dir)

cd ~

# Add tinyllama-web Service
rm /usr/lib/python3.11/EXTERNALLY-MANAGED ||:
apt-get install -y python3-pip curl git
pip install -r $SCRIPT_DIR/web/requirements.txt
cat <<EOF | tee "/etc/systemd/system/tinyllama-web.service" >/dev/null
[Unit]
Description=TinyLlama Web Service
After=network.target

[Service]
ExecStart=/usr/bin/python3 -m gunicorn -w 2 -b 0.0.0.0:80 'app:app'
WorkingDirectory=$SCRIPT_DIR/web
Restart=on-failure

[Install]
WantedBy=multi-user.target
EOF

systemctl enable tinyllama-web
systemctl start tinyllama-web

# Avahi-daemon for mDNS discovery

apt-get install -y avahi-daemon
systemctl enable avahi-daemon

cat <<EOF | tee "/etc/avahi/services/tinyllama.service" >/dev/null
<?xml version="1.0" standalone='no'?>
<!DOCTYPE service-group SYSTEM "avahi-service.dtd">
<service-group>
  <name>Tiny Llama</name>
  <service protocol="ipv4">
    <type>_http._tcp</type>
    <port>80</port>
  </service>
</service-group>
EOF

# A fix to help fix avahi services from coming down after a couple minutes
cat <<EOF | tee "/etc/cron.d/avahi" >/dev/null
*/1 * * * * root systemctl restart avahi-daemon.service
EOF

sed -i "s/use-ipv6=yes/use-ipv6=no/g" /etc/avahi/avahi-daemon.conf
sed -i "s/#publish-aaaa-on-ipv4=yes/publish-aaaa-on-ipv4=no/g" /etc/avahi/avahi-daemon.conf
sed -i "s/publish-hinfo=no/publish-hinfo=yes/g" /etc/avahi/avahi-daemon.conf
sed -i "s/publish-workstation=no/publish-workstation=yes/g" /etc/avahi/avahi-daemon.conf
systemctl start avahi-daemon

# Docker
apt update && apt install -y ca-certificates curl

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
    
apt update && apt-get install -y wget curl git python3-pip python3-venv nvidia-container-toolkit docker-ce docker-ce-cli containerd.io

# Ollama
# https://github.com/ollama/ollama/blob/main/docs/linux.md
curl -fsSL https://ollama.com/install.sh | sh

# Ollama service configuration
OLLAMA_SERVICE="/etc/systemd/system/ollama.service"
OLLAMA_HOST_STR="Environment=\"OLLAMA_HOST=0.0.0.0\""
if ! grep -q $OLLAMA_HOST_STR $OLLAMA_SERVICE; then
    line=$(grep -n "ExecStart" $OLLAMA_SERVICE | cut -d ":" -f 1)
    sed -i "${line}i ${OLLAMA_HOST_STR}" $OLLAMA_SERVICE
    systemctl daemon-reload
    systemctl restart ollama
    sleep 5
fi

#ollama pull yi
#ollama pull llama3:instruct
#ollama pull codeqwen:chat
#ollama pull codeqwen:code


# Open-WebUI
docker pull ghcr.io/open-webui/open-webui:main

# Add Open-WebUI Service
cat <<EOF | tee "/etc/systemd/system/open-webui.service" >/dev/null
[Unit]
Description=open-webui
After=network.target

[Service]
TimeoutStartSec=0
Restart=always
ExecStartPre=-/usr/bin/docker stop open-webui
ExecStartPre=-/usr/bin/docker rm open-webui
ExecStart=/usr/bin/docker run --rm -p 8080:8080 --network=host -e OLLAMA_BASE_URL=http://127.0.0.1:11434 -v /root/open-webui:/app/backend/data --name open-webui ghcr.io/open-webui/open-webui:main


[Install]
WantedBy=default.target
EOF

systemctl enable open-webui
systemctl start open-webui

# StableSwarmUI
cat <<EOF | tee "/etc/systemd/system/stableswarmui.service" >/dev/null
[Unit]
Description=StableSwarmUI Runner
After=network.target

[Service]
ExecStart=/usr/bin/bash -l -c 'PATH="$PATH:~/.dotnet"; ASPNETCORE_ENVIRONMENT="Production" ASPNETCORE_URLS="http://*:7801" dotnet src/bin/live_release/StableSwarmUI.dll'
WorkingDirectory=/root/StableSwarmUI
Restart=on-failure

[Install]
WantedBy=multi-user.target
EOF
systemctl enable stableswarmui

# CATUTION -- StableSwarmUI requires SIGINT to complete -- code added after this line is not executed
curl -fsSL https://github.com/Stability-AI/StableSwarmUI/releases/download/0.6.1-Beta/install-linux.sh | sh
