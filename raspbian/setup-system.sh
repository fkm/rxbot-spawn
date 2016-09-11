#!/bin/bash
set -x
set -e

WHOAMI=$(whoami)
WLAN_CONF_PATH="/etc/wpa_supplicant/wpa_supplicant.conf"
WLAN_CONN_SSID="b11"
WLAN_CONN_PASS="paradise.bieu@burgunderweg"

if [ ${WHOAMI} != "root" ]; then
	echo "You need to be root."
	exit 1
fi

# Update APT packages
apt-get update
apt-get upgrade -y

# Update locales (install de_CH.UTF-8)
debconf-set-selections <<< "locales locales/default_environment_locale select de_CH.UTF-8"
debconf-set-selections <<< "locales locales/locales_to_be_generated multiselect de_CH.UTF-8 UTF-8, en_GB.UTF-8 UTF-8"
dpkg-reconfigure -fnoninteractive locales

# Build tools
apt-get install -y valgrind build-essential autotools-dev automake autoconf libtool autopoint pkg-config bison flex

# Other tools
apt-get install -y git-core vim tree whois dnsutils #rpi-update

# Update RPI firmware
# http://raspberrypi.stackexchange.com/questions/4355/do-i-still-need-rpi-update-if-i-am-using-the-latest-version-of-raspbian
#rpi-update

# Configure WLAN access
if grep -Fxq "network={" ${WLAN_CONF_PATH}
then
	sed -i "s/ssid=\".*\"/ssid=\"${WLAN_CONN_SSID}\"/" ${WLAN_CONF_PATH}
	sed -i "s/psk=\".*\"/psk=\"${WLAN_CONN_PASS}\"/" ${WLAN_CONF_PATH}
else
	printf "network={\n\tssid=\"${WLAN_CONN_SSID}\"\n\tpsk=\"${WLAN_CONN_PASS}\"\n}\n" >> ${WLAN_CONF_PATH}
fi
ifdown wlan0
ifup wlan0
