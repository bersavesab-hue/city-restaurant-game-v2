const SCOPE_TYPE = Object.freeze({
  STORE: "store",
  GROUP: "group"
});

class ManagementScopeSystem {
  constructor() {
    this.type = SCOPE_TYPE.STORE;
    this.storeId = null;
  }

  setStore(storeId) {
    this.type = SCOPE_TYPE.STORE;
    this.storeId = storeId ?? null;
    return this.getCurrent();
  }

  setGroup(fallbackStoreId = null) {
    this.type = SCOPE_TYPE.GROUP;
    this.storeId = fallbackStoreId ?? this.storeId;
    return this.getCurrent();
  }

  normalize(stores, currentStoreId) {
    const availableStores = Array.isArray(stores)
      ? stores.filter(store => store?.id)
      : [];

    if (availableStores.length < 2) {
      return this.setStore(currentStoreId ?? availableStores[0]?.id ?? null);
    }

    const selectedExists = availableStores.some(
      store => store.id === this.storeId
    );

    if (!selectedExists) {
      this.storeId = currentStoreId ?? availableStores[0].id;
    }

    return this.getCurrent();
  }

  getCurrent() {
    return {
      type: this.type,
      storeId: this.storeId
    };
  }
}

export const managementScopeSystem = new ManagementScopeSystem();

export { ManagementScopeSystem, SCOPE_TYPE };
