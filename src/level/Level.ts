import {
  AudioLoader,
  GameObject,
  RandomUtils,
  Rotation,
  Subject,
  Timer,
  Vector,
} from '../core';
import {
  Base,
  EnemyBasicTank,
  EnemyFastTank,
  EnemyTank,
  Explosion,
  PlayerTank,
  Points,
  Spawn,
} from '../gameObjects';
import { MapConfig, MapConfigSpawnEnemyListItem } from '../map';
import { PointsValue } from '../points';
import { PowerupFactory } from '../powerups';
import { TankDeathReason, TankTier } from '../tank';

import * as config from '../config';

const DEFAULT_ENEMY_LOCATIONS = [
  new Vector(384, 0),
  new Vector(768, 0),
  new Vector(0, 0),
];

const DEFAULT_PLAYER_LOCATIONS = [new Vector(256, 768)];

export class Level {
  public readonly enemySpawned = new Subject();

  public readonly mapConfig: MapConfig;
  public readonly field: GameObject;
  public readonly base: Base;
  private readonly audioLoader: AudioLoader;

  public playerTank: PlayerTank;

  private enemyLocations: Vector[];
  private enemyLocationIndex = 0;
  private enemyList: MapConfigSpawnEnemyListItem[] = [];
  private enemyTimer = new Timer();
  private aliveEnemyCount = 0;

  private playerLocations: Vector[];
  private playerTimers: Timer[];

  private powerupTimer = new Timer();
  private activePowerup: GameObject = null;

  constructor(
    mapConfig: MapConfig,
    field: GameObject,
    base: Base,
    audioLoader: AudioLoader,
  ) {
    this.mapConfig = mapConfig;
    this.field = field;
    this.base = base;
    this.audioLoader = audioLoader;

    this.enemyList = mapConfig.spawn.enemy.list.slice(
      0,
      config.ENEMY_MAX_TOTAL_COUNT,
    );

    const configPlayerLocations = mapConfig.spawn.player.locations.map(
      (location) => {
        return new Vector(location.x, location.y);
      },
    );

    this.playerLocations =
      configPlayerLocations.length > 0
        ? configPlayerLocations
        : DEFAULT_PLAYER_LOCATIONS;

    this.playerTimers = this.playerLocations.map((_, index) => {
      const timer = new Timer(config.PLAYER_FIRST_SPAWN_DELAY);
      timer.done.addListener(() => {
        this.handlePlayerSpawnTimer(index);
      });
      return timer;
    });

    const configEnemyLocations = mapConfig.spawn.enemy.locations.map(
      (location) => {
        return new Vector(location.x, location.y);
      },
    );
    this.enemyLocations =
      configEnemyLocations.length > 0
        ? configEnemyLocations
        : DEFAULT_ENEMY_LOCATIONS;

    this.enemyTimer.reset(config.ENEMY_FIRST_SPAWN_DELAY);
    this.enemyTimer.done.addListener(this.handleEnemySpawnTimer);

    this.powerupTimer.done.addListener(this.handlePowerupTimer);
  }

  public update(): void {
    this.playerTimers.forEach((timer) => {
      timer.tick();
    });

    this.enemyTimer.tick();

    this.powerupTimer.tick();
  }

  public getUnspawnedEnemiesCount(): number {
    return this.enemyList.length;
  }

  private handlePlayerSpawnTimer = (index: number): void => {
    this.spawnPlayer(index);
  };

  private handleEnemySpawnTimer = (): void => {
    // Happens after max enemies spawn
    if (this.aliveEnemyCount >= config.ENEMY_MAX_ALIVE_COUNT) {
      this.enemyTimer.stop();
      return;
    }

    // We won!
    if (this.enemyList.length === 0) {
      this.enemyTimer.stop();
      return;
    }

    this.spawnEnemy();
    this.aliveEnemyCount += 1;
    this.enemyTimer.reset(config.ENEMY_SPAWN_DELAY);
  };

  private handlePowerupTimer = (): void => {
    // Remove powerup after timer expires
    if (this.activePowerup === null) {
      return;
    }
    this.activePowerup.removeSelf();
    this.activePowerup = null;
  };

