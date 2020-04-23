import {
  GamepadInputDevice,
  Input,
  InputBinding,
  InputDevice,
  KeyboardInputDevice,
} from '../core';
import { GameStorage } from '../game';

import { GamepadInputBinding, KeyboardInputBinding } from './bindings';
import {
  GamepadButtonCodePresenter,
  KeyboardButtonCodePresenter,
} from './presenters';
import { InputButtonCodePresenter } from './InputButtonCodePresenter';
import { InputControl } from './InputControl';
import { InputDeviceType } from './InputDeviceType';

interface InputVariant {
  binding: InputBinding;
  device: InputDevice;
  presenter: InputButtonCodePresenter;
}

export class InputManager {
  private input: Input;
  private variants = new Map<InputDeviceType, InputVariant>();
  private currentVariant: InputVariant = null;
  private storage: GameStorage;

  constructor(storage: GameStorage) {
    this.storage = storage;

    this.input = new Input();

    // Order by priority, first is default
    this.variants.set(InputDeviceType.Keyboard, {
      binding: new KeyboardInputBinding(),
      device: new KeyboardInputDevice(),
      presenter: new KeyboardButtonCodePresenter(),
    });
    this.variants.set(InputDeviceType.Gamepad, {
      binding: new GamepadInputBinding(),
      device: new GamepadInputDevice(),
      presenter: new GamepadButtonCodePresenter(),
    });

    if (this.variants.size > 0) {
      this.activateVariant(this.variants.values().next().value);
    }
  }

  public getBinding(type: InputDeviceType): InputBinding {
    if (!this.variants.has(type)) {
      return null;
    }

    const { binding } = this.variants.get(type);

    return binding;
  }

  public getDevice(type: InputDeviceType): InputDevice {
    if (!this.variants.has(type)) {
      return null;
    }

    const { device } = this.variants.get(type);

    return device;
  }

  public getPresenter(type: InputDeviceType): InputButtonCodePresenter {
    if (!this.variants.has(type)) {
      return null;
    }

    const { presenter } = this.variants.get(type);

    return presenter;
  }

  public getCurrentBinding(): InputBinding {
    const { binding } = this.currentVariant;
    return binding;
  }

  public getCurrentPresenter(): InputButtonCodePresenter {
    const { presenter } = this.currentVariant;
    return presenter;
  }

  public getInput(): Input {
    return this.input;
  }

  public listen(): void {
    this.variants.forEach((variant) => {
      const { device } = variant;

      device.listen();
    });
  }

  public unlisten(): void {
    this.variants.forEach((variant) => {
      const { device } = variant;

      device.unlisten();
    });
  }

  public update(): void {
    this.variants.forEach((variant) => {
      const { device } = variant;

      // Check each device if it has any events. If it does and it is not a
      // current variant - activate a new one.
      device.update();

      const downCodes = device.getDownCodes();
      const hasActivity = downCodes.length > 0;
      const isCurrentVariant = variant === this.currentVariant;

      if (hasActivity && !isCurrentVariant) {
        this.activateVariant(variant);
        return;
      }
    });
  }

  public loadAllBindings(): void {
    this.variants.forEach((variant, type) => {
      const { binding } = variant;

      const json = this.storage.getBindingJSON(type);

      binding.fromJSON(json);
    });
  }

  public saveBinding(type: InputDeviceType): void {
    const binding = this.getBinding(type);

    const json = binding.toJSON();

    this.storage.saveBindingJSON(type, json);
  }

  public getPresentedControlCode(control: InputControl): string {
    const binding = this.getCurrentBinding();
    const presenter = this.getCurrentPresenter();

    const code = binding.get(control);
    const displayedCode = presenter.asString(code);

    return displayedCode;
  }

  private activateVariant(variant: InputVariant): void {
    this.currentVariant = variant;

    this.input.setDevice(variant.device);
    this.input.setBinding(variant.binding);
  }
}
