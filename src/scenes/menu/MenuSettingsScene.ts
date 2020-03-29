import { Scene } from '../../core';
import { GameObjectUpdateArgs } from '../../game';
import { Menu, SpriteText, TextMenuItem } from '../../gameObjects';
import * as config from '../../config';

import { GameSceneType } from '../GameSceneType';

const MENU_ITEMS = ['KEY BINDINGS', 'BACK'];

export class MenuSettingsScene extends Scene {
  private title = new SpriteText('SETTINGS', { color: config.COLOR_YELLOW });
  private menu = new Menu();

  protected setup(): void {
    this.title.position.set(112, 96);
    this.root.add(this.title);

    const menuItems = MENU_ITEMS.map((text) => {
      return new TextMenuItem(text, { color: config.COLOR_WHITE });
    });

    this.menu.setItems(menuItems);
    this.menu.position.set(16, 192);
    this.menu.selected.addListener(this.handleMenuSelected);
    this.root.add(this.menu);
  }

  protected update(updateArgs: GameObjectUpdateArgs): void {
    this.root.traverseDescedants((child) => {
      child.invokeUpdate(updateArgs);
    });
  }

  private handleMenuSelected = (selectedIndex): void => {
    switch (selectedIndex) {
      case 0:
        this.navigator.push(GameSceneType.MenuKeybinding);
        break;
      case 1:
        this.navigator.back();
        break;
    }
  };
}
