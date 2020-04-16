import {
  Collision,
  GameObject,
  Sound,
  Sprite,
  SpritePainter,
  Subject,
  SweptBoxCollider,
} from '../core';
import { GameUpdateArgs, Rotation, RotationMap, Tag } from '../game';
import { TankBulletWallDamage } from '../tank';
import * as config from '../config';

import { SmallExplosion } from './SmallExplosion';
import { TerrainTileDestroyer } from './TerrainTileDestroyer';

export class Bullet extends GameObject {
  public collider = new SweptBoxCollider(this, true);
  public painter = new SpritePainter();
  public zIndex = config.BULLET_Z_INDEX;
  public tankDamage: number;
  public wallDamage: number;
  public speed: number;
  public tags = [Tag.Bullet];
  public died = new Subject();
  private sprites = new RotationMap<Sprite>();
  private hitBrickSound: Sound;
  private hitSteelSound: Sound;

  constructor(speed: number, tankDamage: number, wallDamage: number) {
    super(12, 16);

    this.speed = speed;
    this.tankDamage = tankDamage;
    this.wallDamage = wallDamage;

    this.pivot.set(0.5, 0.5);
  }

  protected setup({
    audioLoader,
    collisionSystem,
    spriteLoader,
  }: GameUpdateArgs): void {
    collisionSystem.register(this.collider);

    this.hitBrickSound = audioLoader.load('hit.brick');
    this.hitSteelSound = audioLoader.load('hit.steel');

    this.sprites.set(Rotation.Up, spriteLoader.load('bullet.up'));
    this.sprites.set(Rotation.Down, spriteLoader.load('bullet.down'));
    this.sprites.set(Rotation.Left, spriteLoader.load('bullet.left'));
    this.sprites.set(Rotation.Right, spriteLoader.load('bullet.right'));
  }

  protected update(updateArgs: GameUpdateArgs): void {
    this.translateY(this.speed * updateArgs.deltaTime);

    const rotation = this.getWorldRotation();
    this.painter.sprite = this.sprites.get(rotation);

    this.collider.update();
  }

  protected collide(collision: Collision): void {
    const { contacts } = collision;

    const bulletContacts = contacts.filter((contact) => {
      return contact.collider.object.tags.includes(Tag.Bullet);
    });

    bulletContacts.forEach((contact) => {
      const bullet = contact.collider.object as Bullet;

      // Enemy bullets don't discard each other, they pass thru
      if (bullet.tags.includes(Tag.Enemy) && this.tags.includes(Tag.Enemy)) {
        return;
      }

      // Player bullets pass thru
      if (bullet.tags.includes(Tag.Player) && this.tags.includes(Tag.Player)) {
        return;
      }

      // When player bullet hits enemy bullet and vice versa, they dissappear
      this.nullify();
      bullet.nullify();
    });

    const wallContacts = contacts.filter((contact) => {
      return contact.collider.object.tags.includes(Tag.Wall);
    });

    // Find closest wall we are colliding with. It solves the "tunneling"
    // problem when bullet is going too fast it can jump over some walls.
    // By using swept box collider and then finding closest points of contact,
    // we make bullet interact with the first object on the way.
    // Bullet can also hit multiple blocks (most likely two) at the same time.
    let minDistance = null;

    wallContacts.forEach((contact) => {
      const prevBox = this.collider.getPrevBox();
      const distance = prevBox.distanceCenterToCenter(contact.box);

      if (minDistance === null || distance < minDistance) {
        minDistance = distance;
      }
    });

    const closestWallContacts = wallContacts.filter((contact) => {
      const prevBox = this.collider.getPrevBox();
      const distance = prevBox.distanceCenterToCenter(contact.box);

      return distance === minDistance;
    });

    if (closestWallContacts.length > 0) {
      const firstClosestWallContact = closestWallContacts[0];
      const wallWorldBox = firstClosestWallContact.box;

      const selfWorldBox = this.getWorldBoundingBox();

      // Reposition bullet to the place where it hits the wall so explosion
      // will go off in the right place. Now it is tied to axis.
      const rotation = this.getWorldRotation();
      if (rotation === Rotation.Up) {
        this.translateY(selfWorldBox.max.y - wallWorldBox.max.y);
      } else if (rotation === Rotation.Down) {
        this.translateY(wallWorldBox.min.y - selfWorldBox.min.y);
      } else if (rotation === Rotation.Left) {
        this.translateY(selfWorldBox.max.x - wallWorldBox.max.x);
      } else if (rotation === Rotation.Right) {
        this.translateY(wallWorldBox.min.x - selfWorldBox.min.x);
      }
      this.updateMatrix();

      const wall = firstClosestWallContact.collider.object;

      const isBrickWall = wall.tags.includes(Tag.Brick);
      const isBorderWall = wall.tags.includes(Tag.Border);
      const isSteelWall = wall.tags.includes(Tag.Steel);

      const canDestroySteelWall = this.wallDamage === TankBulletWallDamage.High;

      if (isBrickWall || (isSteelWall && canDestroySteelWall)) {
        const destroyer = new TerrainTileDestroyer(this.wallDamage);

        this.add(destroyer);
        destroyer.updateWorldMatrix(true);
        destroyer.setCenter(this.getSelfCenter());

        // At this point destroyer is aligned by the main axis, i.e.
        // if bullet rotation is left/right - destroyer is aligned at "y";
        // if bullet rotation is up/down - destroyer is aligned at "x".
        // What is left is to fix counterpart axis.

        destroyer.updateWorldMatrix();
        const destroyerWorldBox = destroyer.getWorldBoundingBox();

        const rotation = destroyer.getWorldRotation();
        if (rotation === Rotation.Up) {
          destroyer.translateY(destroyerWorldBox.max.y - wallWorldBox.max.y);
        } else if (rotation === Rotation.Down) {
          destroyer.translateY(wallWorldBox.min.y - destroyerWorldBox.min.y);
        } else if (rotation === Rotation.Left) {
          destroyer.translateY(destroyerWorldBox.max.x - wallWorldBox.max.x);
        } else if (rotation === Rotation.Right) {
          destroyer.translateY(wallWorldBox.min.x - destroyerWorldBox.min.x);
        }

        this.parent.attach(destroyer);

        // TODO: it collides with multiple "bricks", multiple audio sources are
        // triggered
        // Only player bullets make sound
        if (this.tags.includes(Tag.Player)) {
          this.hitBrickSound.play();
        }
      } else if (isSteelWall || isBorderWall) {
        // TODO: when tank is grade 4, it can destroy steel walls, and in that
        // case they make the same sound as brick walls
        // Only player bullets make sound
        if (this.tags.includes(Tag.Player)) {
          this.hitSteelSound.play();
        }
      }

      this.explode();
    }
  }

  public nullify(): void {
    this.removeSelf();

    this.collider.unregister();

    this.died.notify(null);
  }

  public explode(): void {
    const explosion = new SmallExplosion();
    explosion.setCenter(this.getCenter());
    this.replaceSelf(explosion);

    this.collider.unregister();

    this.died.notify(null);
  }
}
