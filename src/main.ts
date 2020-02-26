import {
  GameLoop,
  GameObject,
  GameObjectUpdateArgs,
  GameRenderer,
  GameState,
  KeyboardInput,
  Logger,
  State,
  Vector,
  AudioLoader,
  RectFontLoader,
  SpriteFontLoader,
  SpriteLoader,
  TextureLoader,
} from './core';

import * as config from './config';

import { DebugInspector } from './debug';
import {
  LevelScene,
  // GameOverScene,
  // MenuScene,
  // StageSelectionScene,
} from './scenes';

import * as audioManifest from '../data/audio/audio.manifest.json';
import * as spriteManifest from '../data/graphics/sprite.manifest.json';
import * as spriteFontConfig from '../data/fonts/sprite-font.json';
import * as rectFontConfig from '../data/fonts/rect-font.json';

const log = new Logger('main', Logger.Level.Debug);

const gameRenderer = new GameRenderer({
  // debug: true,
  height: config.CANVAS_HEIGHT,
  width: config.CANVAS_WIDTH,
});
document.body.appendChild(gameRenderer.domElement);

const input = new KeyboardInput();
input.listen();

const audioLoader = new AudioLoader(audioManifest, config.AUDIO_BASE_PATH);
const textureLoader = new TextureLoader(config.GRAPHICS_BASE_PATH);

const spriteFontLoader = new SpriteFontLoader(textureLoader);
spriteFontLoader.register('primary', spriteFontConfig);

const spriteLoader = new SpriteLoader(textureLoader, spriteManifest);

const rectFontLoader = new RectFontLoader();
rectFontLoader.register('primary', rectFontConfig);

// const debug = new DebugController(spawner);

const currentScene = new LevelScene();
// const currentScene = new MenuScene(config.CANVAS_WIDTH, config.CANVAS_HEIGHT);
// const currentScene = new StageSelectionScene(
//   config.CANVAS_WIDTH,
//   config.CANVAS_HEIGHT,
// );
// const currentScene = new GameOverScene(
//   config.CANVAS_WIDTH,
//   config.CANVAS_HEIGHT,
// );

const debugInspector = new DebugInspector(gameRenderer.domElement);
debugInspector.listen();
debugInspector.click.addListener((position: Vector) => {
  const intersections: GameObject[] = [];
  currentScene.traverseDescedants((child) => {
    if (child.getWorldBoundingBox().contains(position)) {
      intersections.push(child);
    }
  });
  console.log(intersections);
});

const gameState = new State<GameState>(GameState.Playing);

const updateArgs: GameObjectUpdateArgs = {
  gameState,
  input,
  audioLoader,
  rectFontLoader,
  spriteFontLoader,
  spriteLoader,
  textureLoader,
};

const gameLoop = new GameLoop();
gameLoop.tick.addListener(() => {
  input.update();

  currentScene.invokeUpdate(updateArgs);

  gameRenderer.render(currentScene);

  gameState.tick();
});

async function main(): Promise<void> {
  log.time('Audio preload');
  await audioLoader.preloadAllAsync();
  log.timeEnd('Audio preload');

  log.time('Rect font preload');
  await rectFontLoader.preloadAll();
  log.timeEnd('Rect font preload');

  log.time('Sprite font preload');
  await spriteFontLoader.preloadAllAsync();
  log.timeEnd('Sprite font preload');

  log.time('Sprites preload');
  await spriteLoader.preloadAllAsync();
  log.timeEnd('Sprites preload');

  gameLoop.start();
  // gameLoop.next();
}

main();

// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
window.gameLoop = gameLoop;

// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
// window.debug = debug;
