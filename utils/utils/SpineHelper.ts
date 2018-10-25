import Logger from './Logger';

const {ccclass, property, menu, requireComponent, disallowMultiple} = cc._decorator;
const DETAIL_LOG = true;

@ccclass
@menu('-/SpineHelper')
@requireComponent(sp.Skeleton)
@disallowMultiple
export default class SpineHelper extends cc.Component {

	static readonly EVT_TYPE_FINISHED = 'finished';
	static readonly EVT_TYPE_LOOP_COMPLETE = 'loop_complete';
	static readonly EVT_TYPE_EVENT = 'event';

	protected _logger:Logger;
	protected _trackListeners: Array<[any, string, Function]>;
	protected _sp: sp.Skeleton;

	constructor() {
		super();
		this._logger = new Logger('SpineHelper');
		this._logger.enabled = false;
		this._trackListeners = [];
	}

	get skeleton(): sp.Skeleton {
		if(!this._sp && this.node) {
			this._sp = this.node.getComponent(sp.Skeleton);
			this._sp.setAnimationListener(this, this._animationStateEvent);
		}
		return this._sp;
	}

	get logger():Logger {
		return this._logger;
	}

	set logger(val:Logger) {
		this._logger = val || this._logger;
	}

	/**
	 * 获取某个animation的duration
	 * @param animationName
	 */
	getAnimDuration(animationName: string): number {
		return this._sp.findAnimation(animationName).duration;
	}

	/**
	 * 获取默认皮肤名称
	 */
	getDefaultSkin():string {
		return this.skeleton.defaultSkin;
	}

	clearTracks(): void {
		this._logger.debug('clearTracks');
		this.skeleton.clearTracks();
		this.skeleton.setAnimationListener(this, this._animationStateEvent);
		this._trackListeners.length = 0;
	}

	async setAnimationAsync(animationName: string, trackIndex: number = 0, loop: boolean = false) {
		return new Promise<any>((resolve) => {
			this.setAnimation(trackIndex, animationName, loop, (type) => {
				if(type == SpineHelper.EVT_TYPE_FINISHED) {
					resolve();
				}
			});
		})
	}

	async waitAnimationLoopOnce(animationName: string, trackIndex: number = 0) {
		return new Promise<any>((resolve, reject) => {
			let loopOnce = false;
			this.setAnimation(trackIndex, animationName, true, (type) => {
				if(type == SpineHelper.EVT_TYPE_LOOP_COMPLETE && !loopOnce) {
					resolve();
					loopOnce = true;
				}
			})
		})
	}

	setAnimation(trackIndex: number, animationName: string, loop: boolean, callback: Function = null): any {
		if(!this.skeleton) {
			return;
		}
		this.skeleton.clearTrack(trackIndex);
		this.skeleton.setAnimationListener(this, this._animationStateEvent);

		this._logger.debug(`setAnimation ${trackIndex} ${animationName} ${loop}`);

		let trackEntry = this.skeleton.setAnimation(trackIndex, animationName, loop);
		if (callback) {
			if (this.findCallbackByTrackEntry(trackEntry, animationName) !== -1) {
				this._logger.error(`dumplicate track entry found: ${trackIndex} ${animationName}`);
			}
			this._trackListeners.push([trackEntry, animationName, (eventType: string, loopCount: number, event) => {
				// this._logger.debug(`callback -> ${eventType} ${loopCount}`);
				let idx: number = this.findCallbackByTrackEntry(trackEntry, animationName);
				if (idx === -1) {
					return;
				}

				let onFinished = function(type: string) {
					this._trackListeners.splice(idx, 1);
					try {
						this._logger.debug(`invoke setAnimation callback: finished`);
						let tmp = callback;
						callback = null;
						tmp && tmp(SpineHelper.EVT_TYPE_FINISHED, null, type);
					} catch (err) {
						this._logger.error(err);
					}
				}.bind(this);

				switch (eventType) {
					case 'end':
						onFinished('end');
						break;
					case 'interrupt':
						onFinished('interrupt');
						break;
					case 'dispose':
						onFinished('dispose');
						break;
					case 'complete':
						if (loop) {
							try {
								// this._logger.debug(`invoke setAnimation callback: complete ${loopCount}`);
								callback && callback(SpineHelper.EVT_TYPE_LOOP_COMPLETE, loopCount);
							} catch (err) {
								this._logger.error(err);
							}
						} else {
							onFinished('complete');
						}
						break;
					case 'event':
						try {
							this._logger.debug(`invoke setAnimation callback: event`);
							callback && callback(SpineHelper.EVT_TYPE_EVENT, event);
						} catch (err) {
							this._logger.error(err);
						}
						break;
				}
			}]);
		}
		return trackEntry;
	}

