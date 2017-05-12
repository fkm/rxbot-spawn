#!/bin/bash
set -x
set -e

WHOAMI=$(whoami)
NODEJS_VERSION="v4.5.0"
PATH_LOCAL="/usr/local"

CPU_CORES=2

if [ ${WHOAMI} != "root" ]; then
	echo "You need to be root."
	exit 1
fi

# https://lists.freedesktop.org/archives/gstreamer-bugs/2013-May/102925.html
export LD_LIBRARY_PATH=${PATH_LOCAL}/lib/

apt-get update
apt-get upgrade -y

apt-get install -y libicu-dev

cd ${PATH_LOCAL}/src/

if [ ! -d node ]
then
	git clone https://github.com/nodejs/node.git
	cd node
else
	cd node
	make uninstall || true
	git checkout master
	git pull origin master
fi

git checkout ${NODEJS_VERSION} || true
./configure
make clean
make -j$(expr ${CPU_CORES} + 1)
make check
make install
