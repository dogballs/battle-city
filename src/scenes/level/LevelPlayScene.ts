import { CollisionDetector, Rect, Scene, Timer } from '../../core';
import { GameUpdateArgs, GameState, Session } from '../../game';
import { Border } from '../../gameObjects';
import { PowerupType } from '../../powerup';
import { TerrainFactory } from '../../terrain';
import * as config from '../../config';

import { LevelEventBus, LevelWorld } from '../../level';
import {
  LevelEnemyDiedEvent,
  LevelPowerupPickedEvent,
} from '../../level/events';
import {
  LevelAudioScript,
  LevelBaseScript,
  LevelEnemyScript,
  LevelExplosionScript,
  LevelInfoScript,
  LevelIntroScript,
  LevelPauseScript,
  LevelPlayerScript,
  LevelPointsScript,
  LevelPowerupScript,
  LevelSpawnScript,
} from '../../level/scripts';

import { GameSceneType } from '../GameSceneType';

import { LevelLocationParams } from './params';

enum State {
  Idle,
  Starting,
  Playing,
  Ending,
}

export class LevelPlayScene extends Scene<LevelLocationParams> {
  private state = State.Idle;
  private session: Session;
  private endTimer = new Timer();

  private eventBus: LevelEventBus;
  private world: LevelWorld;

  private audioScript: LevelAudioScript;
  private baseScript: LevelBaseScript;
  private enemyScript: LevelEnemyScript;
  private explosionScript: LevelExplosionScript;
  private infoScript: LevelInfoScript;
  private introScript: LevelIntroScript;
  private playerScript: LevelPlayerScript;
  private pointsScript: LevelPointsScript;
  private powerupSpawnScript: LevelPowerupScript;
  private pauseScript: LevelPauseScript;
  private spawnScript: LevelSpawnScript;

  protected setup({ session }: GameUpdateArgs): void {
    this.world = new LevelWorld(this.root);

    this.root.add(new Border());

    this.world.field.position.set(
      config.BORDER_LEFT_WIDTH,
      config.BORDER_TOP_BOTTOM_HEIGHT,
    );
    this.root.add(this.world.field);

    this.eventBus = new LevelEventBus();

    this.eventBus.enemyDied.addListener(this.handleEnemyDied);
    this.eventBus.playerDied.addListener(this.handlePlayerDied);
    this.eventBus.powerupPicked.addListener(this.handlePowerupPicked);

    this.session = session;

    this.endTimer.done.addListener(this.handleEndTimer);

    const { mapConfig } = this.params;

    mapConfig.getTerrainRegions().forEach((region) => {
      const regionRect = new Rect(
        region.x,
        region.y,
        region.width,
        region.height,
      );
      const tiles = TerrainFactory.createFromRegion(region.type, regionRect);

      tiles.forEach((tile) => {
        tile.destroyed.addListener(() => {
          this.eventBus.mapTileDestroyed.notify({
            type: tile.type,
            position: tile.position.clone(),
            size: tile.size.clone(),
          });
        });
      });

      this.world.field.add(...tiles);
    });

    this.state = State.Starting;

    this.enemyScript = new LevelEnemyScript(
      this.world,
      this.eventBus,
      mapConfig,
    );
    this.playerScript = new LevelPlayerScript(
      this.world,
      this.eventBus,
      mapConfig,
    );
    this.pointsScript = new LevelPointsScript(this.world, this.eventBus);
    this.powerupSpawnScript = new LevelPowerupScript(
      this.world,
      this.eventBus,
      mapConfig,
    );
    this.pauseScript = new LevelPauseScript(this.world, this.eventBus);
    this.spawnScript = new LevelSpawnScript(this.world, this.eventBus);
    this.explosionScript = new LevelExplosionScript(this.world, this.eventBus);
    this.infoScript = new LevelInfoScript(
      this.world,
      this.eventBus,
      this.session,
    );
    this.baseScript = new LevelBaseScript(this.world, this.eventBus);
    this.introScript = new LevelIntroScript(
      this.world,
      this.eventBus,
      this.session,
    );
    this.introScript.completed.addListener(() => {
      this.state = State.Playing;
    });
    this.audioScript = new LevelAudioScript(this.eventBus, this.session);
  }

  protected update(updateArgs: GameUpdateArgs): void {
    if (this.state === State.Starting) {
      this.introScript.invokeUpdate(updateArgs);
      this.root.traverseDescedants((child) => {
        child.invokeUpdate(updateArgs);
      });
      return;
    }

    const { gameState } = updateArgs;

    this.audioScript.invokeUpdate(updateArgs);
    this.pauseScript.invokeUpdate(updateArgs);

    // TODO: enemies with drops are still animated
    if (!gameState.is(GameState.Paused)) {
      this.baseScript.invokeUpdate(updateArgs);
      this.powerupSpawnScript.invokeUpdate(updateArgs);
      this.playerScript.invokeUpdate(updateArgs);
      this.enemyScript.invokeUpdate(updateArgs);
      this.infoScript.invokeUpdate(updateArgs);

      this.endTimer.update(updateArgs.deltaTime);
    }

    // Update all objects on the scene
    this.root.traverseDescedants((node) => {
      const shouldUpdate = gameState.is(GameState.Playing) || node.ignorePause;
      if (shouldUpdate) {
        node.invokeUpdate(updateArgs);
      }
    });

    this.root.updateWorldMatrix(false, true);

    const nodes = this.root.flatten();

    const activeNodes = [];
    const bothNodes = [];

    nodes.forEach((node) => {
      if (node.collider === null) {
        return;
      }

      if (node.collider.active) {
        activeNodes.push(node);
        bothNodes.push(node);
      } else {
        bothNodes.push(node);
      }
    });

    // Detect and handle collisions of all objects on the scene
    const collisions = CollisionDetector.intersectObjects(
      activeNodes,
      bothNodes,
    );

    collisions.forEach((collision) => {
      collision.self.invokeCollide(collision);
    });
  }

  private handlePlayerDied = (): void => {
    this.session.removeLife();
    if (this.session.isGameOver()) {
      this.playerScript.disable();
      this.end();
    }
  };

  private handleEnemyDied = (event: LevelEnemyDiedEvent): void => {
    this.session.addKillPoints(event.type.tier);

    // if (this.enemySpawner.areAllDead()) {
    //   this.end();
    // }
  };

  private handlePowerupPicked = (event: LevelPowerupPickedEvent): void => {
    this.session.addPowerupPoints(event.type);

    if (event.type === PowerupType.Life) {
      this.session.addLife();
    }
  };

  private end(): void {
    this.state = State.Ending;
    this.endTimer.reset(config.LEVEL_END_DELAY);
  }

  private handleBaseDied = (): void => {
    this.session.setGameOver();
    this.end();
  };

  private handleEndTimer = (): void => {
    this.navigator.replace(GameSceneType.LevelScore);
  };
}
