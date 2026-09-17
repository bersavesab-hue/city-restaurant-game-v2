import { eventBus } from "./EventBus.js";

function normalizeName(name) {
  if (typeof name !== "string" || name.trim() === "") {
    throw new TypeError(
      "Rule name must be a non-empty string"
    );
  }

  return name.trim();
}

function normalizeResult(result) {
  if (typeof result === "boolean") {
    return {
      passed: result,
      code: result ? "OK" : "RULE_FAILED",
      message: ""
    };
  }

  if (
    !result ||
    typeof result !== "object" ||
    Array.isArray(result)
  ) {
    throw new TypeError(
      "Rule must return a boolean or result object"
    );
  }

  if (typeof result.passed !== "boolean") {
    throw new TypeError(
      "Rule result must contain boolean 'passed'"
    );
  }

  return {
    passed: result.passed,
    code:
      result.code ??
      (result.passed ? "OK" : "RULE_FAILED"),
    message: result.message ?? "",
    data:
      result.data === undefined
        ? undefined
        : structuredClone(result.data)
  };
}

class RuleSystem {
  constructor() {
    this.rules = new Map();
  }

  register(name, evaluator, options = {}) {
    const ruleName = normalizeName(name);

    if (typeof evaluator !== "function") {
      throw new TypeError(
        `Rule "${ruleName}" evaluator must be a function`
      );
    }

    if (
      this.rules.has(ruleName) &&
      options.overwrite !== true
    ) {
      throw new Error(
        `Rule "${ruleName}" is already registered`
      );
    }

    this.rules.set(ruleName, {
      evaluator,
      description: options.description ?? ""
    });

    eventBus.emit("rule:registered", {
      name: ruleName
    });

    return ruleName;
  }

  unregister(name) {
    const ruleName = normalizeName(name);

    const removed =
      this.rules.delete(ruleName);

    if (removed) {
      eventBus.emit("rule:unregistered", {
        name: ruleName
      });
    }

    return removed;
  }

  has(name) {
    return this.rules.has(
      normalizeName(name)
    );
  }

  async evaluate(
    name,
    context = {},
    input = {}
  ) {
    const ruleName = normalizeName(name);
    const rule = this.rules.get(ruleName);

    if (!rule) {
      throw new Error(
        `Rule "${ruleName}" is not registered`
      );
    }

    const rawResult =
      await rule.evaluator(
        structuredClone(context),
        structuredClone(input)
      );

    const result =
      normalizeResult(rawResult);

    eventBus.emit("rule:evaluated", {
      name: ruleName,
      result
    });

    return {
      name: ruleName,
      ...result
    };
  }

  async evaluateAll(
    names,
    context = {},
    options = {}
  ) {
    if (!Array.isArray(names)) {
      throw new TypeError(
        "Rule names must be an array"
      );
    }

    const stopOnFailure =
      options.stopOnFailure ?? false;

    const results = [];

    for (const name of names) {
      const result =
        await this.evaluate(
          name,
          context
        );

      results.push(result);

      if (
        !result.passed &&
        stopOnFailure
      ) {
        break;
      }
    }

    const failures =
      results.filter(
        (result) => !result.passed
      );

    const summary = {
      passed: failures.length === 0,
      results,
      failures
    };

    eventBus.emit(
      "rule:batchEvaluated",
      summary
    );

    return summary;
  }

  async assert(
    names,
    context = {}
  ) {
    const ruleNames =
      Array.isArray(names)
        ? names
        : [names];

    const result =
      await this.evaluateAll(
        ruleNames,
        context,
        {
          stopOnFailure: true
        }
      );

    if (!result.passed) {
      const failure =
        result.failures[0];

      const error = new Error(
        failure.message ||
        `Rule "${failure.name}" failed`
      );

      error.code = failure.code;
      error.rule = failure.name;

      throw error;
    }

    return true;
  }

  list() {
    return [...this.rules.entries()]
      .map(([name, rule]) => ({
        name,
        description:
          rule.description
      }));
  }

  clear() {
    const count = this.rules.size;

    this.rules.clear();

    eventBus.emit("rule:cleared", {
      count
    });

    return count;
  }
}

export const ruleSystem =
  new RuleSystem();

export { RuleSystem };
