'use strict';

const assert = require('assert');
const path = require('path');
const spawn = require('child_process').spawn;

function Service(name, args) {
	assert(typeof name === 'string');

	let child = spawn(path.join(__dirname, 'services', name + '.py'), args);

	let listeners = {
		normal: function () {},
		error: function () {},
		end: function () {}
	};

	child.stdout.on('data', data => listeners.normal(data.toString()));
	child.stderr.on('data', data => listeners.error(data.toString()));
	child.on('close', code => listeners.end(code.toString()));

	this.command = new RegExp('^!' + name + ' (.+)$', 'i');

	this.send = function (message) {
		let [, command] = message.match(this.command);
		child.stdin.write(command + '\n');
	};

	this.stop = function () {
		child.stdin.end();
	};

	this.subscribe = function (normal, error, end) {
		if (normal) {
			listeners.normal = normal;
		}

		if (error) {
			listeners.error = error;
		}

		if (end) {
			listeners.end = end;
		}
	};
}

module.exports = Service;
