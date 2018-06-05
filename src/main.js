import Bullet from './models/Bullet.js';
import BulletExplosion from './models/BulletExplosion.js';
import BulletFactory from './managers/BulletFactory.js';
import CollisionDetector from './core/CollisionDetector.js';
import EnemyTank from './models/enemy-tank/EnemyTank.js';
import InputHandler from './handlers/InputHandler.js';
import MapBuilder from './managers/MapBuilder.js';
import MotionManager from './managers/MotionManager.js';
import Renderer from './core/Renderer.js';
import Scene from './core/Scene.js';
import Spawn from './models/Spawn.js';
import Tank from './models/tank/Tank.js';

import collisionsConfig from './collisions/collisions.config.js';
import map from './maps/1/description.js';

const renderer = new Renderer();
renderer.setSize(800, 800);
const renderElement = document.getElementById('canvas');
renderElement.appendChild(renderer.domElement);

const scene = new Scene();
// TODO: @aailyin fix please. If instance is not used, means that the class
// just introduces side effects, which is not straigforward.
// eslint-disable-next-line no-unused-vars
const manager = new MotionManager(renderer, scene);
const mapBuilder = new MapBuilder(scene);

mapBuilder.buildMap(map);

const tank = new Tank();
tank.position.x = 50;
tank.position.y = 50;
scene.add(tank);

const enemy = new EnemyTank();
enemy.position.x = 600;
enemy.position.y = 250;
enemy.rotate('down');
scene.add(enemy);

const inputHandler = new InputHandler();

inputHandler.addListener('up', () => {
  tank.rotate('up');
  tank.move();
});

inputHandler.addListener('down', () => {
  tank.rotate('down');
  tank.move();
});

inputHandler.addListener('right', () => {
  tank.rotate('right');
  tank.move();
});

inputHandler.addListener('left', () => {
  tank.rotate('left');
  tank.move();
});

inputHandler.addListener('fire', () => {
  const bullet = BulletFactory.makeBullet(tank);
  scene.add(bullet);
});

const animate = () => {
  const sceneWidth = renderer.domElement.width;
  const sceneHeight = renderer.domElement.height;

  // Animate bullets
  const bullets = scene.children.filter(child => child instanceof Bullet);
  bullets.forEach((bullet) => {
    // TODO: simplify checking the bounds
    if (bullet.position.x < 0
      || bullet.position.x > sceneWidth
      || bullet.position.y < 0
      || bullet.position.y > sceneHeight
    ) {
      scene.remove(bullet);
      return;
    }

    bullet.move();
  });

  // Animate enemy tank to continuously go up and down
  enemy.move();
  if (enemy.position.y + enemy.height > sceneHeight) {
    enemy.rotate('up');
  } else if (enemy.position.y < 0) {
    enemy.rotate('down');
  }

  // Animate explosions
  const bulletExplosions = scene.children.filter(child => child instanceof BulletExplosion);
  bulletExplosions.forEach(bulletExplosion => bulletExplosion.update());

  // Animate spawns
  const spawns = scene.children.filter(child => child instanceof Spawn);
  spawns.forEach(spawn => spawn.update());

  // Detect and handle collisions of all objects on the map
  const collisions = CollisionDetector.intersectObjects(scene.children);
  collisions.forEach((collision) => {
    const collisionConfig = collisionsConfig.find((config) => {
      const sourceMatches = collision.source instanceof config.sourceType;
      const targetMatches = collision.target instanceof config.targetType;

      return sourceMatches && targetMatches;
    });

    if (collisionConfig === undefined) {
      return;
    }

    const collisionHandler = new collisionConfig.Instance(collision, scene);
    collisionHandler.collide();
  });

  window.requestAnimationFrame(animate);
  renderer.render(scene);
};
animate();

// Crate sample spawns
setInterval(() => {
  const spawn = new Spawn();
  spawn.position.x = 300;
  spawn.position.y = 50;
  spawn.onComplete = () => {
    scene.remove(spawn);
  };
  scene.add(spawn);
}, 1500);
