import * as migration_20261004_003921_initial from './20261004_003921_initial';
import * as migration_20261004_004953_media_r2 from './20261004_004953_media_r2';
import * as migration_20261004_033429_roles from './20261004_033429_roles';
import * as migration_20261004_033851_categories from './20261004_033851_categories';
import * as migration_20261004_034110_slug_optional from './20261004_034110_slug_optional';
import * as migration_20261004_034244_brands_stores from './20261004_034244_brands_stores';
import * as migration_20261004_034738_products_variants from './20261004_034738_products_variants';
import * as migration_20261004_035250_offers from './20261004_035250_offers';
import * as migration_20261004_123906_redirects from './20261004_123906_redirects';
import * as migration_20261004_124229_authors from './20261004_124229_authors';
import * as migration_20261004_124804_contents from './20261004_124804_contents';
import * as migration_20261004_124910_content_product_nullable from './20261004_124910_content_product_nullable';
import * as migration_20261004_125434_globals from './20261004_125434_globals';
import * as migration_20261005_233500_busca from './20261005_233500_busca';
import * as migration_20261006_024550_home_hero from './20261006_024550_home_hero';

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
    name: '20261004_034738_products_variants',
  },
  {
    up: migration_20261004_035250_offers.up,
    down: migration_20261004_035250_offers.down,
    name: '20261004_035250_offers',
  },
  {
    up: migration_20261004_123906_redirects.up,
    down: migration_20261004_123906_redirects.down,
    name: '20261004_123906_redirects',
  },
  {
    up: migration_20261004_124229_authors.up,
    down: migration_20261004_124229_authors.down,
    name: '20261004_124229_authors',
  },
  {
    up: migration_20261004_124804_contents.up,
    down: migration_20261004_124804_contents.down,
    name: '20261004_124804_contents',
  },
  {
    up: migration_20261004_124910_content_product_nullable.up,
    down: migration_20261004_124910_content_product_nullable.down,
    name: '20261004_124910_content_product_nullable',
  },
  {
    up: migration_20261004_125434_globals.up,
    down: migration_20261004_125434_globals.down,
    name: '20261004_125434_globals',
  },
  {
    up: migration_20261005_233500_busca.up,
    down: migration_20261005_233500_busca.down,
    name: '20261005_233500_busca',
  },
  {
    up: migration_20261006_024550_home_hero.up,
    down: migration_20261006_024550_home_hero.down,
    name: '20261006_024550_home_hero'
  },
];
