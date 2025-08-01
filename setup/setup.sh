#!/bin/bash

set -e -o pipefail

function title {
  echo "*"
  echo "*" $*
  echo "*"
}

title "Packages"
curl -sS https://gabay.github.io/setup/packages.sh | bash

title "Nvidia"
curl -sS https://gabay.github.io/setup/nvidia.sh | bash

title "Docker"
curl -sS https://gabay.github.io/setup/docker.sh | bash

title "Starship"
curl -sS https://gabay.github.io/setup/starship.sh | bash
