import {
  Input,
  State,
  AudioLoader,
  RectFontLoader,
  SpriteFontLoader,
  SpriteLoader,
  TextureLoader,
} from '../core';
import { MapLoader } from '../map';

import { GameState } from './GameState';
import { Session } from './Session';

export interface GameObjectUpdateArgs {
  audioLoader: AudioLoader;
  deltaTime: number;
  input: Input;
  gameState: State<GameState>;
  mapLoader: MapLoader;
  rectFontLoader: RectFontLoader;
  session: Session;
  spriteFontLoader: SpriteFontLoader;
  spriteLoader: SpriteLoader;
  textureLoader: TextureLoader;
}
