import Logger from '../utils/Logger';
import {event, default as EventDispatcher} from '../event/EventDispatcher';

const logger = new Logger('DataWatcher');

export default class DataWatcher {
    private _eventName: string = null;
    private _dispatcher:EventDispatcher = null;

    constructor(EventName) {
        this._eventName = EventName;
        this._dispatcher = event;
    }

    addListener(listener, target = null):number {
        return this._dispatcher.addListener(this._eventName, listener, target)
    }

    removeListener(id) {
        this._dispatcher.removeListener(id);
    }

    removeListenersByIdArr(arr:Array<number>) {
        this._dispatcher.removeListenersByIdArr(arr);
    }

    notifyDataChange(key, obj) {
        if( key == null || key == undefined || obj == null || obj == undefined) {
            throw new Error('invalid key or obj, key:' + key  + ' obj:' + obj);
        }

        this._dispatcher.dispatch(this._eventName, key, obj);
    }
}