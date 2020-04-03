import { GameObject, SceneRouter } from '../core';
import * as config from '../config';

import { EditorEnemyScene, EditorMapScene, EditorMenuScene } from './editor';
import {
  LevelGameOverScene,
  LevelSelectionScene,
  LevelPlayScene,
  LevelScoreScene,
} from './level';
import { MenuMainScene, MenuSettingsScene, MenuKeybindingScene } from './menu';
import { SandboxTransformScene } from './sandbox';

import { GameSceneType } from './GameSceneType';

// Composition root for game scenes
export class GameSceneRouter extends SceneRouter {
  public constructor() {
    super();

    this.register(GameSceneType.EditorEnemy, EditorEnemyScene);
    this.register(GameSceneType.EditorMap, EditorMapScene);
    this.register(GameSceneType.EditorMenu, EditorMenuScene);
    this.register(GameSceneType.LevelGameOver, LevelGameOverScene);
    this.register(GameSceneType.LevelSelection, LevelSelectionScene);
    this.register(GameSceneType.LevelScore, LevelScoreScene);
    this.register(GameSceneType.LevelPlay, LevelPlayScene);
    this.register(GameSceneType.MenuMain, MenuMainScene);
    this.register(GameSceneType.MenuSettings, MenuSettingsScene);
    this.register(GameSceneType.MenuKeybinding, MenuKeybindingScene);
    this.register(GameSceneType.SandboxTransform, SandboxTransformScene);
  }

  protected createRoot(): GameObject {
    const root = new GameObject();
    root.size.set(config.CANVAS_WIDTH, config.CANVAS_HEIGHT);
    return root;
  }
}
