import { Rect } from '../Rect';
import { Sprite } from '../Sprite';

import { TextureLoader } from './TextureLoader';

interface SpriteManifestItem {
  file: string;
  rect: number[];
}

interface SpriteManifest {
  [id: string]: SpriteManifestItem;
}

export class SpriteLoader {
  private readonly textureLoader: TextureLoader;
  private readonly manifest: SpriteManifest;

  constructor(textureLoader: TextureLoader, manifest: SpriteManifest) {
    this.textureLoader = textureLoader;
    this.manifest = manifest;
  }

  public load(id: string, targetRect = new Rect()): Sprite {
    const item = this.manifest[id];
    if (item === undefined) {
      throw new Error(`Invalid sprite id = "${id}"`);
    }

    const { file: fileName, rect: sourceRectValues } = item;
    const texture = this.textureLoader.load(fileName);
    const sourceRect = new Rect(...sourceRectValues);
    const sprite = new Sprite(texture, sourceRect, targetRect);

    return sprite;
  }

  public async loadAsync(id: string, targetRect = new Rect()): Promise<Sprite> {
    return new Promise((resolve) => {
      const sprite = this.load(id, targetRect);
      if (sprite.texture.isLoaded()) {
        resolve(sprite);
      } else {
        sprite.texture.loaded.addListenerOnce(() => {
          resolve(sprite);
        });
      }
    });
  }

  public loadList(ids: string[]): Sprite[] {
    const sprites = ids.map((id) => {
      const sprite = this.load(id);

      return sprite;
    });

    return sprites;
  }

  public preloadAll(): void {
    Object.keys(this.manifest).forEach((id) => {
      this.load(id);
    });
  }

  public async preloadAllAsync(): Promise<void> {
    await Promise.all(
      Object.keys(this.manifest).map((id) => {
        return this.loadAsync(id);
      }),
    );
  }
}
