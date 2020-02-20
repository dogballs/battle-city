import { Animation, Rotation, Rect, Sprite } from '../core';
import { Tank, TankState } from '../gameObjects';
import { SpriteFactory } from '../sprite/SpriteFactory';

import { TankTier } from './TankTier';
import { TankParty } from './TankParty';

export enum TankColor {
  Default = 'default',
  Primary = 'primary',
  Danger = 'danger',
}

const SPRITE_TANK_PREFIX = 'tank';
const SPRITE_ID_SEPARATOR = '.';

// TODO: Remake to factory?

type AnimationMap = Map<Rotation, Animation<Sprite>>;

export class TankSkin {
  public readonly party: TankParty;
  public readonly color: TankColor;
  public readonly tier: TankTier;
  public readonly targetRect: Rect;
  public readonly hasDrop: boolean;

  protected rotation: Rotation = Rotation.Up;
  protected tankState: TankState = TankState.Uninitialized;

  protected readonly moveAnimationMap: AnimationMap = new Map();
  protected readonly idleAnimationMap: AnimationMap = new Map();
  protected currentAnimationMap: AnimationMap;

  constructor(
    party: TankParty,
    color: TankColor,
    tier: TankTier,
    targetRect: Rect,
    hasDrop = false,
  ) {
    this.party = party;
    this.color = color;
    this.tier = tier;
    this.targetRect = targetRect;
    this.hasDrop = hasDrop;

    this.idleAnimationMap.set(
      Rotation.Up,
      this.createIdleAnimation(Rotation.Up),
    );
    this.idleAnimationMap.set(
      Rotation.Down,
      this.createIdleAnimation(Rotation.Down),
    );
    this.idleAnimationMap.set(
      Rotation.Left,
      this.createIdleAnimation(Rotation.Left),
    );
    this.idleAnimationMap.set(
      Rotation.Right,
      this.createIdleAnimation(Rotation.Right),
    );

    this.moveAnimationMap.set(
      Rotation.Up,
      this.createMoveAnimation(Rotation.Up),
    );
    this.moveAnimationMap.set(
      Rotation.Down,
      this.createMoveAnimation(Rotation.Down),
    );
    this.moveAnimationMap.set(
      Rotation.Left,
      this.createMoveAnimation(Rotation.Left),
    );
    this.moveAnimationMap.set(
      Rotation.Right,
      this.createMoveAnimation(Rotation.Right),
    );

    this.currentAnimationMap = this.idleAnimationMap;
  }

  public update(tank: Tank): void {
    this.rotation = tank.rotation;

    if (tank.state === this.tankState) {
      const animation = this.currentAnimationMap.get(this.rotation);
      animation.animate();
      return;
    }

    this.tankState = tank.state;
    this.currentAnimationMap =
      tank.state === TankState.Idle
        ? this.idleAnimationMap
        : this.moveAnimationMap;

    const animation = this.currentAnimationMap.get(tank.rotation);
    animation.reset();
  }

  public getCurrentFrame(): Sprite {
    const animation = this.currentAnimationMap.get(this.rotation);
    return animation.getCurrentFrame();
  }

  private createIdleAnimation(rotation): Animation<Sprite> {
    const spriteIds = [];

    const frameNumber = 1;

    spriteIds.push(this.getSpriteId(frameNumber, rotation));

    if (this.hasDrop) {
      spriteIds.push(this.getSpriteId(frameNumber, rotation, true));
    }

    const targetRect = this.getRotationRect(rotation);

    const sprites = spriteIds.map((spriteId) => {
      return SpriteFactory.asOne(spriteId, targetRect);
    });
    const animation = new Animation(sprites, { delay: 7, loop: true });

    return animation;
  }

  protected createMoveAnimation(rotation: Rotation): Animation<Sprite> {
    const spriteIds = [];

    spriteIds.push(this.getSpriteId(1, rotation));
    spriteIds.push(this.getSpriteId(2, rotation));
    spriteIds.push(this.getSpriteId(1, rotation));
    spriteIds.push(this.getSpriteId(2, rotation));

    if (this.hasDrop) {
      spriteIds.push(this.getSpriteId(1, rotation, true));
      spriteIds.push(this.getSpriteId(2, rotation, true));
      spriteIds.push(this.getSpriteId(1, rotation, true));
      spriteIds.push(this.getSpriteId(2, rotation, true));
    }

    const targetRect = this.getRotationRect(rotation);

    const sprites = spriteIds.map((spriteId) => {
      return SpriteFactory.asOne(spriteId, targetRect);
    });
    const animation = new Animation(sprites, { delay: 1, loop: true });

    return animation;
  }

  protected getSpriteId(
    frameNumber: number,
    rotation: Rotation,
    hasDrop = false,
  ): string {
    const color = hasDrop ? TankColor.Danger : this.color;

    const parts = [
      SPRITE_TANK_PREFIX,
      this.getPartyString(this.party),
      this.getColorString(color),
      this.getTierString(this.tier),
      this.getRotationString(rotation),
      frameNumber.toString(),
    ];

    const id = parts.join(SPRITE_ID_SEPARATOR);

    return id;
  }

  protected getColorString(color: TankColor): string {
    return color.toString();
  }

  protected getTierString(tier: TankTier): string {
    return tier.toString();
  }

  protected getPartyString(party: TankParty): string {
    return party.toString();
  }

  protected getRotationString(rotation: Rotation): string {
    switch (rotation) {
      case Rotation.Up:
        return 'up';
      case Rotation.Down:
        return 'down';
      case Rotation.Left:
        return 'left';
      case Rotation.Right:
        return 'right';
    }
  }

  private getRotationRect(rotation: Rotation): Rect {
    if (rotation === Rotation.Up || rotation === Rotation.Down) {
      return this.targetRect;
    }
    const flippedRect = new Rect(
      this.targetRect.x,
      this.targetRect.y,
      this.targetRect.height,
      this.targetRect.width,
    );
    return flippedRect;
  }
}
