import {
  chainManagementPageSystem
} from "./ChainManagementPageSystem.js";

import {
  gameChromeSystem
} from "../../components/GameChromeSystem.js";

import {
  renderBottomNavigation
} from "../../components/GameChromeView.js";

function esc(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function money(value) {
  return Math.round(Number(value) || 0)
    .toLocaleString("zh-CN");
}

class ChainManagementView {
  constructor({
    pageSystem = chainManagementPageSystem
  } = {}) {
    this.pageSystem = pageSystem;
    this.root = null;
    this.restaurantId = null;
    this.onNavigate = null;
    this.message = "";
  }

  mount(root, {
    restaurantId,
    onNavigate = null
  } = {}) {
    this.root = root;
    this.restaurantId = restaurantId;
    this.onNavigate = onNavigate;
    return this.render();
  }

  renderStores(page) {
    return page.stores.map(store => `
      <article class="chain-card">
        <strong>${store.branchNumber === 1 ? "总店" : `第${store.branchNumber}店`} · ${esc(store.name)}</strong>
        <span>Lv.${store.level} · ${esc(store.status)}</span>
        <small>${esc(store.locationName)} · ¥${money(store.balance)}</small>
        <button type="button" data-chain-action="enter-store" data-store-id="${esc(store.id)}">进入门店</button>
      </article>
    `).join("");
  }

  renderBranch(page) {
    if (!page.features.secondStore) {
      return `<section class="chain-panel"><h2>第二门店</h2><p>Lv.6 解锁。</p></section>`;
    }

    const regions = page.regions
      .filter(item => item.unlocked)
      .map(region => `
        <option value="${esc(region.id)}">
          ${esc(region.name)}${region.home ? "（总部区域）" : ""}
        </option>
      `).join("");

    return `
      <section class="chain-panel">
        <h2>门店扩张</h2>
        <p>当前 ${page.storeCount}/${page.maxStores} 家门店</p>
        ${page.canCreateBranch ? `
          <form data-chain-form="create-branch">
            <input name="name" maxlength="20" required value="${esc(`${page.brandName}·新店`)}">
            <input name="initialCapital" type="number" min="20000" step="1000" value="40000" required>
            <select name="targetRegionId" required>${regions}</select>
            <button type="submit">筹建新门店</button>
          </form>
        ` : `<p>当前等级门店数量已达上限。</p>`}
      </section>
    `;
  }

  renderBrand(page) {
    return `
      <section class="chain-panel">
        <h2>品牌管理</h2>
        ${page.features.chainManagement ? `
          <form data-chain-form="rename-brand">
            <input name="brandName" maxlength="20" required value="${esc(page.brandName)}">
            <button type="submit">更新品牌名称</button>
          </form>
        ` : `<p>Lv.8 解锁品牌统一管理。</p>`}
      </section>
    `;
  }

  renderKitchen(page) {
    if (!page.features.centralKitchen) {
      return `<section class="chain-panel"><h2>中央厨房</h2><p>Lv.9 解锁集中备货与门店调拨。</p></section>`;
    }

    if (!page.centralKitchen) {
      return `
        <section class="chain-panel">
          <h2>中央厨房</h2>
          <p>开启后可把各店库存集中后统一配送。</p>
          <button type="button" data-chain-action="open-kitchen">启用中央厨房</button>
        </section>
      `;
    }

    const stock = page.kitchenStock.length
      ? page.kitchenStock.map(item => `
          <article class="chain-card">
            <strong>${esc(item.ingredientName)}</strong>
            <span>${item.quantity} · 品质 ${item.averageQuality}</span>
          </article>
        `).join("")
      : "<p>中央厨房暂时没有库存。</p>";

    const inbound = page.storeInventory.map(item => `
      <option value="${esc(`${item.restaurantId}::${item.ingredientId}`)}">
        ${esc(item.restaurantName)} · ${esc(item.ingredientName)}（${item.quantity}）
      </option>
    `).join("");

    const outbound = page.kitchenStock.map(item => `
      <option value="${esc(item.ingredientId)}">
        ${esc(item.ingredientName)}（${item.quantity}）
      </option>
    `).join("");

    const stores = page.stores.map(store => `
      <option value="${esc(store.id)}">${esc(store.name)}</option>
    `).join("");

    return `
      <section class="chain-panel">
        <h2>${esc(page.centralKitchen.name)}</h2>
        <div class="chain-grid">${stock}</div>

        <form data-chain-form="kitchen-inbound">
          <h3>门店 → 中央厨房</h3>
          <select name="sourceLine" required>
            <option value="">选择门店库存</option>
            ${inbound}
          </select>
          <input name="quantity" type="number" min="0.01" step="0.01" required placeholder="调入数量">
          <button type="submit">集中入库</button>
        </form>

        <form data-chain-form="kitchen-outbound">
          <h3>中央厨房 → 门店</h3>
          <select name="ingredientId" required>
            <option value="">选择中央库存</option>
            ${outbound}
          </select>
          <select name="targetRestaurantId" required>${stores}</select>
          <input name="quantity" type="number" min="0.01" step="0.01" required placeholder="配送数量">
          <button type="submit">配送到门店</button>
        </form>
      </section>
    `;
  }

  renderRegions(page) {
    return `
      <section class="chain-panel">
        <h2>区域扩张</h2>
        ${page.features.regionalExpansion ? `
          <div class="chain-grid">
            ${page.regions.map(region => `
              <article class="chain-card">
                <strong>${esc(region.name)}</strong>
                <span>
                  ${region.home ? "总部区域" : region.unlocked ? "已进入" : `进入成本 ¥${money(region.unlockCost)}`}
                </span>
                ${region.unlocked ? "" : `
                  <button type="button" data-chain-action="unlock-region" data-region-id="${esc(region.id)}">
                    解锁区域
                  </button>
                `}
              </article>
            `).join("")}
          </div>
        ` : `<p>Lv.10 解锁跨区域经营。</p>`}
      </section>
    `;
  }

  renderMarkup(page) {
    return `
      <main class="rg-screen chain-management">
        <header class="chain-management__header">
          <h1>${esc(page.brandName)}</h1>
          <p>多门店 · 中央厨房 · 区域扩张</p>
          <strong>${page.storeCount}/${page.maxStores} 家门店 · 总部 Lv.${page.anchorLevel}</strong>
        </header>

        ${this.message ? `<p class="chain-management__message">${esc(this.message)}</p>` : ""}

        <section class="chain-panel">
          <h2>门店网络</h2>
          <div class="chain-grid">${this.renderStores(page)}</div>
        </section>

        ${this.renderBranch(page)}
        ${this.renderBrand(page)}
        ${this.renderKitchen(page)}
        ${this.renderRegions(page)}

        ${renderBottomNavigation(
          gameChromeSystem
            .getNavigation({
              restaurantId:
                page.restaurantId,

              activePageId:
                "more"
            })
        )}
      </main>
    `;
  }

  setMessage(value) {
    this.message = String(value ?? "");
    return this.render();
  }

  render() {
    const page = this.pageSystem.getPage(this.restaurantId);
    this.root.innerHTML = this.renderMarkup(page);
    this.bind();
    return page;
  }

  bind() {
    this.root.querySelector('[data-chain-form="create-branch"]')
      ?.addEventListener("submit", event => {
        event.preventDefault();
        try {
          const data = new FormData(event.currentTarget);
          const branch = this.pageSystem.createBranch(this.restaurantId, {
            name: data.get("name"),
            initialCapital: Number(data.get("initialCapital")),
            targetRegionId: data.get("targetRegionId")
          });
          this.onNavigate?.("properties", branch.id);
        } catch (error) {
          this.setMessage(error.message);
        }
      });

    this.root.querySelector('[data-chain-form="rename-brand"]')
      ?.addEventListener("submit", event => {
        event.preventDefault();
        try {
          const data = new FormData(event.currentTarget);
          this.pageSystem.renameBrand(this.restaurantId, data.get("brandName"));
          this.message = "品牌名称已更新。";
          this.render();
        } catch (error) {
          this.setMessage(error.message);
        }
      });

    this.root.querySelector('[data-chain-action="open-kitchen"]')
      ?.addEventListener("click", () => {
        try {
          this.pageSystem.openCentralKitchen(this.restaurantId);
          this.message = "中央厨房已启用。";
          this.render();
        } catch (error) {
          this.setMessage(error.message);
        }
      });

    this.root.querySelector('[data-chain-form="kitchen-inbound"]')
      ?.addEventListener("submit", event => {
        event.preventDefault();
        try {
          const data = new FormData(event.currentTarget);
          const [sourceRestaurantId, ingredientId] =
            String(data.get("sourceLine")).split("::");

          this.pageSystem.receiveKitchenStock(this.restaurantId, {
            sourceRestaurantId,
            ingredientId,
            quantity: Number(data.get("quantity"))
          });

          this.message = "库存已集中到中央厨房。";
          this.render();
        } catch (error) {
          this.setMessage(error.message);
        }
      });

    this.root.querySelector('[data-chain-form="kitchen-outbound"]')
      ?.addEventListener("submit", event => {
        event.preventDefault();
        try {
          const data = new FormData(event.currentTarget);
          this.pageSystem.dispatchKitchenStock(this.restaurantId, {
            targetRestaurantId: data.get("targetRestaurantId"),
            ingredientId: data.get("ingredientId"),
            quantity: Number(data.get("quantity"))
          });

          this.message = "中央厨房配送完成。";
          this.render();
        } catch (error) {
          this.setMessage(error.message);
        }
      });

    this.root.querySelectorAll('[data-chain-action="unlock-region"]')
      .forEach(button => {
        button.addEventListener("click", () => {
          try {
            this.pageSystem.unlockRegion(
              this.restaurantId,
              button.dataset.regionId
            );
            this.message = "新经营区域已解锁。";
            this.render();
          } catch (error) {
            this.setMessage(error.message);
          }
        });
      });

    this.root.querySelectorAll('[data-chain-action="enter-store"]')
      .forEach(button => {
        button.addEventListener("click", () => {
          this.onNavigate?.(
            "restaurant",
            button.dataset.storeId
          );
        });
      });

    this.root.querySelectorAll(
      "[data-page-target]"
    )
      .forEach(button => {
        button.addEventListener(
          "click",
          () => {
            this.onNavigate?.(
              button.dataset
                .pageTarget,
              this.restaurantId
            );
          }
        );
      });
  }

  destroy() {
    this.root = null;
    this.onNavigate = null;
  }
}

export const chainManagementView =
  new ChainManagementView();

export {
  ChainManagementView
};
