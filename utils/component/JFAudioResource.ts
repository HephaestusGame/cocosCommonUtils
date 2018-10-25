import {AudioName, AudioManager} from '../../app/managers/AudioManager';
import Logger from '../utils/Logger';

const logger = new Logger('JFAudioResource');
const {ccclass, property, menu} = cc._decorator;

enum AudioType {
	SOUND_EFFECT,
	BGM
}

@ccclass
@menu('JFComponent/JFAudioResource')
export default class JFAudioResource extends cc.Component {
	@property({type:cc.Enum(AudioName)})
	audioName:AudioName = AudioName.NONE;

	@property({type: cc.Enum(AudioType)})
	audioType:AudioType = AudioType.SOUND_EFFECT;

	@property()
	loop: boolean = false;

	@property()
	playOnLoad: boolean = false;

	@property()
	volume:number = 1;

	private _clip: cc.AudioClip = null;
	private _audioID: number = null;

	onLoad() {
		AudioName.MAIN_SCENE_BGM
		if(this.playOnLoad && this.audioName != AudioName.NONE) {
			if(this.audioType == AudioType.SOUND_EFFECT) {
				this._audioID = AudioManager.playSound(this.audioName, this.loop, this.volume);
			} else {
				this._audioID = AudioManager.playMusic(this.audioName, this.loop, this.volume);
			}
		}

		let button = this.node.getComponent(cc.Button);
		if(button) {
			button.node.on('click', () => {
				this._audioID = AudioManager.playSound(this.audioName, this.loop, this.volume);
			});
		}
	}
}
