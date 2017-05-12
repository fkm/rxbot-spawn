#!/bin/bash
# https://lists.freedesktop.org/archives/gstreamer-openmax/2013-March/000724.html
# https://wiki.matthiasbock.net/index.php/Hardware-accelerated_video_playback_on_the_Raspberry_Pi
# https://gist.github.com/sphaero/02717b0b35501ad94863
# https://gstreamer.freedesktop.org/modules/
# https://bugzilla.gnome.org/show_bug.cgi?id=740530
set -x
set -e

VERSION_GSTREAMER="1.8.1"
VERSION_ORC="orc-0.4.25"
VERSION_GST_BASE="1.8.1"
VERSION_GST_GOOD="1.8.1"
VERSION_GST_UGLY="1.8.1"
VERSION_GST_LIBAV="1.8.1"
VERSION_GST_BAD="1.8.1"
VERSION_GST_OMX="1.2.0"
VERSION_GST_PYTHON="1.8.1"

PATH_LOCAL="/usr/local"
PATH_VC="/opt/vc"
PATH_PYTHON="/usr/bin/python3"

CPU_CORES=2

# https://lists.freedesktop.org/archives/gstreamer-bugs/2013-May/102925.html
export LD_LIBRARY_PATH=${PATH_LOCAL}/lib/

apt-get update
apt-get upgrade -y

# The completely essential things
apt-get install -y \
	autoconf \
	automake \
	autopoint \
	autotools-dev \
	bison \
	build-essential \
	flex \
	git \
	libglib2.0-dev \
	libtool \
	libxml2-dev \
	pkg-config \
	python \
	valgrind \
	zlib1g-dev

# The optional dependencies of all the plugins
apt-get install -y \
	gtk-doc-tools \
	libasound2-dev \
	libgudev-1.0-dev \
	libxt-dev \
	libvorbis-dev \
	libcdparanoia-dev \
	libpango1.0-dev \
	libtheora-dev \
	libvisual-0.4-dev \
	iso-codes \
	libgtk-3-dev \
	libraw1394-dev \
	libiec61883-dev \
	libavc1394-dev \
	libv4l-dev \
	libcairo2-dev \
	libcaca-dev \
	libspeex-dev \
	libpng-dev \
	libshout3-dev \
	libjpeg-dev \
	libaa1-dev \
	libflac-dev \
	libdv4-dev \
	libtag1-dev \
	libwavpack-dev \
	libpulse-dev \
	libsoup2.4-dev \
	libbz2-dev \
	libcdaudio-dev \
	libdc1394-22-dev \
	ladspa-sdk \
	libass-dev \
	libcurl4-gnutls-dev \
	libdca-dev \
	libdirac-dev \
	libdvdnav-dev \
	libexempi-dev \
	libexif-dev \
	libfaad-dev \
	libgme-dev \
	libgsm1-dev \
	libiptcdata0-dev \
	libkate-dev \
	libmimic-dev \
	libmms-dev \
	libmodplug-dev \
	libmpcdec-dev \
	libofa0-dev \
	libopus-dev \
	librsvg2-dev \
	librtmp-dev \
	libschroedinger-dev \
	libslv2-dev \
	libsndfile1-dev \
	libsoundtouch-dev \
	libspandsp-dev \
	libx11-dev \
	libxvidcore-dev \
	libzbar-dev \
	libzvbi-dev \
	liba52-0.7.4-dev \
	libcdio-dev \
	libdvdread-dev \
	libmad0-dev \
	libmp3lame-dev \
	libmpeg2-4-dev \
	libopencore-amrnb-dev \
	libopencore-amrwb-dev \
	libsidplay1-dev \
	libtwolame-dev \
	libx264-dev \
	libvpx-dev \
	libwebp-dev \
	python-gi-dev \
	python3-dev \
	libgirepository1.0-dev \
	python3-gst-1.0

# https://bugs.launchpad.net/pomodoro-indicator/+bug/1370221
apt-get install -y \
	gir1.2-gstreamer-1.0 \
	gir1.2-gst-plugins-base-1.0

# Additional stuff
apt-get install -y \
	xinit \
	xserver-xorg-video-fbdev \
	omxplayer \
	libxv-dev \
	libwayland-dev \
	libusb-1.0 \
	libopenal-dev

