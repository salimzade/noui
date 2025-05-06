// Глобальный store
const useGlobalStore = createStore((set, get) => ({
  state: {
    count: 0,
    message: "Welcome to Contact"
  },
  actions: {
    increment: () => set({ count: get().count + 1 }),
    decrement: () => set({ count: get().count - 1 }),
    updateMessage: (message) => set({ message })
  }
}));

const HeaderComponent = {
  render(element) {
    const state = noUI.constructor.createState(0);
    const update = () => {
      element.innerHTML = /*html*/`
        <div>
          <h1>${noUI.t("header.title")}</h1>
          <p>${noUI.t("header.count")}: ${state.value}</p>
          <button id="increment-btn">${noUI.t("header.increment")}</button>
        </div>`;
      const button = element.querySelector("#increment-btn");
      button?.addEventListener("click", () => state.value++);
    };
    state.subscribe(update);
    noUI.subscribeToLanguageChange(update);
    update();
  }
};

const FooterComponent = {
  render(element) {
    const state = noUI.constructor.createState(noUI.t("footer.greeting"));
    const update = () => {
      element.innerHTML = /*html*/`
        <div>
          <footer>${state.value}</footer>
          <button id="change-text-btn">${noUI.t("footer.change")}</button>
        </div>`;
      const button = element.querySelector("#change-text-btn");
      button?.addEventListener("click", () => state.value = noUI.t("footer.updated"));
    };
    state.subscribe(update);
    noUI.subscribeToLanguageChange(update);
    update();
  }
};

const LanguageSwitcherComponent = {
  render(element) {
    element.innerHTML = /*html*/`
      <div>
        <button id="lang-en">English</button>
        <button id="lang-az">Azərbaycan</button>
        <button id="lang-ru">Русский</button>
      </div>`;
    element.querySelector("#lang-en")?.addEventListener("click", () => noUI.setLanguage("en"));
    element.querySelector("#lang-az")?.addEventListener("click", () => noUI.setLanguage("az"));
    element.querySelector("#lang-ru")?.addEventListener("click", () => noUI.setLanguage("ru"));
  }
};

const HomeComponent = {
  render(element) {
    element.innerHTML = /*html*/`
      <no-lang-switcher></no-lang-switcher>
      <no-header></no-header>
      <div>
        <h2>${noUI.t("home.title")}</h2>
        <p>${noUI.t("home.description")}</p>
        <a href="/about">Go to About</a>
        <a href="/contact">Go to Contact</a>
      </div>
      <no-footer></no-footer>`;
  }
};

const AboutComponent = {
  render(element) {
    element.innerHTML = /*html*/`
      <no-lang-switcher></no-lang-switcher>
      <no-header></no-header>
      <div>
        <h2>${noUI.t("about.title")}</h2>
        <p>${noUI.t("about.description")}</p>
        <a href="/">Go to Home</a>
        <a href="/contact">Go to Contact</a>
      </div>
      <no-footer></no-footer>`;
  }
};

const ContactComponent = {
  render(element) {
    const update = () => {
      const { count, message } = useGlobalStore.getState();
      element.innerHTML = /*html*/`
        <no-lang-switcher></no-lang-switcher>
        <no-header></no-header>
        <div>
          <h2>${noUI.t("contact.title")}</h2>
          <p>Global Count: ${count}</p>
          <p>Message: ${message}</p>
          <button id="increment-global">Increment Global Count</button>
          <button id="decrement-global">Decrement Global Count</button>
          <button id="update-message">Update Message</button>
          <a href="/">Go to Home</a>
          <a href="/about">Go to About</a>
        </div>
        <no-footer></no-footer>`;
      element.querySelector("#increment-global")?.addEventListener("click", () => useGlobalStore.increment());
      element.querySelector("#decrement-global")?.addEventListener("click", () => useGlobalStore.decrement());
      element.querySelector("#update-message")?.addEventListener("click", () => useGlobalStore.updateMessage("Contact page updated"));
    };
    useGlobalStore.subscribe(update);
    noUI.subscribeToLanguageChange(update);
    update();
  }
};

// Component registration
noUI.registerComponent("no-header", HeaderComponent);
noUI.registerComponent("no-footer", FooterComponent);
noUI.registerComponent("no-lang-switcher", LanguageSwitcherComponent);

// Path-based page rendering
function renderPage() {
  const path = window.location.pathname;
  const routes = {
    "/": HomeComponent,
    "/about": AboutComponent,
    "/contact": ContactComponent
  };
  const component = routes[path] || routes["/"];
  noUI.renderPage(path, component);
}

// Calling rendering
renderPage();