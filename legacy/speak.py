#!/usr/bin/env python3
# -*- coding: utf-8 -*-

# https://gist.github.com/jmhobbs/11276249
# https://pymotw.com/2/socket/uds.html

import os
import sys
import time
import socket
from espeak import espeak

socket_path = "{0}/speak.socket".format(os.path.dirname(os.path.abspath(__file__)))

if os.path.exists(socket_path):
	os.remove(socket_path)

print("Opening socket.", flush=True)
server = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
server.bind(socket_path)
server.listen(0)

while True:
	print("Listening on {0}".format(socket_path), flush=True)
	connection, client_address = server.accept()

	try:
		print("Connection from {0}".format(client_address), flush=True)
		while True:
			data = connection.recv(1024)
			if not data:
				break

			text = data.decode('utf-8')
			print(text, flush=True)

			espeak.synth(text)
			while espeak.is_playing():
				time.sleep(1)

	except Exception as e:
		print("Exception: {0}".format(e), flush=True);

	finally:
		print("Connection lost.", flush=True)
		connection.close()
		break

print("Removing socket.", flush=True)
os.remove(socket_path)
