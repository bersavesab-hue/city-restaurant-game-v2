const MEMORY_CACHE =
  new Map();

const OBJECT_URL_CACHE =
  new Map();

const DB_NAME =
  "city_restaurant_visuals_v1";

const STORE_NAME =
  "dish_visuals";


function hasIndexedDb() {
  return (
    typeof indexedDB !==
    "undefined"
  );
}


function openDatabase() {
  if (
    !hasIndexedDb()
  ) {
    return Promise.resolve(
      null
    );
  }

  return new Promise(
    (
      resolve,
      reject
    ) => {
      const request =
        indexedDB.open(
          DB_NAME,
          1
        );

      request.onupgradeneeded =
        () => {
          const database =
            request.result;

          if (
            !database
              .objectStoreNames
              .contains(
                STORE_NAME
              )
          ) {
            database
              .createObjectStore(
                STORE_NAME,
                {
                  keyPath:
                    "key"
                }
              );
          }
        };

      request.onsuccess =
        () =>
          resolve(
            request.result
          );

      request.onerror =
        () =>
          reject(
            request.error
          );
    }
  );
}


async function readIndexedDb(
  key
) {
  const database =
    await openDatabase();

  if (
    !database
  ) {
    return null;
  }

  return new Promise(
    (
      resolve,
      reject
    ) => {
      const transaction =
        database.transaction(
          STORE_NAME,
          "readonly"
        );

      const store =
        transaction.objectStore(
          STORE_NAME
        );

      const request =
        store.get(
          key
        );

      request.onsuccess =
        () =>
          resolve(
            request.result ??
            null
          );

      request.onerror =
        () =>
          reject(
            request.error
          );

      transaction.oncomplete =
        () =>
          database.close();

      transaction.onerror =
        () =>
          database.close();
    }
  );
}


async function writeIndexedDb(
  record
) {
  const database =
    await openDatabase();

  if (
    !database
  ) {
    return false;
  }

  return new Promise(
    (
      resolve,
      reject
    ) => {
      const transaction =
        database.transaction(
          STORE_NAME,
          "readwrite"
        );

      const store =
        transaction.objectStore(
          STORE_NAME
        );

      store.put(
        record
      );

      transaction.oncomplete =
        () => {
          database.close();

          resolve(
            true
          );
        };

      transaction.onerror =
        () => {
          database.close();

          reject(
            transaction.error
          );
        };
    }
  );
}


export async function getCachedDishVisual(
  key
) {
  if (
    MEMORY_CACHE.has(
      key
    )
  ) {
    return MEMORY_CACHE.get(
      key
    );
  }

  try {
    const stored =
      await readIndexedDb(
        key
      );

    if (
      stored?.blob
    ) {
      MEMORY_CACHE.set(
        key,
        stored.blob
      );

      return stored.blob;
    }
  } catch {
    return null;
  }

  return null;
}


export async function putCachedDishVisual(
  key,
  blob
) {
  if (
    !key ||
    !blob
  ) {
    return false;
  }

  MEMORY_CACHE.set(
    key,
    blob
  );

  try {
    await writeIndexedDb({
      key,
      blob,
      updatedAt:
        Date.now()
    });
  } catch {
    return false;
  }

  return true;
}


export function getDishVisualObjectUrl(
  key,
  blob
) {
  if (
    OBJECT_URL_CACHE.has(
      key
    )
  ) {
    return OBJECT_URL_CACHE.get(
      key
    );
  }

  if (
    typeof URL ===
      "undefined" ||
    typeof URL.createObjectURL !==
      "function"
  ) {
    return null;
  }

  const url =
    URL.createObjectURL(
      blob
    );

  OBJECT_URL_CACHE.set(
    key,
    url
  );

  return url;
}


export function resetDishVisualCache() {
  MEMORY_CACHE.clear();

  if (
    typeof URL !==
      "undefined" &&
    typeof URL.revokeObjectURL ===
      "function"
  ) {
    for (
      const url
      of OBJECT_URL_CACHE
        .values()
    ) {
      URL.revokeObjectURL(
        url
      );
    }
  }

  OBJECT_URL_CACHE.clear();
}
