import Sprite from '../base/sprite';

const BULLET_IMG_SRC = 'images/bullet.png';
const BULLET_WIDTH = 16;
const BULLET_HEIGHT = 30;

export default class Bullet extends Sprite {
  constructor() {
    super(BULLET_IMG_SRC, BULLET_WIDTH, BULLET_HEIGHT);
  }

  init(x, y, speed, angle = 0) {
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.angle = angle; // 射击角度
    this.isActive = true;
    this.visible = true;
  }

  // 每一帧更新子弹位置
  update() {
    if (GameGlobal.databus.isGameOver) {
      return;
    }
  
    // 支持角度射击
    this.y -= this.speed * Math.cos(this.angle || 0);
    this.x += this.speed * Math.sin(this.angle || 0);

    // 超出屏幕外销毁
    if (this.y < -this.height || this.x < -this.width || this.x > 375 + this.width) {
      this.destroy();
    }
  }

  destroy() {
    this.isActive = false;
    // 子弹没有销毁动画，直接移除
    this.remove();
  }

  remove() {
    this.isActive = false;
    this.visible = false;
    // 回收子弹对象
    GameGlobal.databus.removeBullets(this);
  }
}
