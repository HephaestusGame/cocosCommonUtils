import * as scheduler from '../utils/scheduler';

const {ccclass, property} = cc._decorator;

@ccclass
export default class AFFitIphoneX extends cc.Component {

    @property()
    isTopItem: boolean = false;

    @property()
    isBottomItem: boolean = false;
    
    @property()
    topOffset: number = 0;

    @property()
    bottomOffset: number = 0;

    onLoad () {
        let frameSize = cc.view.getFrameSize();
        let isIphoneX = (frameSize.width == 1125 && frameSize.height == 2436) || (frameSize.width == 2436 && frameSize.height == 1125);

        if (isIphoneX) {
            scheduler.callFramesLater(() => {
                if (this.isTopItem) {
                    this.node.y -= this.topOffset;
                }
    
                if (this.isBottomItem) {
                    this.node.y += this.bottomOffset;
                }
            }, this, 2);
        }
    }

}
