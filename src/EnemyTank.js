import Actor from './Actor.js';
import Animation from './Animation.js';
import Sprite from './Sprite.js';
import TextureLoader from './TextureLoader.js';

// TODO: create base class for tank with common behavior for both enemy and
// player tanks to avoid repetition.

class EnemyTank extends Actor {
  constructor() {
    super(100, 100);

    this.speed = 5;

    this.direction = 'up';

    this.texture = new TextureLoader().load('images/sprite.png');

    this.animations = {
      up: new Animation([
        new Sprite(this.texture, { x: 129, y: 2, w: 13, h: 13 }),
        new Sprite(this.texture, { x: 145, y: 2, w: 13, h: 13 }),
      ]),
      down: new Animation([
        new Sprite(this.texture, { x: 193, y: 1, w: 13, h: 13 }),
        new Sprite(this.texture, { x: 209, y: 1, w: 13, h: 13 }),
      ]),
      right: new Animation([
        new Sprite(this.texture, { x: 162, y: 1, w: 13, h: 13 }),
        new Sprite(this.texture, { x: 178, y: 1, w: 13, h: 13 }),
      ]),
      left: new Animation([
        new Sprite(this.texture, { x: 225, y: 1, w: 13, h: 13 }),
        new Sprite(this.texture, { x: 241, y: 1, w: 13, h: 13 }),
      ]),
    };
  }

  move() {
    if (this.direction === 'up') {
      this.position.y -= this.speed;
    } else if (this.direction === 'down') {
      this.position.y += this.speed;
    } else if (this.direction === 'right') {
      this.position.x += this.speed;
    } else if (this.direction === 'left') {
      this.position.x -= this.speed;
    }

    // Any time tank is moved, animate it's movement by showing next
    // animation frame.
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

export default EnemyTank;
