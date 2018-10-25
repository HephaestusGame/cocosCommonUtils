import Logger from './Logger';
const logger = new Logger('af.persistant');
const dataCache = {};

export function getByKey(propKey: string, defaultValue:any = null) {
	if(dataCache.hasOwnProperty(propKey)) {
		return dataCache[propKey]
	} else {
		let value = dataCache[propKey] = cc.sys.localStorage.getItem(propKey);
		if ((value === undefined || value === null) && defaultValue !== null && defaultValue !== undefined) {
			value = dataCache[propKey] = String(defaultValue);
		}
		return value;
	}
}

export function setByKey(propKey: string, value: any) {
	logger.info(`set ${propKey} -> ${value}`);
	dataCache[propKey] = value;
	cc.sys.localStorage.setItem(propKey, value);
}

export function removeByKey(propKey: string) {
	logger.info(`delete -> ${propKey}`);
	delete dataCache[propKey];
	cc.sys.localStorage.removeItem(propKey);
}