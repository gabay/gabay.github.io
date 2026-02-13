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

# https://docs.nvidia.com/cuda/cuda-installation-guide-linux/#debian-installation
echo "Nvidia: Install driver..."
wget https://developer.download.nvidia.com/compute/cuda/repos/debian12/x86_64/cuda-keyring_1.1-1_all.deb
sudo dpkg -i cuda-keyring_1.1-1_all.deb
rm cuda-keyring_1.1-1_all.deb
sudo apt update
sudo apt install cuda-drivers
# sudo apt install cuda-toolkit
# sudo apt install nvidia-driver

# title "Set Nvidia GPU as default"
# sudo prime-select nvidia
