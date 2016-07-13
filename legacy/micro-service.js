'use strict';

const Rx = require('rxjs/Rx');
const irc = require('irc');
const assert = require('assert');
const moment = require('moment');

const path = require('path');
const Socket = require('net').Socket;
const spawn = require('child_process').spawn;

const RxbotLogger = require('rxbot-logger');

function Service(service_name) {
	let service_instance;
	let service_socket = new Socket();
	let service_path = path.join(__dirname, 'services', `${service_name}.py`);
	let regexp_listening = /LISTENING ON (\S+)/i;

	this.isRunning = false;
	this.command = new RegExp(`^!${service_name} (.+)$`, 'i');

	try {
		service_instance = spawn(service_path);

		service_instance.stdout.on('data', data => {
			data = data.toString();

			if (regexp_listening.test(data)) {
				let [, socket_path] = data.match(regexp_listening);

				service_socket.destroy();
				service_socket = service_socket.connect(socket_path);
				service_socket.on('close', code => this.stop());

				this.isRunning = true;
			}
		});

		service_instance.stderr.on('data', data => {
			console.error('stderr', data.toString());
		});

		service_instance.on('close', code => this.stop());
	} catch (error) {
		console.error('catch', error);
	}

	this.stop = function () {
		service_socket.destroy();
		service_instance.stdin.pause();
		service_instance.kill();

		this.isRunning = false;
	};

	this.send = function (data) {
		data = data.slice(service_name.length + 2);

		if (this.isRunning) {
			service_socket.write(data, 'utf-8');
		}
	};
}

module.exports = Service;
