//前景色
export function red(str: string) {
    return '<color=#ff0000>' + str + '</c>';
}

export function green(str: string) {
    return '<color=#00ff00>' + str + '</c>';
}

export function blue(str: string) {
    return '<color=#0000FF>' + str + '</c>'
}

export function black(str: string) {
    return '<color=#000000>' + str + '</c>';
}

export function yellow(str: string) {
    return '<color=#FFFF00>' + str + '</c>';
}

/**
 * 洋红
 * @param str 
 */
export function magenta(str: string) {
    return '<color=#FF00FF>' + str + '</c>'
}

/**
 * 青色 蓝绿色
 * @param str 
 */
export function cyan(str: string) {
    return '<color=#00FFFF>' + str + '</c>'
}

export function white(str: string) {
    return '<color=#FFFFFF>' + str + '</c>'
}

export function getColorTextArr(strArr: string[], colorFunc: Function) {
    let resultArr = [];

    strArr.forEach(str => {
        if (str.indexOf('</c>') == -1) {
            str = colorFunc(str);
        }
        resultArr.push(str);
    })

    return resultArr;
}