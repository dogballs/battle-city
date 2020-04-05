import { GameObject, Scene } from '../../core';
import { GameUpdateArgs, Session } from '../../game';
import { MainHeading, Menu, TextMenuItem } from '../../gameObjects';
import { MenuInputContext } from '../../input';
import * as config from '../../config';

import { GameSceneType } from '../GameSceneType';

const SLIDE_SPEED = 240;

const MENU_ITEMS = ['1 PLAYER', 'CONSTRUCTION', 'SETTINGS'];

enum State {
  Sliding,
  Ready,
}

export class MainMenuScene extends Scene {
  private heading = new MainHeading();
  private group = new GameObject();
  private menu = new Menu();
  private state: State = State.Ready;
  private session: Session;

  protected setup({ session }: GameUpdateArgs): void {
    this.session = session;

    this.group.size.copyFrom(this.root.size);

    this.heading.origin.setX(0.5);
    this.heading.setCenter(this.root.getSelfCenter());
    this.heading.position.setY(160);
    this.group.add(this.heading);

    const menuItems = MENU_ITEMS.map((text) => {
      return new TextMenuItem(text, { color: config.COLOR_WHITE });
    });

    this.menu.setItems(menuItems);
    this.menu.setCenter(this.root.getSelfCenter());
    this.menu.position.setY(512);
    this.menu.selected.addListener(this.handleMenuSelected);
    this.group.add(this.menu);

    if (!this.session.haveSeenIntro()) {
      this.state = State.Sliding;
      this.group.position.setY(this.root.size.height);
      this.menu.hideCursor();
    }

    this.root.add(this.group);
  }

  protected update(updateArgs: GameUpdateArgs): void {
    const { deltaTime, input } = updateArgs;

    if (this.state === State.Sliding) {
      this.group.position.y -= SLIDE_SPEED * deltaTime;

      const hasReachedTop = this.group.position.y <= 0;
      const isSkipped = input.isDownAny(MenuInputContext.Skip);
      const isReady = hasReachedTop || isSkipped;

      if (isReady) {
        this.group.position.y = 0;
        this.state = State.Ready;
        this.menu.showCursor();
        this.session.setSeenIntro(true);
      } else {
        this.root.traverseDescedants((child) => {
          child.invokeUpdate(updateArgs);
        });
      }
      return;
    }

    this.root.traverseDescedants((child) => {
      child.invokeUpdate(updateArgs);
    });
  }

  private handleMenuSelected = (selectedIndex): void => {
    switch (selectedIndex) {
      case 0:
        this.navigator.replace(GameSceneType.LevelSelection);
        break;
      case 1:
        this.navigator.push(GameSceneType.EditorMenu);
        break;
      case 2:
        this.navigator.push(GameSceneType.SettingsMenu);
        break;
    }
  };
}
