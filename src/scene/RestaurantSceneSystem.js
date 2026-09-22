import {
  GridPathfinder,
  keyOf
} from "./GridPathfinder.js";

const DEFAULT_LAYOUT =
  Object.freeze({
    width: 14,
    height: 20,
    entrance: Object.freeze({ x: 6, y: 19 }),
    host: Object.freeze({ x: 6, y: 17 }),
    cashier: Object.freeze({ x: 6, y: 15 }),
    serverHome: Object.freeze({ x: 7, y: 8 }),
    kitchenPickup: Object.freeze({ x: 6, y: 7 }),
    chefHome: Object.freeze({ x: 6, y: 2 }),
    tables: Object.freeze([
      Object.freeze({ id: "table_1", x: 3, y: 6, seatX: 3, seatY: 7 }),
      Object.freeze({ id: "table_2", x: 10, y: 6, seatX: 10, seatY: 7 }),
      Object.freeze({ id: "table_3", x: 3, y: 10, seatX: 3, seatY: 11 }),
      Object.freeze({ id: "table_4", x: 10, y: 10, seatX: 10, seatY: 11 }),
      Object.freeze({ id: "table_5", x: 3, y: 13, seatX: 3, seatY: 14 }),
      Object.freeze({ id: "table_6", x: 10, y: 13, seatX: 10, seatY: 14 })
    ])
  });

const SERVER_TASK_PRIORITY =
  Object.freeze({
    deliver: 0,
    take_order: 1,
    clear_table: 2
  });

function clone(value) {
  return structuredClone(value);
}

function distance(a, b) {
  return Math.hypot(
    a.x - b.x,
    a.y - b.y
  );
}

function sameTile(a, b) {
  return (
    Math.round(a.x) === Math.round(b.x) &&
    Math.round(a.y) === Math.round(b.y)
  );
}

function makeBlocked(layout) {
  const blocked = [];

  for (let x = 0; x < layout.width; x += 1) {
    blocked.push({ x, y: 0 });

    if (x !== layout.entrance.x) {
      blocked.push({
        x,
        y: layout.height - 1
      });
    }
  }

  for (let y = 1; y < layout.height - 1; y += 1) {
    blocked.push({ x: 0, y });
    blocked.push({
      x: layout.width - 1,
      y
    });
  }

  for (const table of layout.tables) {
    blocked.push({
      x: table.x,
      y: table.y
    });
  }

  return blocked;
}

class RestaurantSceneSystem {
  constructor({
    app,
    layout = DEFAULT_LAYOUT,
    random = Math.random
  }) {
    if (!app?.systems) {
      throw new TypeError("RestaurantSceneSystem requires app.systems");
    }

    this.app = app;
    this.layout = clone(layout);
    this.random = random;
    this.pathfinder =
      new GridPathfinder({
        width: this.layout.width,
        height: this.layout.height,
        blocked: makeBlocked(this.layout)
      });

    this.resetRuntime();
  }

  resetRuntime() {
    this.running = false;
    this.restaurantId = null;
    this.menuItemId = null;
    this.recipe = null;
    this.speed = 1;
    this.spawnEverySeconds = 4.5;
    this.spawnTimer = 0.75;
    this.maxCustomers = 10;
    this.nextCustomerId = 1;
    this.nextTicketId = 1;
    this.elapsedSeconds = 0;

    this.actors = new Map();
    this.tables =
      this.layout.tables.map(table => ({
        ...clone(table),
        status: "available",
        customerId: null
      }));

    this.tickets = new Map();
    this.serverTasks = [];
    this.chefQueue = [];

    this.stats = {
      arrived: 0,
      seated: 0,
      ordersTaken: 0,
      dishesCooked: 0,
      served: 0,
      paid: 0,
      left: 0,
      failedPayments: 0,
      revenue: 0
    };
  }

