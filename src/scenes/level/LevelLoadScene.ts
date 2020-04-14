import { Logger, Scene } from '../../core';
import { GameUpdateArgs, Session } from '../../game';
import { AlertModal, Curtain, LevelTitle } from '../../gameObjects';
import { MapConfig, MapLoader } from '../../map';

import { GameSceneType } from '../GameSceneType';

enum State {
  Navigation,
  Alert,
}

export class LevelLoadScene extends Scene {
  private curtain: Curtain;
  private title: LevelTitle;
  private alertModal: AlertModal;
  private mapLoader: MapLoader;
  private session: Session;
  private state = State.Navigation;
  private log = new Logger(LevelLoadScene.name, Logger.Level.Warn);

  protected setup({ mapLoader, session }: GameUpdateArgs): void {
    this.session = session;

    const levelNumber = this.session.getLevelNumber();

    this.curtain = new Curtain(
      this.root.size.width,
      this.root.size.height,
      false,
    );
    this.root.add(this.curtain);

    this.title = new LevelTitle(levelNumber);
    this.title.setCenter(this.root.getSelfCenter());
    this.title.origin.set(0.5, 0.5);
    this.root.add(this.title);

    this.alertModal = new AlertModal({
      containerWidth: 768,
      message: 'FAILED TO LOAD THE MAP\nTRYING NEXT MAP',
    });
    this.alertModal.size.copyFrom(this.root.size);
    this.alertModal.visible = false;
    this.alertModal.accepted.addListener(this.handleAlertAccepted);
    this.root.add(this.alertModal);

    this.mapLoader = mapLoader;
    this.mapLoader.loaded.addListenerOnce(this.handleMapLoaded);
    this.mapLoader.error.addListenerOnce(this.handleMapLoadError);
    this.mapLoader.loadAsync(levelNumber);
  }

  protected update(updateArgs: GameUpdateArgs): void {
    if (this.state === State.Alert) {
      this.alertModal.traverse((node) => {
        node.invokeUpdate(updateArgs);
      });
      return;
    }

    this.root.traverseDescedants((child) => {
      if (child === this.alertModal || child.hasParent(this.alertModal)) {
        return;
      }

      child.invokeUpdate(updateArgs);
    });
  }

  private handleMapLoaded = (mapConfig: MapConfig): void => {
    this.mapLoader.error.removeListener(this.handleMapLoadError);

    this.navigator.replace(GameSceneType.LevelPlay, {
      mapConfig,
    });
  };

  private handleMapLoadError = (err): void => {
    this.log.error('Failed to load the map', err);
    this.mapLoader.loaded.removeListener(this.handleMapLoaded);

    if (this.session.isLastLevel()) {
      this.alertModal.setText('FAILED TO LOAD THE MAP\nNO MAPS LEFT');
    }

    this.showAlert();
  };

  private showAlert(): void {
    this.alertModal.visible = true;
    this.state = State.Alert;
  }

  private hideAlert(): void {
    this.alertModal.visible = false;
    this.state = State.Navigation;
  }

  private handleAlertAccepted = (): void => {
    // If level failed to load it might be last level, but it also might
    // be the only level. Check if user has any points to identify if user
    // has played at all.
    if (this.session.isLastLevel()) {
      const hasPlayed = this.session.getMaxPoints() > 0;
      // If user has played and all levels ended, then he has won the game.
      // Otherwise return him to main menu.
      if (hasPlayed) {
        this.navigator.replace(GameSceneType.MainVictory);
      } else {
        this.navigator.replace(GameSceneType.MainMenu);
      }
      return;
    }

    this.session.activateNextLevel();
    this.navigator.replace(GameSceneType.LevelLoad);
  };
}
