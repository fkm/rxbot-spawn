// NPM Dependencies
const { filter } = require('rxjs/operators');
const assert = require('assert');

const Service = require('./service');

/**
 * @type {Object}
 * @property {string} defaults.logLevel='error'
 */
let defaults = {
	logLevel: 'error'
};

class Module {
	/**
	 * @param {Client} client
	 * @param {object} options
	 */
	constructor(client, options) {
		assert(options.service && options.service.length > 0);
		assert(options.channel && options.channel.length > 1);

		/** @type {object} */
		this.settings = { ...defaults, ...options };

		this.service = new Service(this.settings.service);

		//  ____  _
		// / ___|| |_ _ __ ___  __ _ _ __ ___  ___
		// \___ \| __| '__/ _ \/ _` | '_ ` _ \/ __|
		//  ___) | |_| | |  __/ (_| | | | | | \__ \
		// |____/ \__|_|  \___|\__,_|_| |_| |_|___/
		//

		let shutdown$ = client.raw$.pipe(
			filter(message => message.command === 'ERROR'),
			filter(message => message.args[0].startsWith('Closing Link'))
		);

		let bang$ = client.raw$.pipe(
			filter(message => message.command === 'PRIVMSG'),
			filter(message => message.args[0] === this.settings.channel),
			filter(message => this.service.command.test(message.args[1]))
		);

		//  ____        _                   _       _   _
		// / ___| _   _| |__  ___  ___ _ __(_)_ __ | |_(_) ___  _ __  ___
		// \___ \| | | | '_ \/ __|/ __| '__| | '_ \| __| |/ _ \| '_ \/ __|
		//  ___) | |_| | |_) \__ \ (__| |  | | |_) | |_| | (_) | | | \__ \
		// |____/ \__,_|_.__/|___/\___|_|  |_| .__/ \__|_|\___/|_| |_|___/
		//                                   |_|
		//

		bang$.subscribe(message => {
			console.log('=== bang$ ===');
			console.log(message);

			this.service.send(message.args[1]);

			console.log('=== /bang$ ===');
		});

		shutdown$.subscribe(message => {
			console.log('=== shutdown$ ===');
			this.service.stop();
			console.log('=== /shutdown$ ===');
		});

		this.service.subscribe(
			data => {
				if (data.charAt(0) === '!') {
					client.say(this.settings.channel, data);
				}
				console.log(data)
			},
			error => console.log(error),
			code => console.log(code)
		);
	}
}

module.exports = Module;
