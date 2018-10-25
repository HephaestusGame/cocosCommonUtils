import { AudioManager, AudioName } from '../../app/managers/AudioManager';
import PopupManager, { PopupType } from './PopupManager';
import AFSelfAdaptiveScale from '../component/JFSelfAdaptiveScale';

let popupManager = PopupManager.getInstance();
const {ccclass, property, menu} = cc._decorator;
@ccclass
@menu('JFComponent/PopupCtrl')
export default class PopupCtrl extends cc.Component {
    @property({displayName: '使用模态'})
    useModal: boolean = true;

    @property({displayName: '点击模态关闭'})
    closeWhenTouchModal: boolean = false;

    @property({displayName:'模态透明'})
    modalTransparent: boolean = false;

    @property({displayName: '通用弹出动画'})
    useCommonShowUpAnim:boolean = true;

    @property({displayName: '通用关闭动画'})
    useCommonCloseAnim:boolean = true;

    @property({displayName: '通用出现音效'})
    useCommonShowUpSound:boolean = true;

    @property({displayName: '通用关闭音效'})
    useCommonCloseSound:boolean = true;

    private _popup: cc.Node = null;

    openPopup(callback: Function = null, type:PopupType = PopupType.NORMAL_POPUP) {
        this._popup = popupManager.addPopup(this.node, this.useModal, this.closeWhenTouchModal, this.modalTransparent, type);
        
        if (this.useCommonShowUpSound) {
            // AudioManager.playSound(AudioName.OPEN_POPUP);
        }

        let selfAdaptiveScaleComp = this.node.getComponent(AFSelfAdaptiveScale);
        if (selfAdaptiveScaleComp) {
            selfAdaptiveScaleComp.setNodeScale();
        }
        
        if(this.useCommonShowUpAnim) {
            let originalScale = this.node.scale;
            this.node.scale *= 0.4;
            this.node.runAction(cc.sequence([
                cc.scaleTo(0.6, originalScale).easing(cc.easeElasticOut(0.6)),
                cc.callFunc(() => {
                    callback && callback();
                })
            ]))
        }
    }

    closePopup(callback: Function = null) {
        if (this.useCommonCloseSound) {
            // AudioManager.playSound(AudioName.CLOSE_POPUP);
        }

        if (this.useCommonCloseAnim) {
            this.node.runAction(cc.sequence([
                cc.scaleTo(0.4, 0.4 * this.node.scale).easing(cc.easeBackIn()),
                cc.callFunc(() => {
                    this._popup.removeFromParent(true);
                    if (typeof callback === 'function') {
                        callback()
                    }
                })
            ]))
        } else {
            this._popup.removeFromParent(true);
            if (typeof callback === 'function') {
                callback()
            }
        }
    }
}
