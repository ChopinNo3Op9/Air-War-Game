import Pool from './base/pool';

let instance;

/**
 * 全局状态管理器
 * 负责管理游戏的状态，包括帧数、分数、子弹、敌人和动画等
 */
export default class DataBus {
  // 直接在类中定义实例属性
  enemys = []; // 存储敌人
  bullets = []; // 存储子弹
  animations = []; // 存储动画
  frame = 0; // 当前帧数
  score = 0; // 当前分数
  upgradeLevel = 0; // 升级等级
  lastUpgradeScore = 0; // 上次升级时的分数
  isGameOver = false; // 游戏是否结束
  pool = new Pool(); // 初始化对象池

  constructor() {
    // 确保单例模式
    if (instance) return instance;

    instance = this;
  }

  // 重置游戏状态
  reset() {
    this.frame = 0; // 当前帧数
    this.score = 0; // 当前分数
    this.upgradeLevel = 0; // 升级等级
    this.lastUpgradeScore = 0; // 上次升级时的分数
    this.bullets = []; // 存储子弹
    this.enemys = []; // 存储敌人
    this.animations = []; // 存储动画
    this.isGameOver = false; // 游戏是否结束
  }

  // 游戏结束
  gameOver() {
    this.isGameOver = true;
  }

  /**
   * 回收敌人，进入对象池
   * 此后不进入帧循环
   * @param {Object} enemy - 要回收的敌人对象
   */
  removeEnemy(enemy) {
    const temp = this.enemys.splice(this.enemys.indexOf(enemy), 1);
    if (temp) {
      this.pool.recover('enemy', enemy); // 回收敌人到对象池
    }
  }

  /**
   * 回收子弹，进入对象池
   * 此后不进入帧循环
   * @param {Object} bullet - 要回收的子弹对象
   */
  removeBullets(bullet) {
    const temp = this.bullets.splice(this.bullets.indexOf(bullet), 1);
    if (temp) {
      this.pool.recover('bullet', bullet); // 回收子弹到对象池
    }
  }

  /**
   * 获取升级所需分数表
   * 早期等级升级容易，后期等级升级困难
   */
  getUpgradeRequirements() {
    return [0, 10, 30, 60, 100, 150];
  }

  /**
   * 检查是否需要升级
   * 使用非线性升级系统
   */
  checkUpgrade() {
    const requirements = this.getUpgradeRequirements();
    let newLevel = 0;
    
    // 找到当前分数对应的等级
    for (let i = 0; i < requirements.length; i++) {
      if (this.score >= requirements[i]) {
        newLevel = i;
      } else {
        break;
      }
    }
    
    if (newLevel > this.upgradeLevel) {
      this.upgradeLevel = newLevel;
      this.lastUpgradeScore = this.score;
      return true;
    }
    return false;
  }

  /**
   * 获取下次升级所需分数
   */
  getNextUpgradeScore() {
    const requirements = this.getUpgradeRequirements();
    const nextLevel = this.upgradeLevel + 1;
    
    if (nextLevel < requirements.length) {
      return requirements[nextLevel];
    }
    return null; // 已达到最高等级
  }

  /**
   * 获取当前升级等级
   */
  getUpgradeLevel() {
    return Math.min(this.upgradeLevel, 5); // 最大升级到5级
  }

  /**
   * 获取敌机生成间隔（基于升级等级）
   * 等级越高，敌机生成越频繁
   */
  getEnemySpawnInterval() {
    const baseInterval = 30;
    const level = this.getUpgradeLevel();
    return Math.max(baseInterval - (level * 4), 10); // 最快每10帧生成一个
  }

  /**
   * 获取敌机速度倍数（基于升级等级）
   * 等级越高，敌机飞得越快
   */
  getEnemySpeedMultiplier() {
    const level = this.getUpgradeLevel();
    return 1 + (level * 0.3); // 每级增加30%速度
  }

  /**
   * 获取敌机变异概率（基于升级等级）
   * 等级越高，越容易出现特殊敌机
   */
  getSpecialEnemyChance() {
    const level = this.getUpgradeLevel();
    return Math.min(level * 0.15, 0.6); // 最高60%概率出现特殊敌机
  }
}
