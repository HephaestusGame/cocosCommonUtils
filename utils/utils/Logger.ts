import DebugManager from '../manager/DebugManager';
const LOG_LEVEL = { DEBUG: 1, INFO: 2, WARN: 3, ERROR: 4, FATAL: 5, NONE: 6 };
const LEVEL_NAMES = ['DEBUG', 'INFO ', 'WARN ', 'ERROR', 'FATAL'];

let globalLevel = 0;
let outputFuncArr = [];
let isLogFuncName = false;
const useColor = true;

export default class Logger {

	static LOG_LEVEL = LOG_LEVEL;
	static LOG_TO_DEBUG_CONSOLE: boolean = false;

	_tag = '';
	_extraTag = '';
	_enabled = false;

	constructor(tag, enabled = true) {
		this._tag = tag;
		this._extraTag = null;
		this._enabled = (enabled === undefined || enabled);
	}

	static setLevel(level) {
		globalLevel = level;
	}

	static addOutputFunc(func) {
		if (func && typeof func === 'function' && outputFuncArr.indexOf(func) === -1) {
			outputFuncArr.push(func);
		}
	}

	set enabled(b) {
		this._enabled = b;
	}

	get tag() {
		return this._tag;
	}

	set tag(value) {
		this._tag = value || this._tag;
	}

	get extraTag() {
		return this._extraTag;
	}

	set extraTag(tag) {
		this._extraTag = tag;
	}

	debug(...args) {
		if (this._enabled) {
			if (Logger.LOG_TO_DEBUG_CONSOLE) {
				let info = args[0];
				if (args[1]) {
					info += JSON.stringify(args[1]);
				}
				DebugManager.getInstance().debug(info)
			} 
			this._log(LOG_LEVEL.DEBUG, args);
		}
	}

	info(...args) {
		if (this._enabled) {
			if (Logger.LOG_TO_DEBUG_CONSOLE) {
				let info = args[0];
				if (args[1]) {
					info += JSON.stringify(args[1]);
				}
				DebugManager.getInstance().info(info)
			}
			this._log(LOG_LEVEL.INFO, args);
		}
	}

	warn(...args) {
		if (this._enabled) {
			if (Logger.LOG_TO_DEBUG_CONSOLE) {
				let info = args[0];
				if (args[1]) {
					info += JSON.stringify(args[1]);
				}
				DebugManager.getInstance().warn(info)
			}
			this._log(LOG_LEVEL.WARN, args);
		}
	}

	error(...args) {
		if (this._enabled) {
			if (Logger.LOG_TO_DEBUG_CONSOLE) {
				let info = args[0];
				if (args[1]) {
					info += JSON.stringify(args[1]);
				}
				DebugManager.getInstance().error(info)
			}
			this._log(LOG_LEVEL.ERROR, args);
		}
	}

	fatal(...args) {
		if (this._enabled) {
			this._log(LOG_LEVEL.FATAL, args);
		}
	}

	_log(level, args) {
		if (level >= globalLevel) {
			if (args && args.length > 0) {
				let msg = '';
				let extraArgs = [];
				if(useColor) {
					msg = `%c[%c${LEVEL_NAMES[level - 1]}%c][%c${this._tag}%c]`;
					extraArgs.push('color:black;');
					//['DEBUG', 'INFO ', 'WARN ', 'ERROR', 'FATAL'];
					extraArgs.push([
						'color:gray;',
						'color:green;',
						'color:yellow;',
						'color:red;',
						'color:red;'
					][level - 1]);
					extraArgs.push('color:black;');
					extraArgs.push('color:blue;font-weight:bold;');
					extraArgs.push('color:black;font-weight:normal;');
				} else {
					msg = `[${LEVEL_NAMES[level - 1]}][${this._tag}]`;
				}

				if (this._extraTag && this._extraTag !== '') {
					if(useColor) {
						msg += '%c' + this._extraTag + '%c ';
						extraArgs.push('color:blue;');
						extraArgs.push('color:black;');
					} else {
						msg += this._extraTag + ' ';
					}
				} else {
					msg += ' ';
				}

				if (isLogFuncName) {
					let funcName = this._getCallFuncName();
					if (funcName) {
						msg += funcName;
					}
				}

				for (let i = 0; i < args.length; i++) {
					if (i > 0) {
						msg += ' ';
					}
					let arg = args[i];
					if (arg === null || arg === undefined) {
						msg += String(arg);
					} else {
						let typo = typeof(arg);
						if (['string', 'number', 'boolean'].indexOf(typo) !== -1) {
							msg += arg;
						} else if (arg instanceof Error) {
							msg += 'Error => ';
							if (arg.name) {
								msg += `name:${arg.name} `;
							}
							if (arg.message) {
								msg += `msg:${arg.message} `;
							}
							if (arg.stack) {
								msg += `stack:\n${arg.stack}`;
							}
						} else {
							try {
								msg += JSON.stringify(arg);
							} catch(err) {
								msg += '[Object]'
							}
						}
					}
				}
				this._logToOutputFuncs.apply(this, [level, msg].concat(extraArgs));
			}
		}
	}

	_getCallFuncName() {
		try {
			let stack = new Error().stack.split(/\n/g)[4].trim();
			let from = stack.indexOf('.');
			let to = stack.indexOf('(');
			if (from !== -1 && to !== -1) {
				return stack.substring(from + 1, to - 1);
			}
		} catch (err) {
			console && console.log(err);
		}
		return null;
	}

	_logToOutputFuncs(level, msg, ...params) {
		for (let i = 0; i < outputFuncArr.length; i++) {
			let logFunc = outputFuncArr[i];
			try {
				logFunc(level, msg, ...params);
			} catch (err) {
				console.log(`{err.name}:${err.message}\n'${err.stack}`);
			}
		}
	}
}

if(console) {
	Logger.addOutputFunc(function(level, msg, ...params) {
		let args = [msg].concat(params);
		switch (level) {
			case LOG_LEVEL.DEBUG:
				console.log.apply(null, args);
				break;
			case LOG_LEVEL.INFO:
				console.log.apply(null, args);
				break;
			case LOG_LEVEL.WARN:
				console.warn.apply(null, args);
				break;
			case LOG_LEVEL.ERROR:
				console.error.apply(null, args);
				break;
			case LOG_LEVEL.FATAL:
				console.error.apply(null, args);
				break;
		}
	});
}
