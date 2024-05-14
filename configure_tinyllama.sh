#!/bin/bash

# StableSwarmUI
STABLESWARMUI_SETTINGS="/root/StableSwarmUI/Data/Settings.fds"
sed -i "s/PortCanChange: true/PortCanChange: false/g" $STABLESWARMUI_SETTINGS
sed -i "s/ClearVRAMAfterMinutes: 10/ClearVRAMAfterMinutes: 1/g" $STABLESWARMUI_SETTINGS
sed -i "s/ClearSystemRAMAfterMinutes: 60/ClearSystemRAMAfterMinutes: 5/g" $STABLESWARMUI_SETTINGS
sed -i "s/CheckForUpdates: true/CheckForUpdates: false/g" $STABLESWARMUI_SETTINGS

systemctl start stableswarmui