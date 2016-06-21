'use strict';

const Rx = require('rxjs/Rx');
const irc = require('irc');
const assert = require('assert');
const moment = require('moment');

const path = require('path');
const Socket = require('net').Socket;
const spawn = require('child_process').spawn;

const RxbotLogger = require('rxbot-logger');

function MicroService(service_name) {
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
		console.error(error);
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

let defaults = {
	logLevel: 'error'
};

function Handler(client, options) {
	assert(this instanceof Handler);
//	assert(client instanceof irc.Client);
	assert(options.service && options.service.length > 0);

	//  ____                            _   _
	// |  _ \ _ __ ___  _ __   ___ _ __| |_(_) ___  ___
	// | |_) | '__/ _ \| '_ \ / _ \ '__| __| |/ _ \/ __|
	// |  __/| | | (_) | |_) |  __/ |  | |_| |  __/\__ \
	// |_|   |_|  \___/| .__/ \___|_|   \__|_|\___||___/
	//                 |_|
	//

	this.settings = Object.assign({}, defaults, options);

	this.logger = new RxbotLogger();
	this.logger.logLevel = this.settings.logLevel;

	this.microservice = new MicroService(this.settings.service);

	//  ____  _
	// / ___|| |_ _ __ ___  __ _ _ __ ___  ___
	// \___ \| __| '__/ _ \/ _` | '_ ` _ \/ __|
	//  ___) | |_| | |  __/ (_| | | | | | \__ \
	// |____/ \__|_|  \___|\__,_|_| |_| |_|___/
	//

	let rawStream = Rx.Observable.fromEvent(client, 'raw');

	let channelStream = rawStream.filter(message => {
		return message.command === 'PRIVMSG' && message.args[0] === this.settings.channel;
	});

	let bangStream = channelStream.filter(message => {
		return this.microservice.command.test(message.args[1]);
	});

	//  ____        _                   _       _   _
	// / ___| _   _| |__  ___  ___ _ __(_)_ __ | |_(_) ___  _ __  ___
	// \___ \| | | | '_ \/ __|/ __| '__| | '_ \| __| |/ _ \| '_ \/ __|
	//  ___) | |_| | |_) \__ \ (__| |  | | |_) | |_| | (_) | | | \__ \
	// |____/ \__,_|_.__/|___/\___|_|  |_| .__/ \__|_|\___/|_| |_|___/
	//                                   |_|
	//

	bangStream.subscribe(message => {
		this.logger.log('debug', '=== bangStream ===');
		this.logger.log('debug', message);

		if (this.microservice.isRunning) {
			this.microservice.send(message.args[1]);
		} else {
			this.logger.log('error', 'Microservice not running!');
		}

		this.logger.log('debug', '=== /bangStream ===');
	});
}

module.exports = Handler;
