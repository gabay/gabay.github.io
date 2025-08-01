#!/bin/sh

set -e -o pipefail

echo "Docker: Install..."
curl https://get.docker.com | bash

echo "Docker: Setup rootless docker..."
sudo apt-get install -y dbus-user-session

echo "Docker: Add port binding capability..."
/usr/sbin/setcap CAP_NET_BIND_SERVICE=eip `which rootlesskit` 

echo "Docker: Setup rootless..."
dockerd-rootless-setuptool.sh install