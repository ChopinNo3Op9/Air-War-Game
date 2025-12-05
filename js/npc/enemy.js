import Animation from '../base/animation';
import { SCREEN_WIDTH, SCREEN_HEIGHT } from '../render';

const ENEMY_IMG_SRC = 'images/enemy.png';
const ENEMY_WIDTH = 60;
const ENEMY_HEIGHT = 60;
const EXPLO_IMG_PREFIX = 'images/explosion';

export default class Enemy extends Animation {
  constructor() {
    super(ENEMY_IMG_SRC, ENEMY_WIDTH, ENEMY_HEIGHT);
    this.baseSpeed = Math.random() * 6 + 3; // 基础飞行速度
    this.movementType = 'straight'; // 移动类型：straight, zigzag, sine
    this.zigzagDirection = 1; // 之字形移动方向
    this.sineOffset = Math.random() * Math.PI * 2; // 正弦波偏移
  }

  init() {
    this.x = this.getRandomX();
    this.y = -this.height;
    this.startX = this.x; // 记录起始X位置

    // 根据难度调整敌机属性
    const speedMultiplier = GameGlobal.databus.getEnemySpeedMultiplier();
    this.speed = this.baseSpeed * speedMultiplier;
    
    // 根据难度决定移动模式
    const specialChance = GameGlobal.databus.getSpecialEnemyChance();
    if (Math.random() < specialChance) {
      this.movementType = Math.random() < 0.5 ? 'zigzag' : 'sine';
    } else {
      this.movementType = 'straight';
    }

    this.isActive = true;
    this.visible = true;
    // 设置爆炸动画
    this.initExplosionAnimation();
  }

  // 生成随机 X 坐标
  getRandomX() {
    return Math.floor(Math.random() * (SCREEN_WIDTH - ENEMY_WIDTH));
  }

  // 预定义爆炸的帧动画
  initExplosionAnimation() {
    const EXPLO_FRAME_COUNT = 19;
    const frames = Array.from(
      { length: EXPLO_FRAME_COUNT },
      (_, i) => `${EXPLO_IMG_PREFIX}${i + 1}.png`
    );
    this.initFrames(frames);
  }

  // 每一帧更新敌人位置
  update() {
    if (GameGlobal.databus.isGameOver) {
      return;
    }

    this.y += this.speed;

    // 根据移动类型更新X坐标
    switch (this.movementType) {
      case 'zigzag':
        this.updateZigzagMovement();
        break;
      case 'sine':
        this.updateSineMovement();
        break;
      case 'straight':
      default:
        // 直线移动，不改变X坐标
        break;
    }

    // 确保敌机不会移出屏幕边界
    this.x = Math.max(0, Math.min(this.x, SCREEN_WIDTH - this.width));

    // 对象回收
    if (this.y > SCREEN_HEIGHT + this.height) {
      this.remove();
    }
  }

  /**
   * 之字形移动模式
   */
  updateZigzagMovement() {
    const zigzagSpeed = 2;
    this.x += zigzagSpeed * this.zigzagDirection;
    
    // 碰到边界时改变方向
    if (this.x <= 0 || this.x >= SCREEN_WIDTH - this.width) {
      this.zigzagDirection *= -1;
    }
  }

  /**
   * 正弦波移动模式
   */
  updateSineMovement() {
    const amplitude = 50; // 振幅
    const frequency = 0.05; // 频率
    const offset = Math.sin((this.y * frequency) + this.sineOffset) * amplitude;
    this.x = this.startX + offset;
  }

  destroy() {
    this.isActive = false;
    // 播放销毁动画后移除
    this.playAnimation();
    GameGlobal.musicManager.playExplosion(); // 播放爆炸音效
    wx.vibrateShort({
      type: 'light'
    }); // 轻微震动
    this.on('stopAnimation', () => this.remove.bind(this));
  }

  remove() {
    this.isActive = false;
    this.visible = false;
    GameGlobal.databus.removeEnemy(this);
  }
}
