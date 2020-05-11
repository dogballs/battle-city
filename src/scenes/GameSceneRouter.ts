import { SceneRouter } from '../core';

import {
  EditorEnemyScene,
  EditorInputScene,
  EditorMapScene,
  EditorMenuScene,
} from './editor';
import {
  LevelInputScene,
  LevelLoadScene,
  LevelSelectionScene,
  LevelPlayScene,
  LevelScoreScene,
} from './level';
import {
  MainAboutScene,
  MainGameOverScene,
  MainHighscoreScene,
  MainMenuScene,
  MainVictoryScene,
} from './main';
import { ModesCustomScene, ModesMenuScene } from './modes';
import {
  SettingsAudioScene,
  SettingsDevicesScene,
  SettingsInterfaceScene,
  SettingsKeybindingScene,
  SettingsMenuScene,
} from './settings';
import { SandboxTransformScene } from './sandbox';

import { GameScene } from './GameScene';
import { GameSceneType } from './GameSceneType';

// Composition root for game scenes
export class GameSceneRouter extends SceneRouter<GameScene> {
  public constructor() {
    super();

    this.register(GameSceneType.EditorEnemy, EditorEnemyScene);
    this.register(GameSceneType.EditorInput, EditorInputScene);
    this.register(GameSceneType.EditorMap, EditorMapScene);
    this.register(GameSceneType.EditorMenu, EditorMenuScene);
    this.register(GameSceneType.MainAbout, MainAboutScene);
    this.register(GameSceneType.MainGameOver, MainGameOverScene);
    this.register(GameSceneType.MainHighscore, MainHighscoreScene);
    this.register(GameSceneType.MainMenu, MainMenuScene);
    this.register(GameSceneType.MainVictory, MainVictoryScene);
    this.register(GameSceneType.ModesMenu, ModesMenuScene);
    this.register(GameSceneType.ModesCustom, ModesCustomScene);
    this.register(GameSceneType.LevelInput, LevelInputScene);
    this.register(GameSceneType.LevelLoad, LevelLoadScene);
    this.register(GameSceneType.LevelSelection, LevelSelectionScene);
    this.register(GameSceneType.LevelScore, LevelScoreScene);
    this.register(GameSceneType.LevelPlay, LevelPlayScene);
    this.register(GameSceneType.SettingsAudio, SettingsAudioScene);
    this.register(GameSceneType.SettingsDevices, SettingsDevicesScene);
    this.register(GameSceneType.SettingsInterface, SettingsInterfaceScene);
    this.register(GameSceneType.SettingsMenu, SettingsMenuScene);
    this.register(GameSceneType.SettingsKeybinding, SettingsKeybindingScene);
    this.register(GameSceneType.SandboxTransform, SandboxTransformScene);
  }
}
