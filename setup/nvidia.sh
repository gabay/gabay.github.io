#!/bin/bash

set -e -o pipefail

echo "Nvidia: Add container toolkit GPG key..."
curl -fsSL https://nvidia.github.io/libnvidia-container/gpgkey | sudo gpg --dearmor -o /usr/share/keyrings/nvidia-container-toolkit-keyring.gpg
curl -sL https://nvidia.github.io/libnvidia-container/stable/deb/nvidia-container-toolkit.list | \
  sed 's#deb https://#deb [signed-by=/usr/share/keyrings/nvidia-container-toolkit-keyring.gpg] https://#g' | \
  sudo tee /etc/apt/sources.list.d/nvidia-container-toolkit.list

echo "Nvidia: Install Nvidia container toolkit..."
sudo apt update
sudo apt install -y nvidia-container-toolkit

echo "Nvidia: Install driver..."
# DRIVER=$(ubuntu-drivers devices 2>/dev/null | grep recommended | awk '{print $3}')
sudo apt install nvidia-driver

# title "Set Nvidia GPU as default"
# sudo prime-select nvidia
