class NoUI {
  constructor() {
    this.components = new Map();
    this.translations = new Map();
    this.currentLang = localStorage.getItem("language") || "en";
    this.translationSubscribers = new Set();
    this.observer = new MutationObserver(this.handleMutations.bind(this));
    this.init();
  }

  async init() {
    await this.loadTranslations(["en", "az", "ru"]);
    this.observer.observe(document.body, { childList: true, subtree: true });
    this.scanComponents();
  }

  async loadTranslations(langs) {
    for (const lang of langs) {
      try {
        const response = await fetch(`assets/locale/${lang}.json`);
        const data = await response.json();
        this.translations.set(lang, data);
      } catch (error) {
        console.error(`Ошибка загрузки перевода для ${lang}:`, error);
      }
    }
    this.notifyTranslationSubscribers();
  }

  setLanguage(lang) {
    if (this.translations.has(lang)) {
      this.currentLang = lang;
      localStorage.setItem("language", lang);
      this.notifyTranslationSubscribers();
    }
  }

  t(key) {
    const translations = this.translations.get(this.currentLang) || {};
    return translations[key] || key;
  }

  subscribeToLanguageChange(callback) {
    this.translationSubscribers.add(callback);
    return () => this.translationSubscribers.delete(callback);
  }

  notifyTranslationSubscribers() {
    this.translationSubscribers.forEach((callback) => callback(this.currentLang));
  }

  registerComponent(name, component) {
    this.components.set(name.toLowerCase(), component);
    customElements.define(
      name.toLowerCase(),
      class extends HTMLElement {
        connectedCallback() {
          component.render(this);
        }
      }
    );
  }

  scanComponents() {
    this.components.forEach((component, name) => {
      const elements = document.querySelectorAll(name);
      elements.forEach((el) => {
        if (!el._rendered) {
          component.render(el);
          el._rendered = true;
        }
      });
    });
  }

  handleMutations(mutations) {
    mutations.forEach((mutation) => {
      if (mutation.addedNodes.length) {
        this.scanComponents();
      }
    });
  }

  renderPage(path, component) {
    const main = document.querySelector("#app");
    if (main) {
      main.innerHTML = "";
      component.render(main);
      this.scanComponents();
    }
  }

  static createState(initialValue) {
    let value = initialValue;
    const listeners = new Set();
    return {
      get value() { return value; },
      set value(newValue) {
        value = newValue;
        listeners.forEach((listener) => listener(value));
      },
      subscribe(listener) {
        listeners.add(listener);
        return () => listeners.delete(listener);
      }
    };
  }
}

// Global state manager with middleware support
function createStore(createState, middlewares = []) {
  let state = {};
  const listeners = new Set();

  // Wrapping setState in the middleware chain
  const setState = (partial) => {
    const nextState = typeof partial === 'function' ? partial(state) : partial;
    const newState = { ...state, ...nextState };
    
    // Applying middleware
    let currentState = state;
    let update = nextState;
    
    middlewares.forEach((middleware) => {
      const result = middleware({
        getState: () => currentState,
        setState: (next) => {
          update = typeof next === 'function' ? next(currentState) : next;
          currentState = { ...currentState, ...update };
        },
        nextState: update
      });
      if (result) {
        update = result;
        currentState = { ...currentState, ...update };
      }
    });

    state = { ...state, ...update };
    listeners.forEach((listener) => listener(state));
  };

  const getState = () => state;

  const subscribe = (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  const store = createState(setState, getState);
  state = store.state || {};

  return {
    getState,
    setState,
    subscribe,
    ...store.actions
  };
}

// Examples of middleware
function loggerMiddleware({ getState, nextState }) {
  // console.log('Previous state:', getState());
  // console.log('Next state:', nextState);
  return nextState;
}

function persistMiddleware({ getState, nextState }, storageKey = 'noUIState') {
  const newState = { ...getState(), ...nextState };
  localStorage.setItem(storageKey, JSON.stringify(newState));
  return nextState;
}

// Global variables
window.noUI = new NoUI();
window.createStore = createStore;
window.noUIMiddlewares = { loggerMiddleware, persistMiddleware };