  start({
    restaurantId,
    menuItemId,
    spawnEverySeconds = 4.5,
    maxCustomers = 10
  }) {
    this.resetRuntime();

    const menuItem =
      this.app.systems.menuSystem.get(menuItemId);

    if (menuItem.restaurantId !== restaurantId) {
      throw new Error("Scene menu item does not belong to restaurant");
    }

    const recipe =
      this.app.systems.recipeSystem.get(menuItem.recipeId);

    if (!recipe) {
      throw new Error("Scene recipe does not exist");
    }

    this.restaurantId = restaurantId;
    this.menuItemId = menuItemId;
    this.recipe = recipe;
    this.spawnEverySeconds =
      Math.max(1.5, Number(spawnEverySeconds) || 4.5);
    this.maxCustomers =
      Math.max(1, Math.floor(Number(maxCustomers) || 10));

    this.createStaffActors();
    this.running = true;
    this.emit("scene:started", {
      restaurantId,
      menuItemId
    });

    return this.getSnapshot();
  }

  stop() {
    this.running = false;
    this.emit("scene:stopped", {
      restaurantId: this.restaurantId
    });
  }

  setSpeed(speed) {
    if (![0, 1, 2, 4].includes(speed)) {
      throw new RangeError("Scene speed must be 0, 1, 2, or 4");
    }

    this.speed = speed;
    return speed;
  }

  emit(name, payload) {
    this.app.core?.eventBus?.emit?.(
      name,
      clone(payload)
    );
  }

  createStaffActors() {
    const employees =
      this.app.systems.employeeSystem
        .listByRestaurant(this.restaurantId);

    const roleStarts = {
      chef: this.layout.chefHome,
      server: this.layout.serverHome,
      cashier: this.layout.cashier
    };

    for (const roleId of ["chef", "server", "cashier"]) {
      const employee =
        employees.find(item => item.roleId === roleId);

      if (!employee) {
        throw new Error(
          `Scene play requires an active ${roleId}`
        );
      }

      const point = roleStarts[roleId];

      this.actors.set(
        `staff:${employee.id}`,
        {
          id: `staff:${employee.id}`,
          kind: "staff",
          employeeId: employee.id,
          name: employee.name,
          roleId,
          x: point.x,
          y: point.y,
          state:
            roleId === "chef"
              ? "chef_idle"
              : roleId === "server"
                ? "server_idle"
                : "cashier_idle",
          speed: roleId === "server" ? 3.2 : 2.6,
          path: [],
          pathTargetKey: null,
          task: null,
          timer: 0,
          ticketId: null
        }
      );
    }
  }

  getStaff(roleId) {
    return [...this.actors.values()]
      .find(
        actor =>
          actor.kind === "staff" &&
          actor.roleId === roleId
      );
  }

  getCustomerActors() {
    return [...this.actors.values()]
      .filter(actor => actor.kind === "customer");
  }

  spawnCustomer() {
    if (!this.running) {
      return null;
    }

    const activeCustomers =
      this.getCustomerActors()
        .filter(actor => actor.state !== "done")
        .length;

    if (activeCustomers >= this.maxCustomers) {
      return null;
    }

    const id =
      `customer_${String(this.nextCustomerId).padStart(4, "0")}`;

    this.nextCustomerId += 1;

    const actor = {
      id,
      kind: "customer",
      name: `顾客${this.nextCustomerId - 1}`,
      x: this.layout.entrance.x,
      y: this.layout.entrance.y,
      state: "entering",
      speed: 2.15 + this.random() * 0.45,
      path: [],
      pathTargetKey: null,
      timer: 0,
      tableId: null,
      ticketId: null,
      lastError: null
    };

    this.actors.set(id, actor);
    this.stats.arrived += 1;

    this.emit("scene:customerArrived", {
      customerId: id
    });

    return clone(actor);
  }

  getAvailableTable() {
    return this.tables.find(
      table => table.status === "available"
    ) ?? null;
  }

  allocateTables() {
    const waiting =
      this.getCustomerActors()
        .filter(actor => actor.state === "waiting_table")
        .sort((a, b) => a.id.localeCompare(b.id));

    for (const customer of waiting) {
      const table = this.getAvailableTable();

      if (!table) {
        break;
      }

      table.status = "occupied";
      table.customerId = customer.id;
      customer.tableId = table.id;
      customer.state = "walking_to_table";
      customer.path = [];
      customer.pathTargetKey = null;

      this.stats.seated += 1;

      this.emit("scene:tableAssigned", {
        customerId: customer.id,
        tableId: table.id
      });
    }
  }

