import Logger from './Logger';
import Random from './Random';

const logger = new Logger('Utils');

export function applyMixins(derivedCtor: any, baseCtors: any[]) {
    baseCtors.forEach(baseCtor => {
        Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
            derivedCtor.prototype[name] = baseCtor.prototype[name];
        });
    });
}

export function callFuncSafely(selector: Function, ...params:any[]) {
    callFuncSafelyWithTarget(selector, null, ...params);
}

export function callFuncSafelyWithTarget(selector: Function, target: any, ...params:any[]) {
    try {
        if(selector && typeof selector === 'function') {
            return selector.apply(target, params);
        }
    } catch (err) {
        logger.error(err);
    }
}

export function isNullOrEmpty(obj):boolean {
    if(obj) {
        switch(typeof obj) {
            case 'object':
                for(let key in obj)  {
                    return false;
                }
                return true;
            case 'string':
                return obj === ''
        }
    }

    return !obj;
}

export function formatNumberWithUnit(num: number): string {
    var tmp = ~~num;
    if (!isNaN(tmp)) {
        var str = tmp + "";
        var len = str.length;
        var ret = "";
        if(0 < len && len < 5) {ret = str}
        else if(5 <= len && len < 7) {ret = str.substr(0,len - 3) + 'K'}
        else if(7 <= len && len < 10) {ret = str.substr(0,len - 6) + 'M'}
        else if(10 <= len) {ret = str.substr(0,len - 9) + 'B'}
        return ret;
    } else {
        return "";
    }
}

export function getFormatTimeFromSec(secNum:number) {
    let tmp = ~~secNum;
    if (!isNaN(tmp)) {
        let sec = secNum % 60;
        let min = Math.floor(secNum / 60) % 60;
        let hour = Math.floor(secNum / 3600);

        let resultStr = ''
        if(hour == 0) {
            resultStr += '00:'
        } else if (hour < 10){
            resultStr += '0' + hour + ':';
        } else {
            resultStr += hour + ':';
        }

        if(min == 0) {
            resultStr += '00:'
        } else if (min < 10) {
            resultStr += '0' + min + ':';
        } else {
            resultStr += min + ':';
        }

        if(sec == 0) {
            resultStr += '00'
        } else if (sec < 10) {
            resultStr += '0' + sec;
        } else {
            resultStr += sec;
        }

        return resultStr;
    }
}

/**
 * 截屏函数，传target则只会截该对象
 * @param target 
 */
export function getNodeBase64ImgData(target = null) {
    var width = Math.floor(cc.winSize.width), height = Math.floor(cc.winSize.height);
    var renderTexture = new cc.RenderTexture(width, height);
    target = target ? target._sgNode : cc.director.getRunningScene();
    // 如果包含 Mask，需要用
    // var renderTexture = cc.RenderTexture.create(width, height, cc.Texture2D.PixelFormat.RGBA8888, gl.DEPTH24_STENCIL8_OES);
    renderTexture.begin();
    target.visit();
    renderTexture.end();

    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    canvas.width = width;
    canvas.height = height;
    if (cc._renderType === cc.game.RENDER_TYPE_CANVAS) {
        var texture = renderTexture.getSprite().getTexture();
        var image = texture.getHtmlElementObj();
        ctx.drawImage(image, 0, 0);
    } else if (cc._renderType === cc.game.RENDER_TYPE_WEBGL) {
        var buffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, buffer);
        var texture = renderTexture.getSprite().getTexture();
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture._glID, 0);
        var data = new Uint8Array(width * height * 4);
        gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, data);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        var rowBytes = width * 4;
        for (var row = 0; row < height; row++) {
            var srow = height - 1 - row;
            var data2 = new Uint8ClampedArray(data.buffer, srow * width * 4, rowBytes);
            var imageData = new ImageData(data2, width, 1);
            ctx.putImageData(imageData, 0, row);
        }
    }

    var dataURL = canvas.toDataURL("image/jpeg");
    // console.log(dataURL);
    return dataURL;
}

/** 判断对象是否有值（既不是undefined 也不是null） */
export function isObjectValid(obj) {
    if (obj === undefined || obj === null) {
        return false;
    } else {
        return true;
    }
}

export function sum(n: number, base: number, d: number) {
    return (n*(2*base+(n-1)*d)/2);
}

export function newRandom(n: number, base: number, d: number) {
    let i = 1;
    let randnum = Math.random() * sum(n,base,d);

    if (sum(6,base,d) < randnum)
    {
        i = 7;
        while (sum(i,base,d) < randnum)
            i++;
        }
    else {
        while (sum(i,base,d) < randnum)
            i++;
    } 
    return (i-1);
}

export function intRandomFloor(range: number): number {
    return Math.floor(Math.random() * range);
}

export function intRandomCeil(range: number): number {
    return Math.ceil(Math.random() * range);
}

export function getObjectOwnKeysNum(obj:Object) {
    if (!obj) return 0;
    let num = 0;
    for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
            num++;
        }
    }

    return num;
}

