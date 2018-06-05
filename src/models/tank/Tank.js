import Animation from '../../core/Animation.js';
import DisplayObject from '../../core/DisplayObject.js';
import Sprite from '../../core/Sprite.js';
import Texture from '../../core/Texture.js';
import MotionManager from '../../managers/MotionManager.js';

class Tank extends DisplayObject {
  constructor() {
    super(52, 52);

    this.speed = 4;

    this.direction = 'up';

    this.motionManager = new MotionManager();

    this.texture = new Texture('images/sprite.png');

    this.animations = {
      up: new Animation([
        new Sprite(this.texture, {
          x: 1, y: 2, w: 13, h: 13,
        }),
        new Sprite(this.texture, {
          x: 17, y: 2, w: 13, h: 13,
        }),
      ]),
      down: new Animation([
        new Sprite(this.texture, {
          x: 65, y: 1, w: 13, h: 13,
        }),
        new Sprite(this.texture, {
          x: 81, y: 1, w: 13, h: 13,
        }),
      ]),
      right: new Animation([
        new Sprite(this.texture, {
          x: 97, y: 1, w: 13, h: 13,
        }),
        new Sprite(this.texture, {
          x: 113, y: 1, w: 13, h: 13,
        }),
      ]),
      left: new Animation([
        new Sprite(this.texture, {
          x: 34, y: 1, w: 13, h: 13,
        }),
        new Sprite(this.texture, {
          x: 50, y: 1, w: 13, h: 13,
        }),
      ]),
    };
  }

  move() {
    this.motionManager.moveActor(this, this.direction);

    // Any time tank is moved, animate it's movement by showing next
    // animation frame
    const animation = this.animations[this.direction];
    animation.animate();
  }

  rotate(direction) {
    this.direction = direction;
  }

  render() {
    const animation = this.animations[this.direction];
    const sprite = animation.getCurrentFrame();

    return {
      width: this.width,
      height: this.height,
      position: this.position,
      sprite,
    };
  }
}

export default Tank;
