#!/usr/bin/python3.4
# Don't forget to install python3-espeak

from sys import stdin
from espeak import espeak
from time import sleep

try:
	while True:
		line = stdin.readline()

		if line == '':
			continue

		espeak.synth(line.rstrip('\n'))
		while espeak.is_playing():
			sleep(1)

except KeyboardInterrupt:
	pass
