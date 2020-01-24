import { GameObject, Sprite, SpriteMaterial } from '../core';
import { SpriteFactory } from '../sprite/SpriteFactory';
import { Tag } from './Tag';

export class BrickWall extends GameObject {
  public tags = [Tag.Wall, Tag.Brick];
  private readonly sprites: Sprite[];

  constructor() {
    super(16, 16);

    this.sprites = SpriteFactory.asList([
      'wall.brick.1',
      'wall.brick.2',
      'wall.brick.3',
      'wall.brick.4',
      'wall.brick.5',
      'wall.brick.6',
      'wall.brick.7',
      'wall.brick.8',
    ]);

    this.material = new SpriteMaterial();
    this.material.sprite = this.getSpriteByPosition();
  }

  public update(): void {
    this.material.sprite = this.getSpriteByPosition();
  }

  private getSpriteByPosition(): Sprite {
    const horizontalIndex = (this.position.x % 64) / 16;
    const verticalIndex = (this.position.y % 32) / 16;
    const index = horizontalIndex + verticalIndex * 4;

    const sprite = this.sprites[index];

    return sprite;
  }
}
