import Sequence from './Sequence';
import * as utils from './utils';
import Logger from './Logger';

const logger = new Logger('scheduler');
const sequence = new Sequence(1);

interface FrameCallbackItem {
	frames:number;
	selector:Function;
	target?:any,
	__instanceId:any,
}

interface SecondsCallbackItem {
	selector:Function;
	target?:any,
	scheduleCallback:Function,
	__instanceId:any,
}

let framesCallbacks:{[key:string]:FrameCallbackItem} = {};
let secondsCallbacks:{[key:string]:SecondsCallbackItem} = {};

const FRAME_CALLBACK_TARGET = {
	update: function():void {
		for(let id in framesCallbacks) {
			logger.debug(`[update] processing ${id}`);
			let item:FrameCallbackItem = framesCallbacks[id];
			if(item) {
				if(--item.frames <= 0) {
					logger.debug(`[update] processing ${id} complete `);
					framesCallbacks[id] = null;
					delete framesCallbacks[id];
					utils.callFuncSafelyWithTarget(item.selector, item.target);
				} else {
					logger.debug(`[update] processing ${id} left frame ${item.frames}`);
				}
			} else {
				framesCallbacks[id] = null;
				delete framesCallbacks[id];
			}
		}
		if(utils.isNullOrEmpty(framesCallbacks)) {
			logger.debug('[update] unschedule update');
			cc.director.getScheduler().unscheduleUpdate(FRAME_CALLBACK_TARGET);
		}
	},
	__instanceId: 'FRAME_CALLBACK_TARGET' + Math.random()
};

/**
 * 延迟指定的帧数执行
 * @param {function} selector 调用的函数
 * @param {any} target 函数的this参数
 * @param {number} frames 延迟的帧数，不传默认为1
 * @return {string} 本次调用计划的id，用于取消调用
 */
export function callFramesLater(selector:Function, target:any, frames:number) {
	if(arguments.length == 2 && !isNaN(target)) {
		frames = target;
		target = null;
	}
	if(isNaN(frames) || frames < 1) {
		frames = 1;
	}
	let id = String(sequence.next());
	framesCallbacks[id] = {
		selector : selector,
		target : target,
		frames : frames,
		__instanceId: 'framesCallbacks' + id
	};
	logger.debug(`callFramesLater ${id} => ${frames}`);
	if(!cc.director.getScheduler().isScheduled(FRAME_CALLBACK_TARGET.update, FRAME_CALLBACK_TARGET)) {
		logger.debug('[update] schedule update');
		cc.director.getScheduler().scheduleUpdate(FRAME_CALLBACK_TARGET, 0, false, FRAME_CALLBACK_TARGET.update);
	}
	return id;
}

/**
 * 延迟指定的秒数执行
 * @param {function} selector 调用的函数
 * @param {object} target 函数的this参数
 * @param {float} seconds 延迟的时间秒数，不传默认0.01
 * @return {string} 本次调用计划的id，用于取消调用
 */
export function delayCall(selector:Function, target:any, seconds:number) {
	if(arguments.length == 2 && !isNaN(target)) {
		seconds = target;
		target = null;
	}
	if(isNaN(seconds) || seconds <= 0) {
		seconds = 0.01;
	}
	let id = String(sequence.next());
	let callbackItem = secondsCallbacks[id] = {
		selector : selector,
		target : target,
		scheduleCallback: function() {
			let item = secondsCallbacks[id];
			secondsCallbacks[id] = null;
			delete secondsCallbacks[id];
			if(item) {
				utils.callFuncSafelyWithTarget(item.selector, item.target);
			}
		},
		__instanceId: 'secondsCallbacks' + id
	};
	cc.director.getScheduler().schedule(callbackItem.scheduleCallback, callbackItem, seconds, 0, 0, false);
	return id;
}

/**
 * 循环调用
 * @param {Function} selector 调用的函数
 * @param {any} target 函数的this参数
 * @param {number} secondsInterval 循环调用的时间间隔秒数，不传默认0.1
 * @param {number} times 循环调用的次数，不传则无限循环调用
 * @return {string} 本次调用计划的id，用于取消调用
 */
export function loopCall(selector:Function, target:any, secondsInterval:number, times?:number) {
	if(arguments.length == 2 && !isNaN(target)) {
		secondsInterval = target;
		target = null;
	}
	if(isNaN(secondsInterval) || secondsInterval <= 0) {
		secondsInterval = 0.1;
	}
	if(isNaN(times)) {
		times = cc.macro.REPEAT_FOREVER
	} else if(times < 1) {
		times = 0;
	} else {
		times = times - 1;
	}
	let id = String(sequence.next());
	let callbackItem = secondsCallbacks[id] = {
		selector : selector,
		target : target,
		scheduleCallback: function() {
			let now = cc.sys.now();
			let dt:number;
			if(this.__time === undefined) {
				dt = secondsInterval;
			} else {
				dt = (now - this.__time) / 1000.0;
			}
			this.__time = now;
			let item = secondsCallbacks[id];
			let complete = false;
			if(item) {
				let ret = null;
				ret = utils.callFuncSafelyWithTarget(item.selector, item.target, dt);
				if(ret === false) {
					complete = true;
				} else if(times != cc.macro.REPEAT_FOREVER) {
					times--;
					if(times < 0) {
						complete = true;
					}
				}
			} else {
				complete = true;
			}
			if(complete) {
				secondsCallbacks[id] = null;
				delete secondsCallbacks[id];
				cc.director.getScheduler().unschedule(item.scheduleCallback, item);
			}
		},
		__instanceId: 'secondsCallbacks' + id
	};
	cc.director.getScheduler().schedule(callbackItem.scheduleCallback, callbackItem, secondsInterval, times, 0, false);
	return id;
}

/**
 * 取消一个调用计划
 * @param {string} id 调用计划id
 */
export function cancel(id:string):void {
	logger.debug(`cancel ${id}`);
	if(framesCallbacks[id]) {
		framesCallbacks[id] = null;
		delete framesCallbacks[id];
		if(utils.isNullOrEmpty(framesCallbacks)) {
			cc.director.getScheduler().unscheduleUpdate(FRAME_CALLBACK_TARGET);
		}
	} else if(secondsCallbacks[id]) {
		let callbackItem = secondsCallbacks[id];
		secondsCallbacks[id] = null;
		delete secondsCallbacks[id];
		cc.director.getScheduler().unschedule(callbackItem.scheduleCallback, callbackItem);
	}
}

/**
 * 取消由本类发起的所有调用计划
 */
export function cancelAll():void {
	logger.debug('cancelAll');
	for(let id in framesCallbacks) {
		cancel(id);
	}
	for(let id in secondsCallbacks) {
		cancel(id);
	}
}


export function waitForFramesAsync(num:number):PromiseLike<void> {
	let resolve, reject;
	let complete:boolean = false;
	let promise = new Promise<void>((pResolve, pReject) => {
		resolve = pResolve;
		reject = pReject;
		if(complete) {
			resolve();
		}
	});
	callFramesLater(() => {
		if(resolve) {
			resolve();
		} else {
			complete = true;
		}
	}, null, num);
	return promise;
}

export function waitSecondsAsync(num:number):PromiseLike<void> {
	let resolve, reject;
	let complete:boolean = false;
	let promise = new Promise<void>((pResolve, pReject) => {
		resolve = pResolve;
		reject = pReject;
		if(complete) {
			resolve();
		}
	});
	delayCall(() => {
		if(resolve) {
			resolve();
		} else {
			complete = true;
		}
	}, null, num);
	return promise;
}