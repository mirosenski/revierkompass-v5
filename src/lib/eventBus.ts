export type ResetHandler = () => void;

export const dispatchReset = (): void => {
  window.dispatchEvent(new CustomEvent('revierkompass:reset'));
};

export const onReset = (handler: ResetHandler): (() => void) => {
  const listener = () => handler();
  window.addEventListener('revierkompass:reset', listener);
  return () => window.removeEventListener('revierkompass:reset', listener);
};

