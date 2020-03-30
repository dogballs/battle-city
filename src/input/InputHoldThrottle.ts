import { Input, Timer } from '../core';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type InputHoldThrottleCb = () => any;

export interface InputHoldThrottleOptions {
  activationDelay?: number;
  delay?: number;
}

const DEFAULT_OPTIONS = {
  activationDelay: 0,
  delay: 0,
};

export class InputHoldThrottle {
  private controls: number[];
  private callback: InputHoldThrottleCb;
  private options: InputHoldThrottleOptions;
  private timer: Timer;

  constructor(
    controls: number[],
    callback: InputHoldThrottleCb,
    options: InputHoldThrottleOptions,
  ) {
    this.controls = controls;
    this.callback = callback;
    this.options = Object.assign({}, DEFAULT_OPTIONS, options);
    this.timer = new Timer(options.activationDelay);
  }

  public update(input: Input, deltaTime: number): void {
    if (input.isDownAny(this.controls) || input.isUpAny(this.controls)) {
      this.timer.reset(this.options.activationDelay);
    }

    if (input.isHoldAny(this.controls)) {
      if (this.timer.isDone()) {
        this.callback();
        this.timer.reset(this.options.delay);
      } else {
        this.timer.update(deltaTime);
      }
    }
  }
}
