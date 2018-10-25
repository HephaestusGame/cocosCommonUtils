import Sequence from '../utils/Sequence';

class RegistryItem {
    id =  null;
    eventName = null;
    listener = null;
    target = null;

    constructor(id, eventName, listener, target) {
        this.id = id;
        this.eventName = eventName;
        this.listener = listener;
        this.target = target;
    }
}

let  event:EventDispatcher = null;
export default class EventDispatcher {
    static getInstance():EventDispatcher {
        if (!event) {
            event = new EventDispatcher();
        }
        return event
    }

    eventName2ListenersMap: {[key:string]: Array<RegistryItem>} = null;
    listenerId2ItemMap: {[key:number]:RegistryItem} = null;
    private _sequence: Sequence = null;

    constructor() {
        this._sequence = new Sequence(1);
        this.eventName2ListenersMap = {};
        this.listenerId2ItemMap = {};
    }

    addListener(eventName, listener, target = null) {
        if (eventName == null || eventName == undefined || listener == null || listener == undefined) {
            throw new Error(`${eventName ? 'event name is invalid' : ' listener is invalid'}`)
        }

        let listeners = this.eventName2ListenersMap[eventName];
        if (listeners) {
            listeners.forEach(item => {
                if(item.listener == listener && item.target == target) {
                    throw new Error('Dumplicate event listener');
                }
            })
        } else {
            listeners = this.eventName2ListenersMap[eventName] = [];
        }

        let id = this._sequence.next();
        let registryItem = new RegistryItem(id, eventName, listener, target);
        listeners.push(registryItem);
        this.listenerId2ItemMap[id] = registryItem;

        return id;
    }

    dispatch(eventName, key?, data?) {
        let listeners = this.eventName2ListenersMap[eventName];
        let params = [eventName, key, data]
        if (arguments.length == 1) {
            params = [eventName, null, null];
        } else if (arguments.length == 2) {
            data = key;
            params = [eventName, data, null];
        }
        if (listeners) {
            listeners.forEach(item => {
                try {
                    item.listener.apply(item.target, params);
                } catch (err) {
                    console.error(`event handler for ${eventName} error:`);
                    console.error(err);
                }
            })
        }
    }

    removeListenersByIdArr(idArr: Array<number>) {
        idArr.forEach( id => {
            this.removeListener(id);
        })
    }

    removeListener(id:number) {
        let item = this.listenerId2ItemMap[id];
        if (item) {
            this.listenerId2ItemMap[id] = null;
            delete this.listenerId2ItemMap[id];
            let listeners = this.eventName2ListenersMap[item.eventName];
            let idx = listeners.indexOf(item);
            if(idx != -1) {
                listeners.splice(idx, 1);
            }
        }
    }
}

event = EventDispatcher.getInstance();
export {event};