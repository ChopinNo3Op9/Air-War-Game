import Animation from '../base/animation';
import { SCREEN_WIDTH, SCREEN_HEIGHT } from '../render';
import Bullet from './bullet';

// 玩家相关常量设置
const PLAYER_IMG_SRC = 'images/hero.png';
const PLAYER_WIDTH = 80;
const PLAYER_HEIGHT = 80;
const EXPLO_IMG_PREFIX = 'images/explosion';
const PLAYER_SHOOT_INTERVAL = 20;

export default class Player extends Animation {
  constructor() {
    super(PLAYER_IMG_SRC, PLAYER_WIDTH, PLAYER_HEIGHT);

    // 初始化坐标
    this.init();

    // 初始化事件监听
    this.initEvent();
  }

  init() {
    // 玩家默认处于屏幕底部居中位置
    this.x = SCREEN_WIDTH / 2 - this.width / 2;
    this.y = SCREEN_HEIGHT - this.height - 30;

    // 用于在手指移动的时候标识手指是否已经在飞机上了
    this.touched = false;

    this.isActive = true;
    this.visible = true;

    // 设置爆炸动画
    this.initExplosionAnimation();
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

  /**
   * 判断手指是否在飞机上
   * @param {Number} x: 手指的X轴坐标
   * @param {Number} y: 手指的Y轴坐标
   * @return {Boolean}: 用于标识手指是否在飞机上的布尔值
   */
  checkIsFingerOnAir(x, y) {
    const deviation = 30;
    return (
      x >= this.x - deviation &&
      y >= this.y - deviation &&
      x <= this.x + this.width + deviation &&
      y <= this.y + this.height + deviation
    );
  }

  /**
   * 根据手指的位置设置飞机的位置
   * 保证手指处于飞机中间
   * 同时限定飞机的活动范围限制在屏幕中
   */
  setAirPosAcrossFingerPosZ(x, y) {
    const disX = Math.max(
      0,
      Math.min(x - this.width / 2, SCREEN_WIDTH - this.width)
    );
    const disY = Math.max(
      0,
      Math.min(y - this.height / 2, SCREEN_HEIGHT - this.height)
    );

    this.x = disX;
    this.y = disY;
  }

  /**
   * 玩家响应手指的触摸事件
   * 改变战机的位置
   */
  initEvent() {
    wx.onTouchStart((e) => {
      const { clientX: x, clientY: y } = e.touches[0];

      if (GameGlobal.databus.isGameOver) {
        return;
      }
      if (this.checkIsFingerOnAir(x, y)) {
        this.touched = true;
        this.setAirPosAcrossFingerPosZ(x, y);
      }
    });

    wx.onTouchMove((e) => {
      const { clientX: x, clientY: y } = e.touches[0];

      if (GameGlobal.databus.isGameOver) {
        return;
      }
      if (this.touched) {
        this.setAirPosAcrossFingerPosZ(x, y);
      }
    });

    wx.onTouchEnd((e) => {
      this.touched = false;
    });

    wx.onTouchCancel((e) => {
      this.touched = false;
    });
  }

  /**
   * 玩家射击操作
   * 射击时机由外部决定
   */
  shoot() {
    const upgradeLevel = GameGlobal.databus.getUpgradeLevel();
    
    switch (upgradeLevel) {
      case 0:
        // Level 0: Single bullet
        this.shootSingle();
        break;
      case 1:
        // Level 1: Double bullets
        this.shootDouble();
        break;
      case 2:
        // Level 2: Triple bullets
        this.shootTriple();
        break;
      case 3:
        // Level 3: Spread pattern
        this.shootSpread();
        break;
      case 4:
        // Level 4: Enhanced spread
        this.shootEnhancedSpread();
        break;
      default:
        // Level 5+: Maximum firepower
        this.shootMaximum();
        break;
    }
    
    GameGlobal.musicManager.playShoot(); // 播放射击音效
  }

  /**
   * 单发射击
   */
  shootSingle() {
    const bullet = GameGlobal.databus.pool.getItemByClass('bullet', Bullet);
    bullet.init(this.x + this.width / 2 - bullet.width / 2, this.y - 10, 10);
    GameGlobal.databus.bullets.push(bullet);
  }

  /**
   * 双发射击
   */
  shootDouble() {
    const bullet1 = GameGlobal.databus.pool.getItemByClass('bullet', Bullet);
    const bullet2 = GameGlobal.databus.pool.getItemByClass('bullet', Bullet);
    
    bullet1.init(this.x + this.width / 3 - bullet1.width / 2, this.y - 10, 10);
    bullet2.init(this.x + (this.width * 2) / 3 - bullet2.width / 2, this.y - 10, 10);
    
    GameGlobal.databus.bullets.push(bullet1, bullet2);
  }

  /**
   * 三发射击
   */
  shootTriple() {
    const bullet1 = GameGlobal.databus.pool.getItemByClass('bullet', Bullet);
    const bullet2 = GameGlobal.databus.pool.getItemByClass('bullet', Bullet);
    const bullet3 = GameGlobal.databus.pool.getItemByClass('bullet', Bullet);
    
    bullet1.init(this.x + this.width / 4 - bullet1.width / 2, this.y - 10, 10);
    bullet2.init(this.x + this.width / 2 - bullet2.width / 2, this.y - 10, 10);
    bullet3.init(this.x + (this.width * 3) / 4 - bullet3.width / 2, this.y - 10, 10);
    
    GameGlobal.databus.bullets.push(bullet1, bullet2, bullet3);
  }

  /**
   * 扩散射击
   */
  shootSpread() {
    const angles = [-0.3, -0.15, 0, 0.15, 0.3]; // 射击角度
    
    angles.forEach(angle => {
      const bullet = GameGlobal.databus.pool.getItemByClass('bullet', Bullet);
      bullet.init(
        this.x + this.width / 2 - bullet.width / 2, 
        this.y - 10, 
        10, 
        angle
      );
      GameGlobal.databus.bullets.push(bullet);
    });
  }

  /**
   * 增强扩散射击
   */
  shootEnhancedSpread() {
    const angles = [-0.4, -0.2, -0.1, 0, 0.1, 0.2, 0.4]; // 更多射击角度
    
    angles.forEach(angle => {
      const bullet = GameGlobal.databus.pool.getItemByClass('bullet', Bullet);
      bullet.init(
        this.x + this.width / 2 - bullet.width / 2, 
        this.y - 10, 
        12, // 更快的子弹速度
        angle
      );
      GameGlobal.databus.bullets.push(bullet);
    });
  }

  /**
   * 最大火力射击
   */
  shootMaximum() {
    const angles = [-0.5, -0.3, -0.15, -0.05, 0, 0.05, 0.15, 0.3, 0.5]; // 最多射击角度
    
    angles.forEach(angle => {
      const bullet = GameGlobal.databus.pool.getItemByClass('bullet', Bullet);
      bullet.init(
        this.x + this.width / 2 - bullet.width / 2, 
        this.y - 10, 
        15, // 最快的子弹速度
        angle
      );
      GameGlobal.databus.bullets.push(bullet);
    });
  }

  update() {
    if (GameGlobal.databus.isGameOver) {
      return;
    }

    // 每20帧让玩家射击一次
    if (GameGlobal.databus.frame % PLAYER_SHOOT_INTERVAL === 0) {
      this.shoot(); // 玩家射击
    }
  }

  destroy() {
    this.isActive = false;
    this.playAnimation();
    GameGlobal.musicManager.playExplosion(); // 播放爆炸音效
    wx.vibrateShort({
      type: 'medium'
    }); // 震动
  }
}
