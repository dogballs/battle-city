import { GameLoop, GameObject, KeyboardInput, Renderer } from './core';

import { Border, EditorBrush, EditorBrushType } from './gameObjects';

import { MapConfig, MapConfigWallType } from './map/MapConfig';
import { MapFactory } from './map/MapFactory';

import * as config from './config';

const renderer = new Renderer({
  debug: true,
  height: config.CANVAS_HEIGHT,
  width: config.CANVAS_WIDTH,
});
document.body.appendChild(renderer.domElement);

const input = new KeyboardInput();
input.listen();

const scene = new GameObject();

scene.add(new Border());

const field = new GameObject(config.FIELD_SIZE, config.FIELD_SIZE);
field.position.set(config.BORDER_LEFT_WIDTH, config.BORDER_TOP_BOTTOM_HEIGHT);
scene.add(field);

const mapConfig = new MapConfig();

const brush = new EditorBrush();
brush.draw.addListener((event) => {
  console.log(event);

  // TODO: check if coordinates are already taken?

  if (event.brushType === EditorBrushType.BrickWall) {
    mapConfig.addWall(MapConfigWallType.Brick, event.box.toRect());
  }
});
field.add(brush);

const gameLoop = new GameLoop({
  onTick: (): void => {
    input.update();

    const { walls } = MapFactory.create(mapConfig);

    const nodes = [...walls, brush];

    nodes.forEach((node) => {
      node.update({ input });
    });

    field.clear();
    field.add(...nodes);

    renderer.render(scene);
  },
});

gameLoop.start();

// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
window.gameLoop = gameLoop;
