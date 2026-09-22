function keyOf(point) {
  return `${point.x},${point.y}`;
}

function manhattan(a, b) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

function reconstruct(cameFrom, current) {
  const path = [current];

  while (cameFrom.has(keyOf(current))) {
    current = cameFrom.get(keyOf(current));
    path.push(current);
  }

  path.reverse();
  return path;
}

class GridPathfinder {
  constructor({
    width,
    height,
    blocked = []
  }) {
    if (!Number.isInteger(width) || width < 2) {
      throw new RangeError("Scene grid width must be at least 2");
    }

    if (!Number.isInteger(height) || height < 2) {
      throw new RangeError("Scene grid height must be at least 2");
    }

    this.width = width;
    this.height = height;
    this.blocked = new Set(
      blocked.map(point => keyOf(point))
    );
  }

  isInside(point) {
    return (
      point.x >= 0 &&
      point.x < this.width &&
      point.y >= 0 &&
      point.y < this.height
    );
  }

  isWalkable(point) {
    return (
      this.isInside(point) &&
      !this.blocked.has(keyOf(point))
    );
  }

  setBlocked(point, blocked = true) {
    const key = keyOf(point);

    if (blocked) {
      this.blocked.add(key);
    } else {
      this.blocked.delete(key);
    }
  }

  neighbors(point) {
    return [
      { x: point.x + 1, y: point.y },
      { x: point.x - 1, y: point.y },
      { x: point.x, y: point.y + 1 },
      { x: point.x, y: point.y - 1 }
    ].filter(next => this.isWalkable(next));
  }

  findPath(start, goal) {
    const from = {
      x: Math.round(start.x),
      y: Math.round(start.y)
    };

    const to = {
      x: Math.round(goal.x),
      y: Math.round(goal.y)
    };

    if (!this.isWalkable(from) || !this.isWalkable(to)) {
      return [];
    }

    if (from.x === to.x && from.y === to.y) {
      return [from];
    }

    const open = [from];
    const openKeys = new Set([keyOf(from)]);
    const cameFrom = new Map();
    const gScore = new Map([[keyOf(from), 0]]);
    const fScore = new Map([[keyOf(from), manhattan(from, to)]]);

    while (open.length > 0) {
      open.sort(
        (a, b) =>
          (fScore.get(keyOf(a)) ?? Infinity) -
          (fScore.get(keyOf(b)) ?? Infinity)
      );

      const current = open.shift();
      const currentKey = keyOf(current);
      openKeys.delete(currentKey);

      if (current.x === to.x && current.y === to.y) {
        return reconstruct(cameFrom, current);
      }

      for (const next of this.neighbors(current)) {
        const nextKey = keyOf(next);
        const tentative =
          (gScore.get(currentKey) ?? Infinity) + 1;

        if (tentative >= (gScore.get(nextKey) ?? Infinity)) {
          continue;
        }

        cameFrom.set(nextKey, current);
        gScore.set(nextKey, tentative);
        fScore.set(nextKey, tentative + manhattan(next, to));

        if (!openKeys.has(nextKey)) {
          open.push(next);
          openKeys.add(nextKey);
        }
      }
    }

    return [];
  }
}

export {
  GridPathfinder,
  keyOf
};