cd ${PATH_LOCAL}/src/
[ ! -d gstreamer ] && mkdir gstreamer
cd gstreamer

[ ! -d gstreamer ] && git clone git://anongit.freedesktop.org/git/gstreamer/gstreamer
[ ! -d orc ] && git clone git://anongit.freedesktop.org/git/gstreamer/orc
[ ! -d gst-plugins-base ] && git clone git://anongit.freedesktop.org/git/gstreamer/gst-plugins-base
[ ! -d gst-plugins-good ] && git clone git://anongit.freedesktop.org/git/gstreamer/gst-plugins-good
[ ! -d gst-plugins-bad ] && git clone git://anongit.freedesktop.org/git/gstreamer/gst-plugins-bad
[ ! -d gst-plugins-ugly ] && git clone git://anongit.freedesktop.org/git/gstreamer/gst-plugins-ugly
[ ! -d gst-libav ] && git clone git://anongit.freedesktop.org/git/gstreamer/gst-libav
[ ! -d gst-omx ] && git clone git://anongit.freedesktop.org/git/gstreamer/gst-omx
[ ! -d gst-python ] && git clone git://anongit.freedesktop.org/git/gstreamer/gst-python

cd gstreamer
make uninstall || true
git checkout ${VERSION_GSTREAMER} || true
./autogen.sh --disable-gtk-doc
make -j$(expr ${CPU_CORES} + 1)
make install
cd ..

cd orc
make uninstall || true
git checkout ${VERSION_ORC} || true
./autogen.sh --disable-gtk-doc
make -j$(expr ${CPU_CORES} + 1)
make install
cd ..

cd gst-plugins-base
make uninstall || true
git checkout ${VERSION_GST_BASE} || true
./autogen.sh --disable-gtk-doc
make -j$(expr ${CPU_CORES} + 1)
make install
cd ..

cd gst-plugins-good
make uninstall || true
git checkout ${VERSION_GST_GOOD} || true
./autogen.sh --disable-gtk-doc
make -j$(expr ${CPU_CORES} + 1)
make install
cd ..

cd gst-plugins-ugly
make uninstall || true
git checkout ${VERSION_GST_UGLY} || true
./autogen.sh --disable-gtk-doc
make -j$(expr ${CPU_CORES} + 1)
make install
cd ..

cd gst-libav
make uninstall || true
git checkout ${VERSION_GST_LIBAV} || true
./autogen.sh --disable-gtk-doc
make -j$(expr ${CPU_CORES} + 1)
make install
cd ..

cd gst-plugins-bad
make uninstall || true
git checkout ${VERSION_GST_BAD} || true
(
	LDFLAGS="-L${PATH_VC}/lib" CPPFLAGS="-I${PATH_VC}/include -I${PATH_VC}/include/interface/vcos/pthreads -I${PATH_VC}/include/interface/vmcs_host/linux";
	./autogen.sh --disable-gtk-doc
	# No idea why this make is missing the -j option.
	make
	make install
)
cd ..

cd gst-omx
make uninstall || true
git checkout ${VERSION_GST_OMX} || true
(
	LDFLAGS="-L${PATH_VC}/lib" CPPFLAGS="-I${PATH_VC}/include -I${PATH_VC}/include/IL -I${PATH_VC}/include/interface/vcos/pthreads -I${PATH_VC}/include/interface/vmcs_host/linux";
	# --with-omx-header-path is required, despite the path being in the CPPFLAGS.
	# https://github.com/matthiasbock/gstreamer/issues/3#issuecomment-115930516
	./autogen.sh --disable-gtk-doc --with-omx-header-path=${PATH_VC}/include/IL --with-omx-target=rpi
	# No idea why this make is missing the -j option.
	make
	make install
)
cd ..

cd gst-python
git checkout ${VERSION_GST_PYTHON} || true
# --with-pygi-overrides-dir https://github.com/Kurento/bugtracker/issues/56
PYTHON=${PATH_PYTHON} ./autogen.sh --prefix=${PATH_LOCAL} --with-pygi-overrides-dir=${PATH_LOCAL}/lib/python3.4/site-packages/gi/overrides/
make -j$(expr ${CPU_CORES} + 1)
make install
cd ..
