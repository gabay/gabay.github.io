#!/bin/sh

set -e -o pipefail

function title {
  echo "*"
  echo "*" $*
  echo "*"
}

title "Packages"
curl -sS https://gabay.github.io/setup/packages.sh | sh

title "Nvidia"
curl -sS https://gabay.github.io/setup/nvidia.sh | sh

title "Docker"
curl -sS https://gabay.github.io/setup/docker.sh | sh

title "Starship"
curl -sS https://gabay.github.io/setup/starship.sh | sh
