#!/usr/bin/env python3.4

# http://cmusphinx.sourceforge.net/wiki/gstreamer
# http://cmusphinx.sourceforge.net/wiki/download
# http://stackoverflow.com/a/35467006
# http://cmusphinx.sourceforge.net/wiki/faq#qhow_to_implement_hot_word_listening
# https://syl22-00.github.io/pocketsphinx.js/live-demo-kws.html

# C170 microphone maximum sampling rate: 48000 Hz

import sys
from inspect import currentframe, getfile
from os.path import basename, splitext
import gi

try:
	gi.require_version("Gst", "1.0")
	from gi.repository import GObject, Gst
except ValueError:
	print('!speak Error. Problems with Gstreamer.')
	sys.exit(1)

scriptname = splitext(basename(getfile(currentframe())))[0]
commands = {
	"what time is it": "!time now",
	"play music": "!music play"
}

def element_message(bus, msg):
	if msg.get_structure().get_name() != "pocketsphinx":
		return

	hypothesis = msg.get_structure().get_value("hypothesis").rstrip()
#	confidence = msg.get_structure().get_value("confidence")

	if msg.get_structure().get_value("final"):
		print(commands[hypothesis])

def main():
	Gst.init(None)
	Gst.debug_set_active(False)
	GObject.threads_init()

	pipeline = Gst.parse_launch("alsasrc name=src ! audioresample ! queue name=q ! audioconvert ! audioresample ! pocketsphinx name=asr ! fakesink")

	src = pipeline.get_by_name("src")
	src.set_property("device", "hw:1")

	# https://github.com/bossjones/scarlett-ansible/blob/master/gst_launch_troubles.txt
	queue = pipeline.get_by_name("q")
	queue.set_property("silent", False)
	queue.set_property("leaky", 2)
	queue.set_property("max-size-buffers", 0)
	queue.set_property("max-size-time", 0)
	queue.set_property("max-size-bytes", 0)

	asr = pipeline.get_by_name("asr")
	asr.set_property("logfp", "/dev/null")
	asr.set_property("dict", "/usr/local/share/pocketsphinx/model/en-us/cmudict-en-us.dict")
	asr.set_property("lm", "/usr/local/share/pocketsphinx/model/en-us/en-us.lm.bin")
	asr.set_property("hmm", "/usr/local/share/pocketsphinx/model/en-us/en-us/")
	asr.set_property("kws", "./{0}.txt".format(scriptname))

	bus = pipeline.get_bus()
	bus.add_signal_watch()
	bus.connect("message::element", element_message)

	loop = GObject.MainLoop()

	try:
		pipeline.set_state(Gst.State.PLAYING)
		loop.run()
	except KeyboardInterrupt:
		pipeline.set_state(Gst.State.NULL)
		loop.quit()
		print()

if __name__ == "__main__":
	main()
