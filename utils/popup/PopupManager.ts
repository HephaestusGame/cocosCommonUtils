import * as jf from '../jf'
import ZOrder from '../../app/consts/ZOrder';

const logger = new jf.Logger('PopupManager');

export enum PopupType {
    NORMAL_POPUP,
    POPUP_UNDER_LOG_VIEW
}

export default class PopupManager {
    private static _ins: PopupManager = null;
    private _modalPF: cc.Prefab = null;

    static getInstance(): PopupManager {
        if(!PopupManager._ins) {
            PopupManager._ins = new PopupManager();
        }

        return PopupManager._ins;
    }

    getPopupCt(type:PopupType):cc.Node {
        let popupCt;
        if (type == PopupType.NORMAL_POPUP) {
            popupCt = cc.director.getScene().getChildByName('NormalPopupContainer');
            if(!popupCt) {
                popupCt = new cc.Node();
                popupCt.width = cc.winSize.width;
                popupCt.height = cc.winSize.height;
                popupCt.name = 'NormalPopupContainer';
                popupCt.x = cc.winSize.width / 2;
                popupCt.y = cc.winSize.height / 2;
                cc.director.getScene().addChild(popupCt);
                popupCt.zIndex = ZOrder.NORMAL_POPUP;
            }
        } else {
            popupCt = cc.director.getScene().getChildByName('PopupUnderLogViewContainer');
            if(!popupCt) {
                popupCt = new cc.Node();
                popupCt.width = cc.winSize.width;
                popupCt.height = cc.winSize.height;
                popupCt.name = 'PopupUnderLogViewContainer';
                popupCt.x = cc.winSize.width / 2;
                popupCt.y = cc.winSize.height / 2;
                cc.director.getScene().addChild(popupCt);
                popupCt.zIndex = ZOrder.POPUP_UNDER_LOG_VIEW;
            }
        }

        return popupCt;
    }

    addPopup(popup: cc.Node, useModal: boolean, closeOnTouchModal: boolean = false, modalTransparent: boolean = false, type:PopupType = PopupType.NORMAL_POPUP): cc.Node {
        
        let popupCt = this.getPopupCt(type);
        

        if(useModal) {
            let popupNode: cc.Node = new cc.Node();
            let addModal = function () {
                let modalNode = cc.instantiate(this._modalPF);
                modalNode.width = cc.winSize.width * 2;
                modalNode.height = cc.winSize.height * 2;

                //模态透明
                if(modalTransparent) {
                    modalNode.opacity = 0;
                }

                //点击模态关闭
                let popupCtrl = popup.getComponent(jf.PopupCtrl);
                if(closeOnTouchModal) {
                    modalNode.on(cc.Node.EventType.TOUCH_START, () => {
                        popupCtrl.closePopup();
                    })
                }
                popupNode.addChild(modalNode);
                popupNode.addChild(popup);
            }
            if(!this._modalPF) {
                cc.loader.loadRes('prefabs/Modal', cc.Prefab, (err, res) => {
                    if(!err) {
                        this._modalPF = res;
                        addModal.call(this);
                    } else {
                        logger.error(err);
                    }
                })
            } else {
                addModal.call(this);
            }

            popupCt.addChild(popupNode);
            return popupNode;
        } else {
            popupCt.addChild(popup);
            return popup;
        }
    }
}