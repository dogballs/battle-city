import { RectPainter, Scene, Timer } from '../../core';
import { GameObjectUpdateArgs, Session } from '../../game';
import { LevelTitle, ScoreTable } from '../../gameObjects';
import * as config from '../../config';

import { GameSceneType } from '../GameSceneType';

const POST_DELAY = 3;

enum State {
  Idle,
  Counting,
  Post,
}

export class LevelScoreScene extends Scene {
  private session: Session;
  private levelTitle: LevelTitle;
  private scoreTable: ScoreTable;
  private postTimer = new Timer();
  private state = State.Idle;

  protected setup({ session }: GameObjectUpdateArgs): void {
    this.session = session;

    this.root.painter = new RectPainter(config.COLOR_BLACK);

    this.levelTitle = new LevelTitle(this.session.getLevelNumber(), {
      color: config.COLOR_WHITE,
    });
    this.levelTitle.origin.set(0.5, 0);
    this.levelTitle.setCenter(this.root.getSelfCenter());
    this.levelTitle.position.setY(128);
    this.root.add(this.levelTitle);

    this.scoreTable = new ScoreTable(this.session.getLevelPointsRecord());
    this.scoreTable.setCenter(this.root.getSelfCenter());
    this.scoreTable.done.addListener(this.handleDone);
    this.root.add(this.scoreTable);

    this.postTimer.done.addListener(this.handlePost);

    this.state = State.Counting;
    this.scoreTable.start();
  }

  protected update(updateArgs: GameObjectUpdateArgs): void {
    if (this.state === State.Post) {
      this.postTimer.update(updateArgs.deltaTime);
      return;
    }

    this.root.traverseDescedants((child) => {
      child.invokeUpdate(updateArgs);
    });
  }

  private handleDone = (): void => {
    this.state = State.Post;
    this.postTimer.reset(POST_DELAY);
  };

  private handlePost = (): void => {
    if (this.session.isGameOver()) {
      this.navigator.replace(GameSceneType.LevelGameOver);
    } else {
      // TODO: what if completed final level
      this.session.activateNextLevel();
      this.navigator.replace(GameSceneType.LevelPlay);
    }
  };
}
