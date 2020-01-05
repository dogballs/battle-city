import { Collision, GameObject } from '../core';

export class CollideTankWithWall {
  private collision: Collision;
  private scene: GameObject;

  constructor(collision, scene) {
    this.collision = collision;

    // TODO: @mradionov Decouple scene from collisions.
    this.scene = scene;
  }

  public collide() {
    const tank = this.collision.target;
    const wall = this.collision.source;

    const wallBoundingBox = wall.getWorldBoundingBox();
    const { width, height } = tank.getComputedDimensions();

    // Fix tank position depending on what wall he hits, so the tank won't be
    // able to pass thru the wall.
    if (tank.rotation === GameObject.Rotation.Up) {
      tank.position.y = wallBoundingBox.max.y + height / 2;
    } else if (tank.rotation === GameObject.Rotation.Down) {
      tank.position.y = wallBoundingBox.min.y - height / 2;
    } else if (tank.rotation === GameObject.Rotation.Left) {
      tank.position.x = wallBoundingBox.max.x + width / 2;
    } else if (tank.rotation === GameObject.Rotation.Right) {
      tank.position.x = wallBoundingBox.min.x - width / 2;
    }
  }
}