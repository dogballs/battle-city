import test from 'ava';

import { Animation } from './Animation';
import { Sprite } from './Sprite';

test('default', (t) => {
  const frames = [new Sprite(), new Sprite(), new Sprite()];
  const animation = new Animation(frames);

  animation.animate(3);
  t.is(animation.getCurrentFrameIndex(), 0);
  t.is(animation.isComplete(), false);
  t.deepEqual(animation.getCurrentFrame(), frames[0]);

  animation.animate(4);
  t.is(animation.getCurrentFrameIndex(), 1);
  t.is(animation.isComplete(), false);
  t.deepEqual(animation.getCurrentFrame(), frames[1]);

  animation.animate(5);
  t.is(animation.getCurrentFrameIndex(), 2);
  t.is(animation.isComplete(), true);
  t.deepEqual(animation.getCurrentFrame(), frames[2]);

  animation.animate(6);
  t.is(animation.getCurrentFrameIndex(), 2);
  t.is(animation.isComplete(), true);
  t.deepEqual(animation.getCurrentFrame(), frames[2]);
});

test('infinite loop', (t) => {
  const frames = [new Sprite(), new Sprite()];
  const animation = new Animation(frames, { loop: true });

  animation.animate(3);
  t.is(animation.getCurrentFrameIndex(), 0);
  t.is(animation.isComplete(), false);
  t.deepEqual(animation.getCurrentFrame(), frames[0]);

  animation.animate(4);
  t.is(animation.getCurrentFrameIndex(), 1);
  t.is(animation.isComplete(), false);
  t.deepEqual(animation.getCurrentFrame(), frames[1]);

  animation.animate(5);
  t.is(animation.getCurrentFrameIndex(), 0);
  t.is(animation.isComplete(), false);
  t.deepEqual(animation.getCurrentFrame(), frames[0]);

  animation.animate(6);
  t.is(animation.getCurrentFrameIndex(), 1);
  t.is(animation.isComplete(), false);
  t.deepEqual(animation.getCurrentFrame(), frames[1]);

  animation.animate(7);
  t.is(animation.getCurrentFrameIndex(), 0);
  t.is(animation.isComplete(), false);
  t.deepEqual(animation.getCurrentFrame(), frames[0]);
});

test('finite loop', (t) => {
  const frames = [new Sprite(), new Sprite()];
  const animation = new Animation(frames, { loop: 2 });

  animation.animate(3);
  t.is(animation.getCurrentFrameIndex(), 0);
  t.is(animation.isComplete(), false);
  t.deepEqual(animation.getCurrentFrame(), frames[0]);

  animation.animate(4);
  t.is(animation.getCurrentFrameIndex(), 1);
  t.is(animation.isComplete(), false);
  t.deepEqual(animation.getCurrentFrame(), frames[1]);

  animation.animate(5);
  t.is(animation.getCurrentFrameIndex(), 0);
  t.is(animation.isComplete(), false);
  t.deepEqual(animation.getCurrentFrame(), frames[0]);

  animation.animate(6);
  t.is(animation.getCurrentFrameIndex(), 1);
  t.is(animation.isComplete(), true);
  t.deepEqual(animation.getCurrentFrame(), frames[1]);

  animation.animate(7);
  t.is(animation.getCurrentFrameIndex(), 1);
  t.is(animation.isComplete(), true);
  t.deepEqual(animation.getCurrentFrame(), frames[1]);
});

