import { State } from '../core';
import { GameUpdateArgs, GameState, Tag } from '../game';
import {
  DumbAiTankBehavior,
  TankColor,
  TankSkinAnimation,
  TankTier,
  TankType,
} from '../tank';

import { Tank } from './Tank';

export class EnemyTank extends Tank {
  public tags = [Tag.Tank, Tag.Enemy];
  public freezeState = new State<boolean>(false);
  private healthSkinAnimations = new Map<number, TankSkinAnimation>();

  constructor(type: TankType) {
    super(type);

    if (this.type.hasDrop) {
      this.ignorePause = true;
    }
  }

  public discardDrop(): this {
    this.type.hasDrop = false;
    this.ignorePause = false;

    // Remove drop animation frames
    this.healthSkinAnimations.forEach((animation) => {
      animation.updateFrames();
    });

    return this;
  }

  protected setup(updateArgs: GameUpdateArgs): void {
    const { spriteLoader } = updateArgs;

    this.behavior = new DumbAiTankBehavior();

    // Currently only tier D tank has more than 1 health
    if (this.type.tier === TankTier.D) {
      this.healthSkinAnimations.set(
        4,
        new TankSkinAnimation(spriteLoader, this.type, [
          TankColor.Default,
          TankColor.Secondary,
        ]),
      );

      this.healthSkinAnimations.set(
        3,
        new TankSkinAnimation(spriteLoader, this.type, [
          TankColor.Default,
          TankColor.Primary,
        ]),
      );

      this.healthSkinAnimations.set(
        2,
        new TankSkinAnimation(spriteLoader, this.type, [
          TankColor.Secondary,
          TankColor.Primary,
        ]),
      );
    }

    this.healthSkinAnimations.set(
      1,
      new TankSkinAnimation(spriteLoader, this.type, [TankColor.Default]),
    );

    this.skinAnimation = this.healthSkinAnimations.get(this.attributes.health);

    super.setup(updateArgs);
  }

  protected update(updateArgs: GameUpdateArgs): void {
    const { gameState } = updateArgs;

    const shouldIdle =
      this.freezeState.hasChangedTo(true) ||
      gameState.hasChangedTo(GameState.Paused);

    if (shouldIdle) {
      this.idle();
    }

    const isIdle = this.freezeState.is(true) || gameState.is(GameState.Paused);

    // Only update animation when idle, other components should not receive
    // updates
    if (isIdle) {
      this.updateAnimation(updateArgs.deltaTime);
      return;
    }

    super.update(updateArgs);
  }

  protected receiveHit(damage: number): void {
    super.receiveHit(damage);

    if (!this.isAlive()) {
      return;
    }

    this.discardDrop();

    this.skinAnimation = this.healthSkinAnimations.get(this.attributes.health);
  }
}
