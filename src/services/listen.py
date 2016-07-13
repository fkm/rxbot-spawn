#!/usr/bin/env python
# -*- coding: utf-8 -*-

# http://metakermit.com/2011/python-speech-recognition-helloworld/
# http://stackoverflow.com/questions/4160175/detect-tap-with-pyaudio-from-live-mic/4160733#4160733

import sys
import os
import sphinxbase
import pocketsphinx

def decodeSpeech(hmmd, lmdir, dictp, wavfile):
	speechRec = pocketsphinx.Decoder(hmm=hmmd, lm=lmdir, dict=dictp)
	wavFile = file(wavfile, 'rb')
	wavFile.seek(44)
	speechRec.decode_raw(wavFile)
	result = speechRec.get_hyp()

	return result[0]

if __name__ == "__main__":
	hmdir = "/usr/share/pocketsphinx/model/hmm/en_US/hub4wsj_sc_8k"
	lmd = "/usr/share/pocketsphinx/model/lm/en_US/hub4.5000.DMP"
	dictd = "/usr/share/pocketsphinx/model/lm/en_US/cmu07a.dic"
	wavfile = sys.argv[1]
	recognised = decodeSpeech(hmdir, lmd, dictd, wavfile)

	print("%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%")
	print(recognised)
	print("%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%")
