import { createSelector } from 'reselect';

export const storeName = 'logistration';

export const logistrationSelector = state => ({ ...state[storeName] });

export const loginRequestSelector = createSelector(
  logistrationSelector,
  logistration => logistration.loginResult,
);

export const tpaProvidersSelector = createSelector(
  logistrationSelector,
  logistration => logistration.tpaProviders,
);
