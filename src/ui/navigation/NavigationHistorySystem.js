class NavigationHistorySystem {
  constructor({
    maxEntries = 40
  } = {}) {
    this.maxEntries =
      maxEntries;

    this.entries =
      [];
  }


  push(
    pageId,
    params = {}
  ) {
    if (!pageId) {
      return null;
    }


    const entry = {
      pageId,

      params:
        structuredClone(
          params ??
          {}
        )
    };


    const previous =
      this.entries[
        this.entries.length -
        1
      ];


    if (
      previous &&
      previous.pageId ===
        entry.pageId &&
      JSON.stringify(
        previous.params
      ) ===
        JSON.stringify(
          entry.params
        )
    ) {
      return previous;
    }


    this.entries.push(
      entry
    );


    if (
      this.entries.length >
      this.maxEntries
    ) {
      this.entries.splice(
        0,
        this.entries.length -
        this.maxEntries
      );
    }


    return entry;
  }


  current() {
    return (
      this.entries[
        this.entries.length -
        1
      ] ??
      null
    );
  }


  canBack() {
    return (
      this.entries.length >
      1
    );
  }


  back(
    fallback = null
  ) {
    if (
      this.entries.length >
      1
    ) {
      this.entries.pop();

      return this.current();
    }


    return fallback
      ? {
          pageId:
            fallback,

          params: {}
        }
      : null;
  }


  replace(
    pageId,
    params = {}
  ) {
    const entry = {
      pageId,

      params:
        structuredClone(
          params ??
          {}
        )
    };


    if (
      this.entries.length ===
      0
    ) {
      this.entries.push(
        entry
      );
    } else {
      this.entries[
        this.entries.length -
        1
      ] =
        entry;
    }


    return entry;
  }


  clear() {
    this.entries =
      [];
  }
}


export const navigationHistorySystem =
  new NavigationHistorySystem();


export {
  NavigationHistorySystem
};
