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

  // Path-based page rendering
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

// A global state manager inspired by Zustand
function createStore(createState) {
  let state = {};
  const listeners = new Set();

  const setState = (partial) => {
    const nextState = typeof partial === 'function' ? partial(state) : partial;
    state = { ...state, ...nextState };
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

// Global variables
window.noUI = new NoUI();
window.createStore = createStore;