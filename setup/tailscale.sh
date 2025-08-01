#!/bin/bash

set -e -o pipefail

echo "Tailscale: Install..."
curl -fsSL https://tailscale.com/install.sh | sh
sudo tailscale set --operator=roi

echo "Tailscale: Set up..."
tailscale
tailscale up

echo "Tailscale: Forward packets and advertise exit node..."
echo 'net.ipv4.ip_forward = 1' | sudo tee -a /etc/sysctl.d/99-tailscale.conf
echo 'net.ipv6.conf.all.forwarding = 1' | sudo tee -a /etc/sysctl.d/99-tailscale.conf
sudo sysctl -p /etc/sysctl.d/99-tailscale.conf
tailscale --advertise-exit-node
