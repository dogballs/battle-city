import {
  Alignment,
  Animation,
  GameObject,
  Rect,
  Sprite,
  SpriteRenderer,
  Subject,
} from '../core';

import { SpriteFactory } from '../sprite/SpriteFactory';

export class Spawn extends GameObject {
  public renderer = new SpriteRenderer();
  public completed = new Subject();
  private animation: Animation<Sprite>;

  constructor() {
    super(64, 64);

    this.animation = new Animation(
      [
        SpriteFactory.asOne('spawn.1', new Rect(0, 0, 36, 36)),
        SpriteFactory.asOne('spawn.2', new Rect(0, 0, 44, 44)),
        SpriteFactory.asOne('spawn.3', new Rect(0, 0, 52, 52)),
        SpriteFactory.asOne('spawn.4', new Rect(0, 0, 60, 60)),
      ],
      { delay: 3, loop: 3 },
    );

    this.renderer.alignment = Alignment.MiddleCenter;
  }

  public update(): void {
    if (this.animation.isComplete()) {
      this.completed.notify();
      return;
    }

    this.animation.animate();
    this.renderer.sprite = this.animation.getCurrentFrame();
  }
}