  enqueueServerTask(task) {
    if (
      this.serverTasks.some(
        item =>
          item.type === task.type &&
          item.customerId === task.customerId &&
          item.tableId === task.tableId &&
          item.ticketId === task.ticketId
      )
    ) {
      return;
    }

    this.serverTasks.push({
      ...task,
      priority:
        SERVER_TASK_PRIORITY[task.type] ?? 99,
      createdAt:
        this.elapsedSeconds
    });

    this.serverTasks.sort(
      (a, b) =>
        a.priority - b.priority ||
        a.createdAt - b.createdAt
    );
  }

  createTicket(customer) {
    const ticket = {
      id:
        `ticket_${String(this.nextTicketId).padStart(4, "0")}`,
      customerId: customer.id,
      tableId: customer.tableId,
      menuItemId: this.menuItemId,
      status: "waiting_cook",
      createdAt: this.elapsedSeconds,
      readyAt: null
    };

    this.nextTicketId += 1;
    this.tickets.set(ticket.id, ticket);
    this.chefQueue.push(ticket.id);

    customer.ticketId = ticket.id;
    customer.state = "waiting_food";

    this.stats.ordersTaken += 1;

    this.emit("scene:orderTaken", {
      ticket
    });

    return ticket;
  }

  getTable(tableId) {
    return this.tables.find(
      table => table.id === tableId
    ) ?? null;
  }

  moveActor(actor, target, deltaSeconds) {
    const targetKey = keyOf(target);

    if (
      actor.pathTargetKey !== targetKey ||
      actor.path.length === 0
    ) {
      const path =
        this.pathfinder.findPath(
          {
            x: actor.x,
            y: actor.y
          },
          target
        );

      actor.path =
        path.length > 1
          ? path.slice(1)
          : [];

      actor.pathTargetKey = targetKey;
    }

    if (
      actor.path.length === 0 &&
      sameTile(actor, target)
    ) {
      actor.x = target.x;
      actor.y = target.y;
      return true;
    }

    const next = actor.path[0];

    if (!next) {
      return false;
    }

    const dx = next.x - actor.x;
    const dy = next.y - actor.y;
    const remaining = Math.hypot(dx, dy);
    const travel = actor.speed * deltaSeconds;

    if (remaining <= travel || remaining < 0.001) {
      actor.x = next.x;
      actor.y = next.y;
      actor.path.shift();

      if (
        actor.path.length === 0 &&
        sameTile(actor, target)
      ) {
        actor.x = target.x;
        actor.y = target.y;
        return true;
      }

      return false;
    }

    actor.x += dx / remaining * travel;
    actor.y += dy / remaining * travel;

    return distance(actor, target) < 0.05;
  }

  updateCustomers(deltaSeconds) {
    for (const customer of this.getCustomerActors()) {
      if (customer.state === "entering") {
        if (
          this.moveActor(
            customer,
            this.layout.host,
            deltaSeconds
          )
        ) {
          customer.state = "waiting_table";
          customer.path = [];
        }
        continue;
      }

      if (customer.state === "walking_to_table") {
        const table = this.getTable(customer.tableId);

        if (
          table &&
          this.moveActor(
            customer,
            {
              x: table.seatX,
              y: table.seatY
            },
            deltaSeconds
          )
        ) {
          customer.state = "waiting_order";
          customer.path = [];
          this.enqueueServerTask({
            type: "take_order",
            customerId: customer.id,
            tableId: table.id
          });
        }
        continue;
      }

      if (customer.state === "eating") {
        customer.timer -= deltaSeconds;

        if (customer.timer <= 0) {
          const table = this.getTable(customer.tableId);

          if (table) {
            table.status = "dirty";
            table.customerId = null;

            this.enqueueServerTask({
              type: "clear_table",
              customerId: customer.id,
              tableId: table.id
            });
          }

          customer.state = "walking_to_cashier";
          customer.path = [];
          customer.pathTargetKey = null;
        }
        continue;
      }

      if (customer.state === "walking_to_cashier") {
        if (
          this.moveActor(
            customer,
            this.layout.cashier,
            deltaSeconds
          )
        ) {
          customer.state = "paying";
          customer.timer = 1.2;
        }
        continue;
      }

      if (customer.state === "paying") {
        customer.timer -= deltaSeconds;

        if (customer.timer <= 0) {
          this.commitPayment(customer);
          customer.state = "leaving";
          customer.path = [];
          customer.pathTargetKey = null;
        }
        continue;
      }

      if (customer.state === "leaving") {
        if (
          this.moveActor(
            customer,
            this.layout.entrance,
            deltaSeconds
          )
        ) {
          customer.state = "done";
          this.stats.left += 1;

          this.emit("scene:customerLeft", {
            customerId: customer.id
          });
        }
      }
    }
  }

