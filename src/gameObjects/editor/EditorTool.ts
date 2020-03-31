import {
  Collider,
  Collision,
  GameObject,
  RectPainter,
  Subject,
  Timer,
  Vector,
} from '../../core';
import { GameObjectUpdateArgs, Tag } from '../../game';
import {
  EditorMapInputContext,
  InputHoldThrottle,
  InputHoldThrottleOptions,
} from '../../input';
import * as config from '../../config';

import { EditorBrush } from './EditorBrush';

const BLINK_DELAY = 0.2;

const HOLD_THROTTLE_OPTIONS: InputHoldThrottleOptions = {
  activationDelay: 0.12,
  delay: 0.024,
};

export class EditorTool extends GameObject {
  public collider = new Collider(true);
  public painter = new RectPainter(null, config.COLOR_RED);
  public draw = new Subject();
  public erase = new Subject();
  private brushes: EditorBrush[] = [];
  private selectedBrush: EditorBrush = null;
  private velocity = new Vector(0, 0);
  private holdThrottles: InputHoldThrottle[] = [];
  private blinkTimer = new Timer();
  private isBlinkVisible = true;

  constructor() {
    super();

    this.holdThrottles = [
      new InputHoldThrottle(
        EditorMapInputContext.MoveUp,
        this.moveUp,
        HOLD_THROTTLE_OPTIONS,
      ),
      new InputHoldThrottle(
        EditorMapInputContext.MoveDown,
        this.moveDown,
        HOLD_THROTTLE_OPTIONS,
      ),
      new InputHoldThrottle(
        EditorMapInputContext.MoveLeft,
        this.moveLeft,
        HOLD_THROTTLE_OPTIONS,
      ),
      new InputHoldThrottle(
        EditorMapInputContext.MoveRight,
        this.moveRight,
        HOLD_THROTTLE_OPTIONS,
      ),
    ];
  }

  public setBrushes(brushes: EditorBrush[]): void {
    this.brushes = brushes;
    this.selectBrush(0);
  }

  public getSelectedBrush(): EditorBrush {
    return this.selectedBrush;
  }

  protected update(updateArgs: GameObjectUpdateArgs): void {
    this.updatePosition(updateArgs);
    this.updateBlinking(updateArgs);

    const { input } = updateArgs;

    if (input.isDownAny(EditorMapInputContext.Draw)) {
      this.draw.notify();
    }
    if (input.isDownAny(EditorMapInputContext.Erase)) {
      this.erase.notify();
    }
    if (input.isDownAny(EditorMapInputContext.NextBrush)) {
      this.selectNextBrush();
    }
    if (input.isDownAny(EditorMapInputContext.PrevBrush)) {
      this.selectPrevBrush();
    }
  }

  protected collide(collision: Collision): void {
    const { other } = collision;

    if (other.tags.includes(Tag.EditorBlockMove)) {
      this.position.sub(this.velocity);
    }
  }

  private updatePosition({ deltaTime, input }: GameObjectUpdateArgs): void {
    this.velocity.set(0, 0);

    if (input.isDownAny(EditorMapInputContext.MoveUp)) {
      this.moveUp();
    } else if (input.isDownAny(EditorMapInputContext.MoveDown)) {
      this.moveDown();
    } else if (input.isDownAny(EditorMapInputContext.MoveLeft)) {
      this.moveLeft();
    } else if (input.isDownAny(EditorMapInputContext.MoveRight)) {
      this.moveRight();
    }

    for (const holdThrottle of this.holdThrottles) {
      holdThrottle.update(input, deltaTime);
    }

    this.position.add(this.velocity);
  }

  private moveUp = (): void => {
    this.velocity.set(0, -this.size.height);
  };

  private moveDown = (): void => {
    this.velocity.set(0, this.size.height);
  };

  private moveLeft = (): void => {
    this.velocity.set(-this.size.width, 0);
  };

  private moveRight = (): void => {
    this.velocity.set(this.size.width, 0);
  };

  private updateBlinking({ deltaTime }: GameObjectUpdateArgs): void {
    if (this.blinkTimer.isDone()) {
      this.isBlinkVisible = !this.isBlinkVisible;
      this.blinkTimer.reset(BLINK_DELAY);
    } else {
      this.blinkTimer.update(deltaTime);
    }

    if (this.selectBrush !== null) {
      this.selectedBrush.visible = this.isBlinkVisible;
    }
  }

  private selectNextBrush(): void {
    const selectedBrushIndex = this.brushes.indexOf(this.selectedBrush);

    let nextBrushIndex = selectedBrushIndex + 1;
    if (nextBrushIndex > this.brushes.length - 1) {
      nextBrushIndex = 0;
    }

    this.selectBrush(nextBrushIndex);
  }

  private selectPrevBrush(): void {
    const selectedBrushIndex = this.brushes.indexOf(this.selectedBrush);

    let prevBrushIndex = selectedBrushIndex - 1;
    if (prevBrushIndex < 0) {
      prevBrushIndex = this.brushes.length - 1;
    }

    this.selectBrush(prevBrushIndex);
  }

  private selectBrush(index: number): void {
    // Clear previous brush
    if (this.selectedBrush !== null) {
      // Restore visibility
      this.selectedBrush.visible = true;
      this.remove(this.selectedBrush);
    }

    if (this.brushes[index] === undefined) {
      this.selectBrush = null;
      return;
    }

    this.selectedBrush = this.brushes[index];
    this.selectedBrush.visible = this.isBlinkVisible;

    this.size.copyFrom(this.selectedBrush.size);

    this.position.x -= this.position.x % this.size.width;
    this.position.y -= this.position.y % this.size.height;

    this.add(this.selectedBrush);
  }
}
