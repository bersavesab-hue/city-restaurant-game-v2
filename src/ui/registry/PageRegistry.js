class PageRegistry {
  constructor() {
    this.pages = new Map();
  }

  register(definition) {
    if (!definition || typeof definition !== "object") {
      throw new TypeError("Page definition must be an object");
    }

    const id = String(definition.id ?? "").trim();
    const title = String(definition.title ?? "").trim();

    if (!id) {
      throw new Error("Page id is required");
    }

    if (!title) {
      throw new Error(`Page "${id}" requires a title`);
    }

    if (this.pages.has(id)) {
      throw new Error(`Page "${id}" is already registered`);
    }

    const page = Object.freeze({
      id,
      title,
      parent: definition.parent ?? null,
      layout: definition.layout ?? "management",
      nav: definition.nav ?? null,
      order: Number.isFinite(definition.order) ? definition.order : 100,
      unlock: definition.unlock ?? null,
      component: definition.component ?? null,
      metadata: Object.freeze({ ...(definition.metadata ?? {}) })
    });

    this.pages.set(id, page);
    return page;
  }

  has(id) {
    return this.pages.has(id);
  }

  get(id) {
    const page = this.pages.get(id);
    if (!page) {
      throw new Error(`Unknown page "${id}"`);
    }
    return page;
  }

  list() {
    return [...this.pages.values()].sort((a, b) => a.order - b.order);
  }

  children(parentId) {
    return this.list().filter(page => page.parent === parentId);
  }

  mainNavigation() {
    return this.list().filter(page => page.nav === "main");
  }

  isUnlocked(id, unlockResolver = null) {
    const page = this.get(id);
    if (!page.unlock) {
      return true;
    }
    if (typeof unlockResolver !== "function") {
      return false;
    }
    return Boolean(unlockResolver(page.unlock, page));
  }
}

export const pageRegistry = new PageRegistry();
export { PageRegistry };
