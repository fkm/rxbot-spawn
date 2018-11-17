const assert = require('assert');
const path = require('path');
const { spawn } = require('child_process');

function Service(name, args) {
	assert(typeof name === 'string');

	args = args || [];
	args = ['-u', path.join(__dirname, 'services', name + '.py')].concat(args);

	// TODO Find a way to execute the script directly with no buffer.
	let child = spawn('python3', args);

	// TODO Event backlog. Maybe use Rx Subjects.
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
		// TODO End process gracefully.
		child.stdin.end();
		child.kill('SIGINT');
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
