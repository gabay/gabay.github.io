#!/bin/bash

set -e -o pipefail

echo "Starship: Install..."
curl -sS https://starship.rs/install.sh | sh

echo "Starship: Download config..."
curl -sS https://gabay.github.io/setup/starship.toml -o ~/.config/starship.toml

echo "Starship: Add to .bashrc..."
echo 'eval "$(starship init bash)"' >> ~/.bashrc
eval "$(starship init bash)"

echo "Starship: Setting up YADM..."
sudo apt install yadm
yadm clone --bootstrap https://github.com/gabay/config.git
yadm checkout ~