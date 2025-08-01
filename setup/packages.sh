#!/bin/bash

set -e -o pipefail

echo "Packages: Update..."
sudo apt update

echo "Packages: Upgrade..."
sudo apt upgrade -y

echo "Packages: Install..."
sudo nala install -y \
  vim htop python3 \
  bind9-dnsutils curl