test('delay', (t) => {
  const frames = [new Sprite(), new Sprite()];
  const animation = new Animation(frames, { delay: 2 });

  animation.animate(3);
  t.is(animation.getCurrentFrameIndex(), 0);
  t.is(animation.isComplete(), false);
  t.deepEqual(animation.getCurrentFrame(), frames[0]);

  animation.animate(4);
  t.is(animation.getCurrentFrameIndex(), 0);
  t.is(animation.isComplete(), false);
  t.deepEqual(animation.getCurrentFrame(), frames[0]);

  animation.animate(5);
  t.is(animation.getCurrentFrameIndex(), 0);
  t.is(animation.isComplete(), false);
  t.deepEqual(animation.getCurrentFrame(), frames[0]);

  animation.animate(6);
  t.is(animation.getCurrentFrameIndex(), 1);
  t.is(animation.isComplete(), false);
  t.deepEqual(animation.getCurrentFrame(), frames[1]);

  animation.animate(7);
  t.is(animation.getCurrentFrameIndex(), 1);
  t.is(animation.isComplete(), false);
  t.deepEqual(animation.getCurrentFrame(), frames[1]);

  animation.animate(8);
  t.is(animation.getCurrentFrameIndex(), 1);
  t.is(animation.isComplete(), true);
  t.deepEqual(animation.getCurrentFrame(), frames[1]);

  animation.animate(9);
  t.is(animation.getCurrentFrameIndex(), 1);
  t.is(animation.isComplete(), true);
  t.deepEqual(animation.getCurrentFrame(), frames[1]);
});

// test('infinite loop delay', (t) => {
//   const frames = [new Sprite(), new Sprite()];
//   const animation = new Animation(frames, { delay: 1, loop: true });

//   animation.animate(3);
//   t.is(animation.getCurrentFrameIndex(), 0);
//   t.is(animation.isComplete(), false);
//   t.deepEqual(animation.getCurrentFrame(), frames[0]);

//   animation.animate(4);
//   t.is(animation.getCurrentFrameIndex(), 0);
//   t.is(animation.isComplete(), false);
//   t.deepEqual(animation.getCurrentFrame(), frames[0]);

//   animation.animate(5);
//   t.is(animation.getCurrentFrameIndex(), 1);
//   t.is(animation.isComplete(), false);
//   t.deepEqual(animation.getCurrentFrame(), frames[1]);

//   animation.animate(6);
//   t.is(animation.getCurrentFrameIndex(), 1);
//   t.is(animation.isComplete(), false);
//   t.deepEqual(animation.getCurrentFrame(), frames[1]);

//   animation.animate(7);
//   t.is(animation.getCurrentFrameIndex(), 0);
//   t.is(animation.isComplete(), false);
//   t.deepEqual(animation.getCurrentFrame(), frames[0]);
// });

// test('finite loop delay', (t) => {
//   const frames = [new Sprite(), new Sprite()];
//   const animation = new Animation(frames, { delay: 1, loop: 2 });

//   animation.animate(3);
//   t.is(animation.getCurrentFrameIndex(), 0);
//   t.is(animation.isComplete(), false);
//   t.deepEqual(animation.getCurrentFrame(), frames[0]);

//   animation.animate(4);
//   t.is(animation.getCurrentFrameIndex(), 0);
//   t.is(animation.isComplete(), false);
//   t.deepEqual(animation.getCurrentFrame(), frames[0]);

//   animation.animate(5);
//   t.is(animation.getCurrentFrameIndex(), 1);
//   t.is(animation.isComplete(), false);
//   t.deepEqual(animation.getCurrentFrame(), frames[1]);

//   animation.animate(6);
//   t.is(animation.getCurrentFrameIndex(), 1);
//   t.is(animation.isComplete(), false);
//   t.deepEqual(animation.getCurrentFrame(), frames[1]);

//   animation.animate(7);
//   t.is(animation.getCurrentFrameIndex(), 0);
//   t.is(animation.isComplete(), false);
//   t.deepEqual(animation.getCurrentFrame(), frames[0]);

//   animation.animate(8);
//   t.is(animation.getCurrentFrameIndex(), 0);
//   t.is(animation.isComplete(), false);
//   t.deepEqual(animation.getCurrentFrame(), frames[0]);

//   animation.animate(9);
//   t.is(animation.getCurrentFrameIndex(), 1);
//   t.is(animation.isComplete(), false);
//   t.deepEqual(animation.getCurrentFrame(), frames[1]);

//   animation.animate(10);
//   t.is(animation.getCurrentFrameIndex(), 1);
//   t.is(animation.isComplete(), true);
//   t.deepEqual(animation.getCurrentFrame(), frames[1]);

//   animation.animate(11);
//   t.is(animation.getCurrentFrameIndex(), 1);
//   t.is(animation.isComplete(), true);
//   t.deepEqual(animation.getCurrentFrame(), frames[1]);
// });
