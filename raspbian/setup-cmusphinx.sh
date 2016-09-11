#!/bin/bash --debugger
set -e

# https://github.com/cmusphinx/sphinxbase
# https://github.com/cmusphinx/pocketsphinx
# http://www.jamesrobertson.eu/blog/2016/jan/18/installing-pocketsphinx.html
# https://wolfpaulus.com/journal/embedded/raspberrypi2-sr/

BRANCH="master"

export LD_LIBRARY_PATH=/usr/local/lib
export PKG_CONFIG_PATH=/usr/local/lib/pkgconfig
export PYTHON=/usr/bin/python3

sudo apt-get update
sudo apt-get upgrade -y --force-yes
sudo apt-get install -y --force-yes bison libasound2-dev git-core python3-dev swig

cd $HOME
[ ! -d src ] && mkdir src
cd src
[ ! -d cmusphinx ] && mkdir cmusphinx
cd cmusphinx

[ ! -d sphinxbase ] && git clone https://github.com/cmusphinx/sphinxbase.git
[ ! -d pocketsphinx ] && git clone https://github.com/cmusphinx/pocketsphinx.git

cd sphinxbase
git checkout -t origin/$BRANCH || true
git pull
./autogen.sh
./configure --enable-fixed
make clean all
make check
sudo make install
cd ..

cd pocketsphinx
git checkout -t origin/$BRANCH || true
git pull
./autogen.sh
./configure
make clean all
make check
sudo make install
cd ..