  commitPayment(customer) {
    try {
      const order =
        this.app.systems.orderSystem.place({
          restaurantId:
            this.restaurantId,
          items: [
            {
              menuItemId:
                this.menuItemId,
              quantity: 1
            }
          ]
        });

      this.stats.paid += 1;
      this.stats.revenue +=
        order.paidAmount ??
        order.totalRevenue ??
        0;

      this.emit("scene:paymentCompleted", {
        customerId: customer.id,
        orderId: order.id,
        amount:
          order.paidAmount ??
          order.totalRevenue ??
          0
      });
    } catch (error) {
      customer.lastError =
        error instanceof Error
          ? error.message
          : String(error);

      this.stats.failedPayments += 1;

      this.emit("scene:paymentFailed", {
        customerId: customer.id,
        error: customer.lastError
      });
    }
  }

  updateServer(deltaSeconds) {
    const server = this.getStaff("server");

    if (!server) {
      return;
    }

    if (!server.task) {
      server.task =
        this.serverTasks.shift() ?? null;

      if (!server.task) {
        server.state = "server_idle";
        this.moveActor(
          server,
          this.layout.serverHome,
          deltaSeconds
        );
        return;
      }

      server.path = [];
      server.pathTargetKey = null;
      server.timer = 0;
      server.task.phase = "go";
    }

    const task = server.task;

    if (task.type === "take_order") {
      const customer = this.actors.get(task.customerId);
      const table = this.getTable(task.tableId);

      if (!customer || !table || customer.state !== "waiting_order") {
        server.task = null;
        return;
      }

      server.state = "taking_order";

      if (task.phase === "go") {
        const reached =
          this.moveActor(
            server,
            {
              x: table.seatX,
              y: table.seatY
            },
            deltaSeconds
          );

        if (reached) {
          task.phase = "service";
          server.timer = 1.1;
        }
        return;
      }

      server.timer -= deltaSeconds;

      if (server.timer <= 0) {
        this.createTicket(customer);
        server.task = null;
        server.path = [];
        server.pathTargetKey = null;
      }

      return;
    }

    if (task.type === "deliver") {
      const ticket = this.tickets.get(task.ticketId);
      const customer =
        ticket
          ? this.actors.get(ticket.customerId)
          : null;
      const table =
        ticket
          ? this.getTable(ticket.tableId)
          : null;

      if (
        !ticket ||
        !customer ||
        !table ||
        ticket.status !== "ready"
      ) {
        server.task = null;
        return;
      }

      server.state = "delivering";

      if (task.phase === "go") {
        if (
          this.moveActor(
            server,
            this.layout.kitchenPickup,
            deltaSeconds
          )
        ) {
          task.phase = "to_table";
          server.path = [];
          server.pathTargetKey = null;
        }
        return;
      }

      if (task.phase === "to_table") {
        if (
          this.moveActor(
            server,
            {
              x: table.seatX,
              y: table.seatY
            },
            deltaSeconds
          )
        ) {
          ticket.status = "served";
          customer.state = "eating";
          customer.timer =
            5.5 + this.random() * 3.5;

          this.stats.served += 1;

          this.emit("scene:dishServed", {
            ticketId: ticket.id,
            customerId: customer.id
          });

          server.task = null;
          server.path = [];
          server.pathTargetKey = null;
        }
      }

      return;
    }

    if (task.type === "clear_table") {
      const table = this.getTable(task.tableId);

      if (!table || table.status !== "dirty") {
        server.task = null;
        return;
      }

      server.state = "clearing_table";

      if (task.phase === "go") {
        if (
          this.moveActor(
            server,
            {
              x: table.seatX,
              y: table.seatY
            },
            deltaSeconds
          )
        ) {
          task.phase = "service";
          server.timer = 0.9;
        }
        return;
      }

      server.timer -= deltaSeconds;

      if (server.timer <= 0) {
        table.status = "available";
        table.customerId = null;
        server.task = null;
        server.path = [];
        server.pathTargetKey = null;

        this.emit("scene:tableCleared", {
          tableId: table.id
        });
      }
    }
  }

