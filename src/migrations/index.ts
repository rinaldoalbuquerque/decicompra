import * as migration_20261004_003921_initial from './20261004_003921_initial';
import * as migration_20261004_004953_media_r2 from './20261004_004953_media_r2';
import * as migration_20261004_033429_roles from './20261004_033429_roles';
import * as migration_20261004_033851_categories from './20261004_033851_categories';
import * as migration_20261004_034110_slug_optional from './20261004_034110_slug_optional';
import * as migration_20261004_034244_brands_stores from './20261004_034244_brands_stores';
import * as migration_20261004_034738_products_variants from './20261004_034738_products_variants';

export const migrations = [
  {
    up: migration_20261004_003921_initial.up,
    down: migration_20261004_003921_initial.down,
    name: '20261004_003921_initial',
  },
  {
    up: migration_20261004_004953_media_r2.up,
    down: migration_20261004_004953_media_r2.down,
    name: '20261004_004953_media_r2',
  },
  {
    up: migration_20261004_033429_roles.up,
    down: migration_20261004_033429_roles.down,
    name: '20261004_033429_roles',
  },
  {
    up: migration_20261004_033851_categories.up,
    down: migration_20261004_033851_categories.down,
    name: '20261004_033851_categories',
  },
  {
    up: migration_20261004_034110_slug_optional.up,
    down: migration_20261004_034110_slug_optional.down,
    name: '20261004_034110_slug_optional',
  },
  {
    up: migration_20261004_034244_brands_stores.up,
    down: migration_20261004_034244_brands_stores.down,
    name: '20261004_034244_brands_stores',
  },
  {
    up: migration_20261004_034738_products_variants.up,
    down: migration_20261004_034738_products_variants.down,
    name: '20261004_034738_products_variants'
  },
];
