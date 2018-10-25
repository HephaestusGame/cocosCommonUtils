const {ccclass, property} = cc._decorator;

@ccclass
export default class JFSelfAdaptiveScale extends cc.Component {
    private _ready: boolean = false;

    onLoad () {
        this.setNodeScale();
    }

    setNodeScale() {
        //防止重复调用
        if (this._ready) return;

        let designSize = cc.view.getDesignResolutionSize();
        let resolutionPolicy = cc.view.getResolutionPolicy();

        let designAspectRatio = designSize.width / designSize.height;
        let viewAspectRatio = cc.winSize.width / cc.winSize.height;
        if (resolutionPolicy._contentStrategy == cc.ContentStrategy.FIXED_HEIGHT)  {
            if (designAspectRatio > viewAspectRatio) {
                this.node.scale *= cc.winSize.width / designSize.width;
            }
        } else if (resolutionPolicy._contentStrategy == cc.ContentStrategy.FIXED_WIDTH) {
            if (designAspectRatio < viewAspectRatio) {
                this.node.scale *= cc.winSize.height / designSize.height;
            }
        }

        // cc.log('set node ' + this.node.name + ' scale:' + this.node.scale);
        this._ready = true;

    }

}
