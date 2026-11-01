// Global constants. The game renders at a low internal resolution and is
// scaled up 4x to the 2920x1080 stage, which keeps pixel art crisp.
export const TILE = 16;
export const VIEW_W = 730;
export const VIEW_H = 270;
export const STAGE_W = 2920;
export const STAGE_H = 1080;
export const PIXEL_SCALE = STAGE_W / VIEW_W; // 4

export const WALK_SPEED = 64;
export const RUN_SPEED = 112;
export const HITBOX = { w: 10, h: 6 };
export const FOLLOW_DIST = 20;
export const INTERACT_RANGE = 6;

export const SAVE_KEY = 'dah.save.v1';
export const SETTINGS_KEY = 'dah.settings.v1';
export const AUTOSAVE_SECONDS = 15;

export const START_MINUTES = 2 * 60 + 13;
export const REAL_SECONDS_PER_GAME_MINUTE = 4;
