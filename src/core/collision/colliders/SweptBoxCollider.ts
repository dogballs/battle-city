import { BoundingBox } from '../../BoundingBox';
import { Vector } from '../../Vector';

import { Collider } from '../Collider';

export class SweptBoxCollider extends Collider {
  private prevBox: BoundingBox;
  private currentBox: BoundingBox;
  private sumBox: BoundingBox;

  public init(): void {
    const box = this.object.getWorldBoundingBox();

    this.prevBox = box.clone();
    this.currentBox = box.clone();
    this.sumBox = this.prevBox.clone().unionWith(this.currentBox);
  }

  public update(): void {
    const box = this.object.getWorldBoundingBox();

    this.prevBox = this.currentBox;
    this.currentBox = box.clone();
    this.sumBox = this.prevBox.clone().unionWith(this.currentBox);
  }

  public getBox(): BoundingBox {
    return this.sumBox;
  }

  public getCurrentBox(): BoundingBox {
    return this.currentBox;
  }

  public getPrevBox(): BoundingBox {
    return this.prevBox;
  }

  public getDirection(): Vector {
    const prevCenter = this.prevBox.getCenter();
    const currentCenter = this.currentBox.getCenter();

    const dx = currentCenter.x - prevCenter.x;
    const dy = currentCenter.y - prevCenter.y;

    const direction = new Vector(dx, dy);

    return direction;
  }
}
