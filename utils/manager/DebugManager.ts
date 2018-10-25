import DebugPopupCtrl from '../popup/DebugPopupCtrl';

export default class DebugManager {
    private static _ins: DebugManager = null;

    static getInstance():DebugManager {
        if (!DebugManager._ins) {
            DebugManager._ins = new DebugManager();
        }
        return DebugManager._ins;
    }


    private _debugPopup: cc.Node = null;
    private _debugPopupCtrl: DebugPopupCtrl = null;

    log(info:string) {

        if (!this._debugPopup) {
            cc.loader.loadRes('prefabs/DebugPopup', cc.Prefab, (err, pf) => {
                if (err) {
                    console.error(err);
                } else {
                    this._debugPopup = cc.instantiate(pf);
                    cc.game.addPersistRootNode(this._debugPopup);
                    let canvas = cc.find('Canvas');
                    let globalPos = canvas.convertToWorldSpaceAR(cc.v2(0, canvas.height / 2));
                    let locPos = cc.director._scene.convertToNodeSpaceAR(globalPos);
                    this._debugPopup.position = locPos;
                    this._debugPopupCtrl = this._debugPopup.getComponent(DebugPopupCtrl);
                    this._debugPopupCtrl.log(info);
                }
            })
        } else {
            this._debugPopupCtrl.log(info);
        }
    }

    info(info:string) {
        if (!this._debugPopup) {
            cc.loader.loadRes('prefabs/DebugPopup', cc.Prefab, (err, pf) => {
                if (err) {
                    console.error(err);
                } else {
                    this._debugPopup = cc.instantiate(pf);
                    cc.game.addPersistRootNode(this._debugPopup);
                    let canvas = cc.find('Canvas');
                    let globalPos = canvas.convertToWorldSpaceAR(cc.v2(0, canvas.height / 2));
                    let locPos = cc.director._scene.convertToNodeSpaceAR(globalPos);
                    this._debugPopup.position = locPos;
                    this._debugPopupCtrl = this._debugPopup.getComponent(DebugPopupCtrl);
                    this._debugPopupCtrl.info(info);
                }
            })
        } else {
            this._debugPopupCtrl.info(info);
        }
    }

    debug(info:string) {
        if (!this._debugPopup) {
            cc.loader.loadRes('prefabs/DebugPopup', cc.Prefab, (err, pf) => {
                if (err) {
                    console.error(err);
                } else {
                    this._debugPopup = cc.instantiate(pf);
                    cc.game.addPersistRootNode(this._debugPopup);
                    let canvas = cc.find('Canvas');
                    let globalPos = canvas.convertToWorldSpaceAR(cc.v2(0, canvas.height / 2));
                    let locPos = cc.director._scene.convertToNodeSpaceAR(globalPos);
                    this._debugPopup.position = locPos;
                    this._debugPopupCtrl = this._debugPopup.getComponent(DebugPopupCtrl);
                    this._debugPopupCtrl.debug(info);
                }
            })
        } else {
            this._debugPopupCtrl.debug(info);
        }
    }

    error(info:string) {
        if (!this._debugPopup) {
            cc.loader.loadRes('prefabs/DebugPopup', cc.Prefab, (err, pf) => {
                if (err) {
                    console.error(err);
                } else {
                    this._debugPopup = cc.instantiate(pf);
                    cc.game.addPersistRootNode(this._debugPopup);
                    let canvas = cc.find('Canvas');
                    let globalPos = canvas.convertToWorldSpaceAR(cc.v2(0, canvas.height / 2));
                    let locPos = cc.director._scene.convertToNodeSpaceAR(globalPos);
                    this._debugPopup.position = locPos;
                    this._debugPopupCtrl = this._debugPopup.getComponent(DebugPopupCtrl);
                    this._debugPopupCtrl.error(info);
                }
            })
        } else {
            this._debugPopupCtrl.error(info);
        }
    }

    warn(info:string) {
        if (!this._debugPopup) {
            cc.loader.loadRes('prefabs/DebugPopup', cc.Prefab, (err, pf) => {
                if (err) {
                    console.error(err);
                } else {
                    this._debugPopup = cc.instantiate(pf);
                    cc.game.addPersistRootNode(this._debugPopup);
                    let canvas = cc.find('Canvas');
                    let globalPos = canvas.convertToWorldSpaceAR(cc.v2(0, canvas.height / 2));
                    let locPos = cc.director._scene.convertToNodeSpaceAR(globalPos);
                    this._debugPopup.position = locPos;
                    this._debugPopupCtrl = this._debugPopup.getComponent(DebugPopupCtrl);
                    this._debugPopupCtrl.warn(info);
                }
            })
        } else {
            this._debugPopupCtrl.warn(info);
        }
    }

}