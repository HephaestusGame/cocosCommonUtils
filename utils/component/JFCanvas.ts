import Logger from '../utils/Logger';

const { ccclass, property, menu, executeInEditMode, disallowMultiple } = cc._decorator;
const logger = new Logger('JFCanvas');

@ccclass
@menu('JFComponent/JFCanvas')
@executeInEditMode
@disallowMultiple
class JFCanvas extends cc.Canvas {

	static getSafeAreaSize(): cc.Size {
		return JFCanvas._noSafeAreaRect.size;
	}
	static getSceneCenterPos(): cc.Vec2 {
		return cc.v2(JFCanvas._noSafeAreaRect.x, JFCanvas._noSafeAreaRect.y);
	}

	private static _isResolutionPolicyEastimated: boolean = false;
	private static _isFitWidth: boolean;
	private static _isFitHeight: boolean;
	private static _noSafeAreaRect: cc.Rect;
	private static _safeAreaRect: cc.Rect;
	private static _policy: cc.ResolutionPolicy | number;

	applySettings(): void {
		if (!JFCanvas._isResolutionPolicyEastimated) {
			let winSize = new cc.Size(cc.winSize);
			logger.info('winSize: ' + cc.winSize.width + '*' + cc.winSize.height);
			let containerStrategy: cc.ContainerStrategy;
			let contentStrategy: cc.ContentStrategy;
			let rp:number;
			if (cc.winSize.height / cc.winSize.width >= JFCanvas.DESIGN_RESOLUTION_HEIGHT / JFCanvas.DESIGN_RESOLUTION_WIDTH) {
				logger.info('setResolutionPolicy -> FIXED_WIDTH');
				containerStrategy = cc.ContainerStrategy && cc.ContainerStrategy.EQUAL_TO_FRAME;
				contentStrategy = cc.ContentStrategy && cc.ContentStrategy.FIXED_WIDTH;
				JFCanvas._isFitWidth = false;
				JFCanvas._isFitHeight = true;
				rp = cc.ResolutionPolicy.FIXED_WIDTH;
			} else {
				logger.info('setResolutionPolicy -> FIXED_HEIGHT');
				containerStrategy = cc.ContainerStrategy && cc.ContainerStrategy.EQUAL_TO_FRAME;
				contentStrategy = cc.ContentStrategy && cc.ContentStrategy.FIXED_HEIGHT;
				JFCanvas._isFitWidth = true;
				JFCanvas._isFitHeight = false;
				rp = cc.ResolutionPolicy.FIXED_HEIGHT;
			}
			if(CC_JSB) {
				JFCanvas._policy = rp;
			} else {
				JFCanvas._policy = new cc.ResolutionPolicy(containerStrategy, contentStrategy);
			}
			JFCanvas._isResolutionPolicyEastimated = true;
		}
		(<any>this)._fitWidth = JFCanvas._isFitWidth;
		(<any>this)._fitHeight = JFCanvas._isFitHeight;
		var designRes = this._designResolution;
		if (CC_EDITOR) {
			cc.engine.setDesignResolutionSize(designRes.width, designRes.height);
		} else {
			cc.view.setDesignResolutionSize(designRes.width, designRes.height, JFCanvas._policy);
		}
		logger.info('layoutSize: ' + cc.winSize.width + '*' + cc.winSize.height);
	}
}
export default JFCanvas;
namespace JFCanvas {
	export const DESIGN_RESOLUTION_HEIGHT = 1280;
	export const DESIGN_RESOLUTION_WIDTH = 720;
	export const DESIGN_RESOLUTION: cc.Size = cc.size(DESIGN_RESOLUTION_WIDTH, DESIGN_RESOLUTION_HEIGHT);
}
