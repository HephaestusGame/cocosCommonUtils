export default class Sequence {
    private _idx: number = 1;

    constructor(startIdx: number = 1) {
        this._idx = startIdx;
    }

    next():number {
        let idx = this._idx;
        this._idx++;
        return idx;
    }
} 