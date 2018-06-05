[![Build status](https://travis-ci.com/dogballs/battle-city.svg?branch=master)](https://travis-ci.com/dogballs/battle-city)

### Folder structure:

- src
  - core - Game engine. Think of it as a library which can be reused in another projects. Should not have any code associated with game domain.

### Implementation details

- As we depend on one particular sprite, we want to follow the size of the images which are present on the sprite. Original images on the sprite are too small, so we are scaling it 1:4 in code. For now it is hardcoded which every display object.

### Resources

Game related:
- https://strategywiki.org/wiki/Battle_City/How_to_play
- https://www.youtube.com/watch?v=MPsA5PtfdL0
- https://www.spriters-resource.com/nes/batcity/sheet/60016/

Other libraries and game engies for inspiration, naming and structure:

- https://docs.unity3d.com/Manual/index.html
- https://love2d.org/wiki/Main_Page
- https://docs.coronalabs.com/guide/index.html
- https://threejs.org/

Patterns:

- http://java-design-patterns.com/patterns/