  updateChef(deltaSeconds) {
    const chef = this.getStaff("chef");

    if (!chef) {
      return;
    }

    if (!chef.ticketId) {
      const ticketId = this.chefQueue.shift();

      if (!ticketId) {
        chef.state = "chef_idle";
        return;
      }

      const ticket = this.tickets.get(ticketId);

      if (!ticket || ticket.status !== "waiting_cook") {
        return;
      }

      ticket.status = "cooking";
      chef.ticketId = ticketId;
      chef.state = "cooking";

      const cookingMinutes =
        Number(this.recipe?.cookingMinutes) || 5;

      chef.timer =
        Math.max(
          1.8,
          Math.min(
            8,
            cookingMinutes * 0.45
          )
        );

      this.emit("scene:cookingStarted", {
        ticketId
      });

      return;
    }

    chef.timer -= deltaSeconds;

    if (chef.timer > 0) {
      return;
    }

    const ticket =
      this.tickets.get(chef.ticketId);

    if (ticket) {
      ticket.status = "ready";
      ticket.readyAt = this.elapsedSeconds;
      this.stats.dishesCooked += 1;

      this.enqueueServerTask({
        type: "deliver",
        customerId: ticket.customerId,
        tableId: ticket.tableId,
        ticketId: ticket.id
      });

      this.emit("scene:cookingCompleted", {
        ticketId: ticket.id
      });
    }

    chef.ticketId = null;
    chef.state = "chef_idle";
    chef.timer = 0;
  }

  step(deltaSeconds) {
    this.elapsedSeconds += deltaSeconds;

    this.spawnTimer -= deltaSeconds;

    if (this.spawnTimer <= 0) {
      this.spawnCustomer();
      this.spawnTimer += this.spawnEverySeconds;
    }

    this.allocateTables();
    this.updateChef(deltaSeconds);
    this.updateServer(deltaSeconds);
    this.updateCustomers(deltaSeconds);
    this.allocateTables();

    for (const actor of [...this.actors.values()]) {
      if (
        actor.kind === "customer" &&
        actor.state === "done"
      ) {
        this.actors.delete(actor.id);
      }
    }
  }

  tick(deltaSeconds) {
    if (
      !this.running ||
      this.speed === 0
    ) {
      return this.getSnapshot();
    }

    const safeDelta =
      Math.max(
        0,
        Math.min(
          0.5,
          Number(deltaSeconds) || 0
        )
      ) * this.speed;

    let remaining = safeDelta;

    while (remaining > 0) {
      const step =
        Math.min(
          0.05,
          remaining
        );

      this.step(step);
      remaining -= step;
    }

    return this.getSnapshot();
  }

  getSnapshot() {
    return {
      running: this.running,
      restaurantId: this.restaurantId,
      menuItemId: this.menuItemId,
      speed: this.speed,
      elapsedSeconds: this.elapsedSeconds,
      layout: clone(this.layout),
      actors:
        [...this.actors.values()]
          .map(actor => clone(actor)),
      tables: clone(this.tables),
      tickets:
        [...this.tickets.values()]
          .map(ticket => clone(ticket)),
      stats: clone(this.stats),
      queuedServerTasks:
        this.serverTasks.length,
      queuedKitchenTickets:
        this.chefQueue.length
    };
  }
}

export {
  RestaurantSceneSystem,
  DEFAULT_LAYOUT
};
