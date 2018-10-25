const {ccclass, property} = cc._decorator;

@ccclass
export default class DebugPopupCtrl extends cc.Component {

    @property(cc.ScrollView)
    scv: cc.ScrollView = null;

    @property(cc.Node)
    contentNode: cc.Node =null;

    private _logDataStr: string = '';
    private _infoLbNodeArr: Array<cc.Node> = [];

    createLbNode(info, color) {
        let lbNode = new cc.Node();
        lbNode.color = color;
        lbNode.width = 350
        let label = lbNode.addComponent(cc.Label);
        label.string = info;
        label.overflow = cc.Label.Overflow.RESIZE_HEIGHT;
        label.fontSize = 16;
        label.lineHeight = 18;
        this.contentNode.addChild(lbNode);
        this._infoLbNodeArr.push(lbNode);
        this.scv.scrollToBottom();
    }
    
    log(info:string) {
        this.createLbNode(info, cc.color(0,0,0));
    }

    error(info) {
        this.createLbNode(info, cc.color(255,0,0));
    }

    info(info) {
        this.createLbNode(info, cc.color(36,168,17));
    }

    warn(info) {
        this.createLbNode(info, cc.color(241,140,12));
    }

    debug(info) {
        this.createLbNode(info, cc.color(122,105,105));
    }

    clear() {
        this.contentNode.removeAllChildren(true);
        this.scv.scrollToBottom();
    }
}
