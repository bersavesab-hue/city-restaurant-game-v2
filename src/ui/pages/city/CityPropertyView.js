import { cityPropertyPageSystem } from "./CityPropertyPageSystem.js";

function money(value) {
  return `¥${Math.round(value ?? 0).toLocaleString("zh-CN")}`;
}

function el(tag, className, text = null) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== null) node.textContent = text;
  return node;
}

class CityPropertyView {
  constructor({
    pageSystem = cityPropertyPageSystem,
    onNavigate = null
  } = {}) {
    this.pageSystem = pageSystem;
    this.onNavigate = onNavigate;
    this.root = null;
    this.restaurantId = null;
    this.selectedPropertyId = null;
    this.months = 12;
  }

  mount(root, { restaurantId = null } = {}) {
    if (!root) throw new Error("CityPropertyView root is required");
    this.root = root;
    this.restaurantId = restaurantId;
    this.renderMarketplace();
    return this;
  }

  renderMarketplace(filters = {}) {
    const model = this.pageSystem.getMarketplace({
      restaurantId: this.restaurantId,
      ...filters
    });

    this.root.innerHTML = "";
    this.root.className = "cr-city-property-page";

    const header = el("header", "cr-city-property-header");
    header.append(
      el("div", "cr-city-property-title", "城市与房源"),
      el(
        "div",
        "cr-city-property-balance",
        model.balance === null ? "未选择门店" : `可用资金 ${money(model.balance)}`
      )
    );

    const districtRow = el("div", "cr-city-district-row");
    for (const district of model.districts) {
      const button = el("button", "cr-city-district-chip");
      button.type = "button";
      button.innerHTML = `<strong>${district.name}</strong><span>客流 ${district.trafficIndex} · 消费 ${district.spendingPower} · 竞争 ${district.competition}</span>`;
      button.addEventListener("click", () => {
        this.renderMarketplace({ districtId: district.id });
      });
      districtRow.append(button);
    }

    const list = el("section", "cr-property-list");
    if (model.properties.length === 0) {
      list.append(el("div", "cr-property-empty", "当前筛选条件下没有可租房源"));
    }

    for (const property of model.properties) {
      const card = el("button", "cr-property-card");
      card.type = "button";
      card.innerHTML = `
        <div class="cr-property-card__scene" aria-hidden="true"></div>
        <div class="cr-property-card__body">
          <div class="cr-property-card__name">${property.name}</div>
          <div class="cr-property-card__district">${property.districtName}</div>
          <div class="cr-property-card__metrics">
            <span>${property.area}㎡</span>
            <span>参考座位 ${property.seats}</span>
            <span>${money(property.monthlyRent)}/月</span>
          </div>
          <div class="cr-property-card__footer">
            <span>签约首付 ${money(property.quote.upfront)}</span>
            <strong>${property.quote.affordable === false ? "资金不足" : "查看房源"}</strong>
          </div>
        </div>`;
      card.addEventListener("click", () => this.renderDetail(property.id));
      list.append(card);
    }

    this.root.append(header, districtRow, list);
    return model;
  }

  renderDetail(propertyId) {
    this.selectedPropertyId = propertyId;
    const model = this.pageSystem.getPropertyDetail(
      propertyId,
      this.restaurantId,
      this.months
    );

    const { property, district, quote, leaseState } = model;
    this.root.innerHTML = "";

    const back = el("button", "cr-property-back", "← 返回房源列表");
    back.type = "button";
    back.addEventListener("click", () => this.renderMarketplace());

    const shell = el("section", "cr-property-detail");
    shell.innerHTML = `
      <div class="cr-property-detail__visual" aria-hidden="true"></div>
      <div class="cr-property-detail__content">
        <div class="cr-property-detail__eyebrow">${property.districtName}</div>
        <h2>${property.name}</h2>
        <div class="cr-property-detail__specs">
          <div><strong>${property.area}㎡</strong><span>建筑面积</span></div>
          <div><strong>${property.seats}</strong><span>参考座位</span></div>
          <div><strong>${money(property.monthlyRent)}</strong><span>月租</span></div>
          <div><strong>${property.depositMonths}个月</strong><span>押金</span></div>
        </div>
        <div class="cr-property-detail__district">
          <span>客流 ${district?.trafficIndex ?? "-"}</span>
          <span>消费力 ${district?.spendingPower ?? "-"}</span>
          <span>竞争 ${district?.competition ?? "-"}</span>
        </div>
        <div class="cr-property-detail__quote">
          <span>首月租金 ${money(quote.monthlyRent)}</span>
          <span>押金 ${money(quote.deposit)}</span>
          <strong>签约首付 ${money(quote.upfront)}</strong>
        </div>
      </div>`;

    const actions = el("div", "cr-property-detail__actions");
    const leaseButton = el(
      "button",
      "cr-property-lease-button",
      leaseState.hasActiveLease
        ? "当前门店已有租约"
        : quote.affordable === false
          ? "资金不足"
          : "签约租赁"
    );
    leaseButton.type = "button";
    leaseButton.disabled = !leaseState.canSign || !this.restaurantId;
    leaseButton.addEventListener("click", () => this.signSelected());
    actions.append(leaseButton);

    this.root.append(back, shell, actions);
    return model;
  }

  signSelected() {
    if (!this.restaurantId || !this.selectedPropertyId) {
      throw new Error("Restaurant and property must be selected before lease signing");
    }

    const result = this.pageSystem.signLease({
      restaurantId: this.restaurantId,
      propertyId: this.selectedPropertyId,
      months: this.months
    });

    if (typeof this.onNavigate === "function") {
      this.onNavigate(result.nextPage, result);
    }

    return result;
  }
}

export const cityPropertyView = new CityPropertyView();
export { CityPropertyView };
