import Animation from './../core/Animation';
import RenderableSprite from './../core/RenderableSprite';
import Sprite from './../core/Sprite';
import Texture from './../core/Texture';

class BulletExplosion extends RenderableSprite {
  constructor() {
    super(44, 44);

    this.texture = new Texture('images/sprite.png');

    this.animation = new Animation([
      new Sprite(this.texture, {
        x: 259, y: 130, w: 11, h: 11,
      }),
      new Sprite(this.texture, {
        x: 273, y: 129, w: 15, h: 15,
      }),
      new Sprite(this.texture, {
        x: 288, y: 128, w: 16, h: 16,
      }),
    ], { delay: 50, loop: false });

    // Each sprite fragment has different size. Try to match it with
    // canvas size for different animation frames.
    this.dimensions = [
      { width: 44, height: 44 },
      { width: 60, height: 60 },
      { width: 64, height: 64 },
    ];
  }

  // TODO: @mradionov rethink how to notify parent when animation is ended
  // eslint-disable-next-line class-methods-use-this
  onComplete() {}

  update() {
    if (this.animation.isComplete()) {
      this.onComplete();
    } else {
      this.animation.animate();
    }
  }

  render() {
    const sprite = this.animation.getCurrentFrame();
    const { frameIndex } = this.animation;

    const { width, height } = this.dimensions[frameIndex];

    return {
      width,
      height,
      sprite,
    };
  }
}

export default BulletExplosion;
