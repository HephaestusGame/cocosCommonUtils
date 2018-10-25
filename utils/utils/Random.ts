export default class Random {
    private _seed = null;
    
    constructor(seed) {
        if (!seed && seed != 0) {
            seed = new Date().getTime();
        }
        this._seed =seed;
    }

    getRandomInt(max: number, min: number = 0) {
        this._seed = (this._seed * 9301 + 49297) % 233280;
        let rnd = this._seed / 233280;
        return Math.floor(min + rnd * (max - min));
    }

    getRandomInRange(min, max) {
        this._seed = (this._seed * 9301 + 49297) % 233280;
        let range = max - min;
        let val = range * this._seed;
        val -= val % 233280
        return min + Math.round(val / 233280.0)
    }
}