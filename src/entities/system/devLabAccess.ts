const DEV_LAB_STORAGE_KEY = 'graf.devlab.enabled';

const readQueryFlag = () => {
  if (typeof window === 'undefined') return false;
  const url = new URL(window.location.href);
  return url.searchParams.get('devlab') === '1' || url.hash.includes('devlab');
};

export const readDevLabEnabled = () => {
  if (typeof window === 'undefined') return false;
  if (readQueryFlag()) {
    window.localStorage.setItem(DEV_LAB_STORAGE_KEY, '1');
    return true;
  }
  return window.localStorage.getItem(DEV_LAB_STORAGE_KEY) === '1';
};

export const setDevLabEnabled = (enabled: boolean) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(DEV_LAB_STORAGE_KEY, enabled ? '1' : '0');
};