let randomCalculator = new Random(null);
export function random(num: number) {
    return randomCalculator.getRandomInt(num);
}

export function removeArrayElement(ele, arr: any[]) {
    if (!ele || !arr) return;
    arr.splice(arr.indexOf(ele), 1);
}


function getChineseThousand(num) {
    if (num / 10000 >= 1 || num < 1000) return '';

    let result = getChineseZeroToTen(Math.floor(num / 1000)) + '千';

    num = num % 1000;
    let hundredsDigit = getChineseZeroToTen(Math.floor(num / 100));
    if (hundredsDigit && hundredsDigit != '零') {
        hundredsDigit += '百';
    }

    num %= 100;
    let tensDigit = getChineseZeroToTen(Math.floor(num / 10))
    if (tensDigit && tensDigit != '零') {
        tensDigit += '十';
    }

    num %= 10;
    let unitsDigit = getChineseZeroToTen(num);

    if (hundredsDigit == '零' && tensDigit == '零' && unitsDigit == '零') {
        return result;
    }
    if (hundredsDigit == '零' && tensDigit == '零' && unitsDigit != '零') {
        return result + '零' + unitsDigit;
    }

    if (hundredsDigit == '零' && tensDigit != '零' && unitsDigit == '零') {
        return result + tensDigit;
    }
    
    if (hundredsDigit == '零' && tensDigit != '零' && unitsDigit != '零') {
        return result + '零' + tensDigit + unitsDigit;
    }

    if (hundredsDigit != '零' && tensDigit == '零' && unitsDigit == '零') {
        return result + hundredsDigit;
    }

    if (hundredsDigit != '零' && tensDigit != '零' && unitsDigit != '零') {
        return result + hundredsDigit + tensDigit + unitsDigit;
    }

    if (hundredsDigit != '零' && tensDigit != '零' && unitsDigit == '零') {
        return result + hundredsDigit + tensDigit;
    }

    if (hundredsDigit != '零' && tensDigit == '零' && unitsDigit != '零') {
        return result + hundredsDigit + tensDigit + unitsDigit;
    }
}

function getChineseHundred(num) {
    if (num / 1000 >= 1 || num < 100) return '';

    let result = getChineseZeroToTen(Math.floor(num / 100)) + '百';
    num %= 100;
    let tensDigit = getChineseZeroToTen(Math.floor(num / 10))
    if (tensDigit && tensDigit != '零') {
        tensDigit += '十';
    }

    num %= 10;
    let unitsDigit = getChineseZeroToTen(num);

    if (tensDigit == '零' && unitsDigit == '零') {
        return result;
    }

    if (tensDigit == '零' && unitsDigit != '零') {
        return result + tensDigit + unitsDigit;
    }

    if (tensDigit != '零' && unitsDigit == '零') {
        return result + tensDigit;
    }

    if (tensDigit != '零' && unitsDigit != '零') {
        return result + tensDigit + unitsDigit;;
    }
}

function getChineseZeroToTen(num) {
    if (num < 10 && num >= 0) {
        switch (num) {
            case 9:
                return '玖';
            case 8:
                return '捌';
            case 7:
                return '柒';
            case 6:
                return '陆';
            case 5:
                return '伍';
            case 4:
                return '肆';
            case 3:
                return '叁';
            case 2:
                return '贰';
            case 1:
                return '壹';
            case 0:
                return '零';
        }
    }

    return ''
}

function getChineseNumSmallerThanTenThousand(num) {
    let result = '';

    if (num >= 100 && num < 1000) {
        return getChineseHundred(num);
    } else if (num >= 1000 && num < 10000){
        return getChineseThousand(num);
    } else if (num < 100) {
        if (num >= 10) {
            result += getChineseZeroToTen(Math.floor(num / 10)) + '十';
            num %= 10;
            if (getChineseZeroToTen(num) != '零') {
                result += getChineseZeroToTen(num);
            }
        } else {
            result += getChineseZeroToTen(num);
        }
    }

    return result;
}

export function getChineseNumber(num) {
    let result = '';
    let calNum;
    num = Math.floor(num);
    if (num >= 100000000) {
        calNum = Math.floor(num / 100000000);
        num = num % 100000000;
        result += getChineseNumber(calNum) + '亿';
    }

    if (num >= 10000) {
        calNum = Math.floor(num / 10000);
        num = num % 10000;
        result += getChineseNumSmallerThanTenThousand(calNum) + '万';


        if (getChineseNumSmallerThanTenThousand(num) != '零') {
            if (num < 1000 || num < 100 || num < 10) {
                result += '零';
            }
            result += getChineseNumSmallerThanTenThousand(num);
        }
    } else {
        result += getChineseNumSmallerThanTenThousand(num);
    }
    return result;
}

export function getChinessTime(time) {
    return ''
}

export function roundDown(num: number, decimals: number = 0) {
    num = (num * Math.pow(10, decimals) | 0) / Math.pow(10, decimals)
    return num;
}