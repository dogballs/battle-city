import * as config from '../../config';

import { SpriteText, SpriteTextOptions } from './SpriteText';

export class LevelTitle extends SpriteText {
  constructor(
    levelNumber = 0,
    isPlaytest = false,
    options: SpriteTextOptions = {},
  ) {
    const text = isPlaytest ? 'PLAYTEST' : LevelTitle.getLevelText(levelNumber);
    super(text, options);

    this.zIndex = config.LEVEL_TITLE_Z_INDEX;
  }

  public setLevelNumber(levelNumber: number): void {
    const text = LevelTitle.getLevelText(levelNumber);
    this.setText(text);
  }

  private static getLevelText(levelNumber: number): string {
    const numberText = levelNumber.toString().padStart(2, ' ');
    const text = `STAGE ${numberText}`;

    return text;
  }
}
