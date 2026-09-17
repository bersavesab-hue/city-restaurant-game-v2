class EventBus {
  constructor() {
    this.events = new Map();
  }

  on(eventName, handler) {
    if (typeof handler !== "function") {
      throw new TypeError("Event handler must be a function");
    }

    if (!this.events.has(eventName)) {
      this.events.set(eventName, new Set());
    }

    this.events.get(eventName).add(handler);

    return () => this.off(eventName, handler);
  }

  once(eventName, handler) {
    const wrapper = (...args) => {
      this.off(eventName, wrapper);
      handler(...args);
    };

    return this.on(eventName, wrapper);
  }

  off(eventName, handler) {
    const handlers = this.events.get(eventName);

    if (!handlers) {
      return false;
    }

    const removed = handlers.delete(handler);

    if (handlers.size === 0) {
      this.events.delete(eventName);
    }

    return removed;
  }

  emit(eventName, payload) {
    const handlers = this.events.get(eventName);

    if (!handlers) {
      return 0;
    }

    const snapshot = [...handlers];

    for (const handler of snapshot) {
      handler(payload);
    }

    return snapshot.length;
  }

  clear(eventName) {
    if (eventName !== undefined) {
      return this.events.delete(eventName);
    }

    this.events.clear();
    return true;
  }

  listenerCount(eventName) {
    return this.events.get(eventName)?.size ?? 0;
  }
}

export const eventBus = new EventBus();
export { EventBus };
