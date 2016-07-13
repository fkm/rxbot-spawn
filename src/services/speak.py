#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import fileinput
from espeak import espeak
from time import sleep

for line in fileinput.input():
	espeak.synth(line.rstrip('\n'))
	while espeak.is_playing():
		sleep(1)
