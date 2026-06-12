// Test environment setup. Some jsdom/node combinations don't expose `localStorage` as a global
// (it lives on `window` but isn't mirrored to globalThis), which breaks @nanostores/persistent and
// every store test that uses bare `localStorage`. Reconcile them so the store and the tests share
// one storage object:
//   1. If a global already exists, do nothing.
//   2. Else, if jsdom's window.localStorage exists (it does once the env has a real origin),
//      alias the global to it — so persisted writes and test reads hit the same store.
//   3. Else, fall back to a minimal in-memory implementation.
const g = globalThis as typeof globalThis & { localStorage?: Storage; window?: Window };

if (typeof g.localStorage === 'undefined') {
  if (typeof g.window !== 'undefined' && g.window.localStorage) {
    Object.defineProperty(globalThis, 'localStorage', {
      value: g.window.localStorage,
      configurable: true,
    });
  } else {
    let store: Record<string, string> = {};
    const memoryLocalStorage: Storage = {
      getItem: (key: string) => (key in store ? store[key] : null),
      setItem: (key: string, value: string) => {
        store[key] = String(value);
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      clear: () => {
        store = {};
      },
      key: (index: number) => Object.keys(store)[index] ?? null,
      get length() {
        return Object.keys(store).length;
      },
    };
    Object.defineProperty(globalThis, 'localStorage', {
      value: memoryLocalStorage,
      configurable: true,
    });
    if (typeof g.window !== 'undefined') {
      Object.defineProperty(g.window, 'localStorage', {
        value: memoryLocalStorage,
        configurable: true,
      });
    }
  }
}
