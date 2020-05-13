import { Vector } from '../../core';
import { TankType } from '../../tank';

export interface LevelEnemySpawnRequestedEvent {
  type: TankType;
  position: Vector;
  partyIndex: number;
  unspawnedCount: number;
}
