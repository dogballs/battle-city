import {
  GameObject,
  GameObjectUpdateArgs,
  KeyboardKey,
  Subject,
} from '../core';

import { MenuSelector } from './MenuSelector';
import { SpriteTextNode } from './SpriteTextNode';

const MENU_ITEMS = ['1 PLAYER', '2 PLAYERS', 'CONSTRUCTION'];
const MENU_ITEM_HEIGHT = 60;

export class Menu extends GameObject {
  public selected = new Subject<number>();
  private selector = new MenuSelector(MENU_ITEM_HEIGHT);
  private selectedIndex = 0;

  constructor() {
    super(480, MENU_ITEM_HEIGHT * MENU_ITEMS.length);
  }

  public showSelector(): void {
    this.selector.visible = true;
  }

  protected setup(): void {
    MENU_ITEMS.forEach((menuItemText, index) => {
      const menuItem = new SpriteTextNode('primary', menuItemText, {
        scale: 4,
      });
      menuItem.position.set(96, index * MENU_ITEM_HEIGHT + 16);

      this.add(menuItem);
    });

    this.selector.visible = false;
    this.add(this.selector);
  }

  protected update(updateArgs: GameObjectUpdateArgs): void {
    const { input } = updateArgs;

    if (input.isDown(KeyboardKey.S)) {
      this.selectNext();
      this.updateSelector();
    } else if (input.isDown(KeyboardKey.W)) {
      this.selectPrev();
      this.updateSelector();
    }

    if (input.isDown(KeyboardKey.Space)) {
      this.selected.notify(this.selectedIndex);
    }
  }

  private updateSelector(): void {
    this.selector.position.setY(this.selector.size.height * this.selectedIndex);
  }

  private selectPrev(): void {
    let nextIndex = this.selectedIndex - 1;
    if (nextIndex < 0) {
      nextIndex = MENU_ITEMS.length - 1;
    }
    this.selectedIndex = nextIndex;
  }

  private selectNext(): void {
    let nextIndex = this.selectedIndex + 1;
    if (nextIndex > MENU_ITEMS.length - 1) {
      nextIndex = 0;
    }
    this.selectedIndex = nextIndex;
  }
}
