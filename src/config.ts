export const AUDIO_BASE_PATH = 'data/audio/';
export const GRAPHICS_BASE_PATH = 'data/graphics/';

export const TILE_SIZE = 64;
export const TILE_COUNT = 13;
export const FIELD_SIZE = TILE_COUNT * TILE_SIZE;
export const BORDER_LEFT_WIDTH = 64;
export const BORDER_RIGHT_WIDTH = 128;
export const BORDER_TOP_BOTTOM_HEIGHT = 32;
export const CANVAS_WIDTH = FIELD_SIZE + BORDER_LEFT_WIDTH + BORDER_RIGHT_WIDTH;
export const CANVAS_HEIGHT = FIELD_SIZE + BORDER_TOP_BOTTOM_HEIGHT * 2;
