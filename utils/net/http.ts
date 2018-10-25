import Logger from '../utils/Logger';
import Sequence from '../utils/Sequence';

const logger = new Logger('http');
const seq = new Sequence(1);

var RequestMQ = {
    map: {},
    mq: [],
    running: [],
    MAX_REQUEST_NUM: 5,
    push: function(param) {
        param.id = seq.next();
        this.mq.push(param.id);
        this.map[param.id] = param;
    },
    next: function() {
        let self = this;
        
        if(this.mq.length == 0) {
            return;
        }

        if(this.running.length < this.MAX_REQUEST_NUM) {
            let id = this.mq.shift();
            let obj = this.map[id];
            let oldComplete = obj.complete;
            obj.complete = function() {
                // for (let _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                //     args[_key] = arguments[_key];
                // }

                self.running.splice(self.running.indexOf(self.running[id]), 1);
                delete self.map[id];
                try {
                    oldComplete.apply(obj, arguments);
                } catch (err) {
                    logger.error('request[', obj.id, '] complete handler error:', err)
                }

                self.next();
			}
			
			this.running.push(obj);
			if (window['wx']) {
				obj.task = window['wx'].request(obj);
			} else {
				let xhr = obj.task = new XMLHttpRequest();
				xhr.responseType = obj.responseType;
				xhr.open(obj.method, obj.url, true);
				let headers = obj.header;
				for (let key in headers) {
					xhr.setRequestHeader(key, headers[key]);
				}
				xhr.onreadystatechange = function() {
					if (this.readyState == 4) {
						obj.complete();
						obj.success({data:this.response, statusCode: this.status, header: null});
					}
				}
				xhr.onerror = xhr.ontimeout = function() {
					obj.complete();
					obj.fail();
				}
				xhr.send(JSON.stringify(obj.data));
				// cc.error('send data:' + JSON.stringify(obj.data));
			}
			
        }
    },
    request: function(obj) {
        obj = obj || {};
        obj = (typeof obj == 'string') ? {url: obj} : obj;

        this.push(obj);
        this.next();
    },
    cancel: function(id) {
        if (this.map[id]) {
            let obj = this.map[id];
            delete this.map[id];

            let idx = this.mq.indexOf(id);
            if(idx != -1) {
                this.mq.splice(idx, 1);
            }

            idx = this.running.indexOf(id);
            if(idx != -1) {
                this.running.splice(idx, 1);
            }

            if(obj.task) {
                try {
                    obj.task.abort();
                } catch (err){
                    logger.debug('request[', obj.id, '] task abort fail:', err)
                }
            }
        }
    }
} 
export const defaultParams = {
	params: {},
	header: {
		// 'content-type': 'application/json'
	},
	url: ''
};

function getParamsWithDefault(params) {
	params = params || {};
	for(var keyPath in defaultParams.params) {
		let val = defaultParams.params[keyPath];
		let paths = keyPath.split('.');
		let curPathObj = params;
		for(let i = 0; i < paths.length; i++) {
			let tmp = curPathObj[paths[i]];
			if(tmp === undefined || tmp === null) {
				if(i === paths.length - 1) {
					tmp = curPathObj[paths[i]] = val;
				} else {
					tmp = curPathObj[paths[i]] = {};
				}
			}
			curPathObj = tmp
		}
	}
	return params;
}

function getHeaderWithDefault(header) {
	header = header || {};
	for(var key in defaultParams.header) {
		let val = defaultParams.header[key];
		let curVal = header[key];
		if(curVal === undefined || curVal === null) {
			header[key] = val;
		}
	}
	return header;
}

const EMPTY_OBJ = {};
export function request(
	url,
	method,
	data,
	header,
	success,
	fail,
	complete,
	dataType = 'application/json',
	responseType = 'text'
) {
	let id = seq.next();
	logger.debug(`[${id}][${data&&data.Head.Cmd}] send ->`, data);
	let params = {
		url: url,
		data: data,
		header: header || EMPTY_OBJ,
		method: method,
		dataType: dataType,
		responseType: responseType,
		success: (res) => {
			logger.debug(`[${id}][${data&&data.Head.Cmd}] success:`, res);
			success && success(res);
		},
		fail: (res) => {
			logger.debug(`[${id}][${data&&data.Head.Cmd}] fail:`, res);
			fail && fail(res);
		},
		complete: (res) => {
			// logger.debug('[', id, '] complete:', res);
			complete && complete(res);
		}
	};
	return RequestMQ.request(params);
}

export function cancel(id) {
	RequestMQ.cancel(id);
}

export function getURL(url, params, header, success, fail, complete) {
	return request(url, 'GET', params, header, success, fail, complete);
}

export function get(params, header, success, fail, complete) {
	return request(defaultParams.url, 'GET', getParamsWithDefault(params), header, success, fail, complete);
}

export async function getURLAsync(url, params, header) {
	return new Promise((resolve, reject) => {
		getURL(
			url,
			params,
			header,
			(data, statusCode, header) => {
				resolve({ data: data, statusCode: statusCode, header: header });
			},
			reason => {
				reject(reason);
            },
            () => {

            }
		);
	});
}

export async function getAsync(params, header) {
	return new Promise((resolve, reject) => {
		get(
			params,
			header,
			(data, statusCode, header) => {
				resolve({ data: data, statusCode: statusCode, header: header });
			},
			reason => {
				reject(reason);
            },
            () => {

            }
		);
	});
}

export function postURL(url, params, header, success, fail, complete) {
	return request(url, 'POST', params, header, success, fail, complete);
}

export function post(params, header, success, fail, complete) {
	return request(defaultParams.url, 'POST', getParamsWithDefault(params), getHeaderWithDefault(header), success, fail, complete);
}

export function postURLAsync(url, params) {
	return new Promise((resolve, reject) => {
		postURL(
			url,
            params,
            null,
			(data, statusCode, header) => {
				resolve({ data: data, statusCode: statusCode, header: header });
			},
			reason => {
				reject(reason);
            },
            () => {

            }
		);
	});
}

export function postAsync(params) {
	return new Promise((resolve, reject) => {
		post(
            params,
            null,
			(data, statusCode, header) => {
				resolve({ data: data, statusCode: statusCode, header: header });
			},
			reason => {
				reject(reason);
            },
            () => {

            }
		);
	});
}
