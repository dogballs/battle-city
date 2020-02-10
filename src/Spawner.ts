import { GameObject, Rotation, Subject, Timer, Vector } from './core';
import {
  GrenadePowerup,
  TankPowerup,
  EnemyBasicTank,
  // EnemyFastTank,
  // EnemyPowerTank,
  EnemyTank,
  PlayerTank,
  Spawn,
  Tank,
} from './gameObjects';
import {
  MapConfig,
  MapConfigSpawnType,
  MapConfigSpawnEnemy,
} from './map/MapConfig';
import { RandomUtils } from './utils';

import { FIELD_SIZE } from './config';

const FPS = 60;

const PLAYER_FIRST_SPAWN_DELAY = 0;
const PLAYER_SPAWN_DELAY = 0;
const ENEMY_FIRST_SPAWN_DELAY = 10;
const ENEMY_SPAWN_DELAY = 3 * FPS;

const ENEMY_MAX_TOTAL_COUNT = 20;
const ENEMY_MAX_ALIVE_COUNT = 4;

const POWERUP_DURATION = 30 * FPS;

// SHIELD STAYS 10 src
// POWERUP STAYS 30 secs, new drop overrides existing
// BASE DEFENCE 20 sec + 3 sec blinking?

enum SpawnLocation {
  EnemyLeft,
  EnemyMid,
  EnemyRight,
  PlayerPrimary,
}

enum PowerupType {
  Grenade,
  Tank,
}

export class Spawner {
  public readonly enemySpawned = new Subject();

  private readonly mapConfig: MapConfig;
  private readonly field: GameObject;

  private locations: Map<SpawnLocation, Vector> = new Map();
  private currentEnemyLocation: SpawnLocation = SpawnLocation.EnemyMid;

  private enemyQueue: MapConfigSpawnEnemy[] = [];
  private aliveEnemyCount = 0;

  private playerSpawnTimer = new Timer();
  private enemySpawnTimer = new Timer();
  private powerupTimer = new Timer();

  private activePowerup: GameObject = null;

  constructor(mapConfig: MapConfig, field: GameObject) {
    this.mapConfig = mapConfig;
    this.field = field;

    this.enemyQueue = mapConfig.spawnEnemies.slice(0, ENEMY_MAX_TOTAL_COUNT);

    this.locations.set(SpawnLocation.PlayerPrimary, new Vector(256, 768));
    this.locations.set(SpawnLocation.EnemyLeft, new Vector(256, 384));
    this.locations.set(SpawnLocation.EnemyMid, new Vector(320, 384));
    this.locations.set(SpawnLocation.EnemyRight, new Vector(384, 384));

    this.playerSpawnTimer.reset(PLAYER_FIRST_SPAWN_DELAY);
    this.playerSpawnTimer.done.addListener(this.handlePlayerSpawnTimer);

    this.enemySpawnTimer.reset(ENEMY_FIRST_SPAWN_DELAY);
    this.enemySpawnTimer.done.addListener(this.handleEnemySpawnTimer);

    this.powerupTimer.done.addListener(this.handlePowerupTimer);
  }

  public update(): void {
    this.playerSpawnTimer.tick();
    this.enemySpawnTimer.tick();
    this.powerupTimer.tick();
  }

  public getUnspawnedEnemiesCount(): number {
    return this.enemyQueue.length;
  }

  private handlePlayerSpawnTimer = (): void => {
    this.spawnPlayer();
  };

  private handleEnemySpawnTimer = (): void => {
    // Happens after max enemies spawn
    if (this.aliveEnemyCount >= ENEMY_MAX_ALIVE_COUNT) {
      this.enemySpawnTimer.stop();
      return;
    }

    // We won!
    if (this.enemyQueue.length === 0) {
      this.enemySpawnTimer.stop();
      return;
    }

    this.spawnEnemy();
    this.aliveEnemyCount += 1;
    this.enemySpawnTimer.reset(ENEMY_SPAWN_DELAY);
  };

  private handlePowerupTimer = (): void => {
    // Remove powerup after timer expires
    if (this.activePowerup === null) {
      return;
    }
    this.activePowerup.removeSelf();
    this.activePowerup = null;
  };

  private spawnPlayer(): void {
    const locationPosition = this.locations.get(SpawnLocation.PlayerPrimary);
    const spawn = new Spawn();
    spawn.position.copy(locationPosition);
    spawn.completed.addListener(() => {
      const tank = new PlayerTank();
      tank.setCenterFrom(spawn);
      tank.died.addListener(() => {
        this.playerSpawnTimer.reset(PLAYER_SPAWN_DELAY);
      });
      spawn.replaceSelf(tank);
    });
    this.field.add(spawn);
  }

  private spawnEnemy(): void {
    const enemyConfig = this.enemyQueue.shift();
    const { hasDrop } = enemyConfig;

    const locationPosition = this.locations.get(this.currentEnemyLocation);

    const spawn = new Spawn();
    spawn.position.copy(locationPosition);
    spawn.completed.addListener(() => {
      const tank = this.createTank(enemyConfig.type, hasDrop) as EnemyTank;
      tank.rotate(Rotation.Down);
      tank.setCenterFrom(spawn);
      tank.died.addListener(() => {
        this.aliveEnemyCount = Math.max(0, this.aliveEnemyCount - 1);
        if (!this.enemySpawnTimer.isActive()) {
          this.enemySpawnTimer.reset(ENEMY_SPAWN_DELAY);
        }
        if (tank.hasDrop) {
          this.spawnPowerup();
        }
      });
      spawn.replaceSelf(tank);
    });

    this.field.add(spawn);

    if (this.currentEnemyLocation === SpawnLocation.EnemyMid) {
      this.currentEnemyLocation = SpawnLocation.EnemyRight;
    } else if (this.currentEnemyLocation === SpawnLocation.EnemyRight) {
      this.currentEnemyLocation = SpawnLocation.EnemyLeft;
    } else if (this.currentEnemyLocation === SpawnLocation.EnemyLeft) {
      this.currentEnemyLocation = SpawnLocation.EnemyMid;
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

    const types = [
      PowerupType.Grenade,
      // PowerupType.Tank
    ];
    const type = RandomUtils.arrayElement(types);

    const powerup = this.createPowerup(type);

    // TODO: Positioning should be smart
    // - on a road
    // - not spawn on top of base/tank/steel or water walls, etc
    const x = RandomUtils.number(0, FIELD_SIZE - powerup.dimensions.width);
    const y = RandomUtils.number(0, FIELD_SIZE - powerup.dimensions.height);

    powerup.position.set(x, y);

    this.field.add(powerup);

    this.activePowerup = powerup;

    this.powerupTimer.reset(POWERUP_DURATION);
  }

  private createTank(type: MapConfigSpawnType, hasDrop = false): Tank {
    switch (type) {
      case MapConfigSpawnType.EnemyBasic:
        return new EnemyBasicTank(hasDrop);
      // case MapConfigSpawnType.EnemyFast:
      //   return new EnemyFastTank(hasDrop);
      // case MapConfigSpawnType.EnemyPower:
      //   return new EnemyPowerTank(hasDrop);
      case MapConfigSpawnType.PlayerPrimary:
      default:
        return new PlayerTank();
    }
  }

  private createPowerup(type: PowerupType): GameObject {
    switch (type) {
      case PowerupType.Grenade:
        return new GrenadePowerup();
      case PowerupType.Tank:
        return new TankPowerup();
      default:
        return new GameObject();
    }
  }
}
