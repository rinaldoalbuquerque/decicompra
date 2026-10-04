import * as migration_20261004_003921_initial from './20261004_003921_initial';
import * as migration_20261004_004953_media_r2 from './20261004_004953_media_r2';

export const migrations = [
  {
    up: migration_20261004_003921_initial.up,
    down: migration_20261004_003921_initial.down,
    name: '20261004_003921_initial',
  },
  {
    up: migration_20261004_004953_media_r2.up,
    down: migration_20261004_004953_media_r2.down,
    name: '20261004_004953_media_r2'
  },
];