  private spawnPlayer(index: number): void {
    const location = this.playerLocations[index];
    const timer = this.playerTimers[index];

    const spawn = new Spawn();
    spawn.position.copyFrom(location);
    spawn.completed.addListener(() => {
      const tank = new PlayerTank();
      tank.setCenterFrom(spawn);
      tank.died.addListener(() => {
        const explosion = new Explosion();
        explosion.setCenterFrom(tank);
        tank.replaceSelf(explosion);

        this.audioLoader.load('explosion.player').play();
        timer.reset(config.PLAYER_SPAWN_DELAY);
      });
      tank.activateShield(config.SHIELD_SPAWN_DURATION);

      this.playerTank = tank;

      spawn.replaceSelf(tank);
    });
    this.field.add(spawn);
  }

  private spawnEnemy(): void {
    const enemyConfig = this.enemyList.shift();
    const { drop: hasDrop } = enemyConfig;

    // When new tank with powerup spawns - remove active powerup
    if (hasDrop && this.activePowerup !== null) {
      this.powerupTimer.stop();
      this.activePowerup.removeSelf();
      this.activePowerup = null;
    }

    const location = this.enemyLocations[this.enemyLocationIndex];

    // TODO: refactor this chain of subscriptions
    const spawn = new Spawn();
    spawn.position.copyFrom(location);
    spawn.completed.addListener(() => {
      const tank = this.createEnemyTank(enemyConfig.tier, hasDrop) as EnemyTank;
      tank.rotate(Rotation.Down);
      tank.setCenterFrom(spawn);
      tank.died.addListener((event) => {
        // TODO: grenade explosion explodes multiple enemies, should trigger
        // single audio
        this.audioLoader.load('explosion.enemy').play();

        this.aliveEnemyCount = Math.max(0, this.aliveEnemyCount - 1);
        if (!this.enemyTimer.isActive()) {
          this.enemyTimer.reset(config.ENEMY_SPAWN_DELAY);
        }

        if (tank.hasDrop) {
          this.spawnPowerup();
        }

        const explosion = new Explosion();
        explosion.setCenterFrom(tank);
        tank.replaceSelf(explosion);

        // Only player kills are awarded
        if (event.reason === TankDeathReason.Bullet) {
          explosion.done.addListenerOnce(() => {
            const points = this.createEnemyTankPoints(tank);
            points.setCenterFrom(tank);
            this.field.add(points);
          });
        }
      });
      spawn.replaceSelf(tank);
    });

    this.field.add(spawn);

    this.enemyLocationIndex += 1;
    if (this.enemyLocationIndex >= this.enemyLocations.length) {
      this.enemyLocationIndex = 0;
    }

    this.enemySpawned.notify();
  }

  private spawnPowerup(): void {
    // Override previous powerup with newly picked up one
    if (this.activePowerup !== null) {
      this.powerupTimer.stop();
      this.activePowerup.removeSelf();
      this.activePowerup = null;
    }

    const powerup = PowerupFactory.createRandom();

    // TODO: Positioning should be smart
    // - on a road
    // - not spawn on top of base/tank/steel or water walls, etc
    const x = RandomUtils.number(0, config.FIELD_SIZE - powerup.size.width);
    const y = RandomUtils.number(0, config.FIELD_SIZE - powerup.size.height);

    powerup.position.set(x, y);

    powerup.picked.addListener(() => {
      powerup.action.execute(this.playerTank, powerup, this.base);

      const points = new Points(
        PointsValue.V500,
        config.POINTS_POWERUP_DURATION,
      );
      points.setCenterFrom(powerup);
      this.field.add(points);
    });

    this.field.add(powerup);

    this.activePowerup = powerup;

    this.powerupTimer.reset(config.POWERUP_DURATION);

    this.audioLoader.load('powerup.spawn').play();
  }

  private createEnemyTankPoints(tank: EnemyTank): Points {
    const value = this.getEnemyTankPointsValue(tank);
    const points = new Points(value, config.POINTS_ENEMY_TANK_DURATION);
    return points;
  }

  private getEnemyTankPointsValue(tank: EnemyTank): PointsValue {
    switch (tank.type.tier) {
      case TankTier.A:
        return PointsValue.V100;
      case TankTier.B:
        return PointsValue.V200;
      case TankTier.C:
        return PointsValue.V300;
      case TankTier.D:
        return PointsValue.V400;
      default:
        return 0;
    }
  }

  private createEnemyTank(tier: TankTier, hasDrop = false): EnemyTank {
    switch (tier) {
      case TankTier.B:
        return new EnemyFastTank(hasDrop);
      case TankTier.A:
      default:
        return new EnemyBasicTank(hasDrop);
    }
  }
}
