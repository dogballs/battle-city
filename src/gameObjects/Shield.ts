import {
  Animation,
  GameObject,
  GameObjectUpdateArgs,
  GameState,
  Sprite,
  SpriteRenderer,
} from '../core';

import { SpriteFactory } from '../sprite/SpriteFactory';

export class Shield extends GameObject {
  public ignorePause = true;
  public renderer = new SpriteRenderer();
  private animation: Animation<Sprite>;

  constructor() {
    super(64, 64);

    this.animation = new Animation(
      SpriteFactory.asList(['shield.1', 'shield.2']),
      { delay: 3, loop: true },
    );
  }

  public update({ gameState }: GameObjectUpdateArgs): void {
    // Shield is not displayed during a pause
    if (gameState.hasChangedTo(GameState.Paused)) {
      this.visible = false;
    }
    if (gameState.hasChangedTo(GameState.Playing)) {
      this.visible = true;
    }
    if (gameState.is(GameState.Paused)) {
      return;
    }

    this.animation.animate();
    this.renderer.sprite = this.animation.getCurrentFrame();
  }
}
