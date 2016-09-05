'use strict';

const Rx = require('rxjs/Rx');
const irc = require('irc');
const assert = require('assert');
const moment = require('moment');

const RxbotLogger = require('rxbot-logger');

const Service = require('./service');

let defaults = {
	logLevel: 'error'
};

function Handler(client, options) {
	assert(this instanceof Handler);
//	assert(client instanceof irc.Client);
	assert(options.service && options.service.length > 0);
	assert(options.channel && options.channel.length > 1);

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

	this.service = new Service(this.settings.service);

	//  ____  _
	// / ___|| |_ _ __ ___  __ _ _ __ ___  ___
	// \___ \| __| '__/ _ \/ _` | '_ ` _ \/ __|
	//  ___) | |_| | |  __/ (_| | | | | | \__ \
	// |____/ \__|_|  \___|\__,_|_| |_| |_|___/
	//

	let rawStream = Rx.Observable.fromEvent(client, 'raw');

	let shutdownStream = rawStream.filter(message => {
		return message.command === 'ERROR' && message.args[0].slice(0, 12) === 'Closing Link';
	});

	let channelStream = rawStream.filter(message => {
		return message.command === 'PRIVMSG' && message.args[0] === this.settings.channel;
	});

	let bangStream = channelStream.filter(message => {
		return this.service.command.test(message.args[1]);
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

		this.service.send(message.args[1]);

		this.logger.log('debug', '=== /bangStream ===');
	});

	shutdownStream.subscribe(message => {
		this.logger.log('debug', '=== shutdownStream ===');
		this.service.stop();
		this.logger.log('debug', '=== /shutdownStream ===');
	});

	this.service.subscribe(
		data => {
			if (data.charAt(0) === '!') {
				client.say(this.settings.channel, data);
			}
			this.logger.log('debug', data)
		},
		error => this.logger.log('debug', error),
		code => this.logger.log('debug', code)
	);
}

module.exports = Handler;