	addAnimation(trackIndex: number, animationName: string, loop: boolean, delay: number = 0, callback: Function = null): any {
		if(!this.skeleton) {
			return;
		}
		this._logger.debug(`addAnimation ${trackIndex} ${animationName} ${loop} ${delay}`);
		let trackEntry = this.skeleton.addAnimation(trackIndex, animationName, loop, delay);
		if (callback) {
			if (this.findCallbackByTrackEntry(trackEntry, animationName) !== -1) {
				this._logger.error(`dumplicate track entry found: ${trackIndex} ${animationName}`);
			}
			this._trackListeners.push([trackEntry, animationName, (eventType: string, loopCount: number, event) => {
				let idx: number = this.findCallbackByTrackEntry(trackEntry, animationName);
				if (idx === -1) {
					return;
				}

				switch (eventType) {
					case 'end':
					case 'interrupt':
					case 'dispose':
						this._trackListeners.splice(idx, 1);
						try {
							this._logger.debug(`invoke addAnimation callback: finished`);
							let tmp = callback;
							callback = null;
							tmp && tmp(SpineHelper.EVT_TYPE_FINISHED);
						} catch (err) {
							this._logger.error(err);
						}
						break;
					case 'complete':
						if (loop) {
							try {
								// this._logger.debug(`invoke addAnimation callback: complete ${loopCount}`);
								callback && callback(SpineHelper.EVT_TYPE_LOOP_COMPLETE, loopCount);
							} catch (err) {
								this._logger.error(err);
							}
						} else {
							this._trackListeners.splice(idx, 1);
							try {
								this._logger.debug(`invoke addAnimation callback: finished`);
								let tmp = callback;
								callback = null;
								tmp && tmp(SpineHelper.EVT_TYPE_FINISHED);
							} catch (err) {
								this._logger.error(err);
							}
						}
						break;
					case 'event':
						try {
							this._logger.debug(`invoke setAnimation callback: event`);
							callback && callback(SpineHelper.EVT_TYPE_EVENT, event);
						} catch (err) {
							this._logger.error(err);
						}
						break;
				}
			}]);
		}
		return trackEntry;
	}

	findCallbackByTrackEntry(trackEntry: any, animationName:string): number {
		if (this._trackListeners && this._trackListeners.length > 0) {
			for (let i: number = 0; i < this._trackListeners.length; i++) {
				let [track, animName, callback] = this._trackListeners[i];
				if (track === trackEntry && animName === animationName) {
					return i;
				}
			}
		}
		return -1;
	}

	onRecycle():void {
		this._logger.debug('recycled');
		this.skeleton.clearTracks();
		this.skeleton.setAnimationListener(this, this._animationStateEvent);
		this._trackListeners.length = 0;
	}

	onReuse():void {
		this._logger.debug('reused');
		let spAny:any = this.skeleton;
		if(spAny && spAny._refresh) {
			spAny._refresh();
		}
	}

	private _animationStateEvent(obj, entry, type, event, loopCount): void {
		var animationName = (entry && entry.animation) ? entry.animation.name : 0;
		let idx: number = this.findCallbackByTrackEntry(entry, animationName);
		switch (type) {
			case 0://sp.AnimationEventType.START:
				DETAIL_LOG && this._logger.debug('AnimationStateEvent：', entry.trackIndex, " start: ", animationName);
				break;
			case 1://sp.AnimationEventType.INTERRUPT
				DETAIL_LOG && this._logger.debug('AnimationStateEvent：', entry.trackIndex, " interrupt: ", animationName);
				if (idx !== -1) {
					this._trackListeners[idx][2]('interrupt');
				}
				break;
			case 2://sp.AnimationEventType.END:
				DETAIL_LOG && this._logger.debug('AnimationStateEvent：', entry.trackIndex, " end:", animationName);
				break;
			case 3://sp.AnimationEventType.DISPOSE:
				DETAIL_LOG && this._logger.debug('AnimationStateEvent：', entry.trackIndex, " dispose: ", animationName);
				if (idx !== -1) {
					this._trackListeners[idx][2]('dispose');
				}
				break;
			case 4://sp.AnimationEventType.COMPLETE:
				// DETAIL_LOG && this._logger.debug('AnimationStateEvent：', entry.trackIndex, " complete: ", animationName, ",", loopCount);
				if (idx !== -1) {
					this._trackListeners[idx][2]('complete', loopCount);
				}
				break;
			case 5://sp.AnimationEventType.EVENT
				DETAIL_LOG && this._logger.debug('AnimationStateEvent：', entry.trackIndex + " event: " + animationName);
				if (idx !== -1) {
					this._trackListeners[idx][2]('event', loopCount, event);
				}
				break;
			default:
				DETAIL_LOG && this._logger.debug('AnimationStateEvent：', `invalid type ${type}`);
				break;
		}

	}

}
