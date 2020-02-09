import { GameObjectUpdateArgs, GameState } from '../core';
import { Tag } from '../Tag';

import { Tank } from './Tank';

export abstract class EnemyTank extends Tank {
  public tags = [Tag.Tank, Tag.Enemy];
  public readonly hasDrop: boolean = false;

  constructor(width: number, height: number, hasDrop = false) {
    super(width, height);

    this.hasDrop = hasDrop;
    if (hasDrop) {
      this.ignorePause = true;
    }
  }

  update(updateArgs: GameObjectUpdateArgs): void {
    const { gameState } = updateArgs;

    if (gameState.hasChangedTo(GameState.Paused)) {
      this.idle();
    }

    if (gameState.is(GameState.Paused)) {
      this.animation.animate();
      this.material.sprite = this.animation.getCurrentFrame();
      return;
    }

    super.update(updateArgs);
  }
}
