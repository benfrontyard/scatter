export * from './types';
export * from './assetSources';
export { nimboBrandKit } from './nimbo.brandKit';
export { ledgerlyBrandKit } from './ledgerly.brandKit';
export { draftlyBrandKit } from './draftly.brandKit';

import { nimboBrandKit } from './nimbo.brandKit';
import { ledgerlyBrandKit } from './ledgerly.brandKit';
import { draftlyBrandKit } from './draftly.brandKit';

export const fakeBrandKits = [
  nimboBrandKit,
  ledgerlyBrandKit,
  draftlyBrandKit,
];

export const fakeBrandKitByName = {
  Nimbo: nimboBrandKit,
  Ledgerly: ledgerlyBrandKit,
  Draftly: draftlyBrandKit,
};
