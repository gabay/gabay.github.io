#!/bin/bash

set -e -o pipefail

# reference: https://askubuntu.com/questions/141866/keep-ubuntu-server-running-on-a-laptop-with-the-lid-closed
sudo sed -i 's/#HandleLidSwitch=.*/HandleLidSwitch=ignore/' /etc/systemd/logind.conf
sudo sed -i 's/#LidSwitchIgnoreInhibited=.*/LidSwitchIgnoreInhibited=no/' /etc/systemd/logind.conf
sudo service systemd-logind restart
