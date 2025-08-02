#!/bin/bash

set -e -o pipefail

echo "Docker: Install..."
curl https://get.docker.com | bash

echo "Docker: Setup rootless docker..."
sudo apt-get install -y dbus-user-session

echo "Docker: Add port binding capability..."
# /usr/sbin/setcap CAP_NET_BIND_SERVICE=ep `which rootlesskit` 
sudo sh -c "echo 0 > /proc/sys/net/ipv4/ip_unprivileged_port_start"

echo "Docker: Setup rootless docker..."
dockerd-rootless-setuptool.sh install
sudo loginctl enable-linger
export DOCKER_HOST=unix:///run/user/1000/docker.sock

echo "Docker: Disable root docker..."
sudo systemctl disable --now docker.service docker.socket
sudo rm /var/run/docker.sock

# EXPERIMENTAL: setup bypassns
# rm -rf /usr/local/go
# wget https://go.dev/dl/go1.24.5.linux-amd64.tar.gz
# tar -C /usr/local -xzf go1.24.5.linux-amd64.tar.gz
# rm https://go.dev/dl/go1.24.5.linux-amd64.tar.gz
# git clone --depth 1 https://github.com/rootless-containers/bypass4netns.git
# cd bypass4netns
# sudo apt install libseccomp-dev
# make
# sudo make install
# cd -