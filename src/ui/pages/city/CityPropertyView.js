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

export class CityPropertyView {
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
    this.offerId = null;
  }

  mount(root, { restaurantId = null } = {}) {
    if (!root) throw new Error("CityPropertyView root is required");
    this.root = root;
    this.restaurantId = restaurantId;
    this.renderMarketplace();
    return this;
  }

  renderMarketplace(filters = {}) {
    this.offerId = null;
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
      button.innerHTML = `
        <strong>${district.name}</strong>
        <span>
          机会 ${district.opportunityScore}
          · 客流 ${district.trafficIndex}
          · 消费 ${district.spendingPower}
          · 竞争 ${district.competition}
          · 交通 ${district.transitAccess}
          · 停车 ${district.parkingConvenience}
          · 外卖 ${district.deliveryDemand}
          · ${district.propertyCount}套
        </span>
      `;
      button.addEventListener("click", () => {
        this.renderMarketplace({ districtId: district.id });
      });
      districtRow.append(button);
    }

    const marketInfo = el("div", "cr-property-market-info");
    const summaries = model.market?.districts ?? [];
    const available = summaries.reduce(
      (sum, item) => sum + (item.availableGenerated ?? 0),
      0
    );
    marketInfo.innerHTML = `
      <div>
        <strong>动态房源市场</strong>
        <span>${available}套动态房源 · 每7天滚动更新</span>
      </div>
      <div class="cr-property-market-tags">
        <span>30–10000㎡</span>
        <span>真实户型</span>
        <span>可议价房源</span>
        <span>NPC会抢租</span>
      </div>
    `;

    const list = el("section", "cr-property-list");
    if (model.properties.length === 0) {
      list.append(el("div", "cr-property-empty", "当前筛选条件下没有可租房源"));
    }

    for (const property of model.properties) {
      const card = el("button", "cr-property-card");
      card.type = "button";
      const marketBadges = property.source === "market"
        ? `
          <div class="cr-property-card__badges">
            <span>动态房源</span>
            ${property.qualityScore !== null ? `<span>房源评分 ${property.qualityScore}</span>` : ""}
            <span>推荐 ${property.recommendation?.score ?? "-"}</span>
            ${property.listing.remainingDays !== null ? `<span>${property.listing.remainingDays}天后下架</span>` : ""}
            ${property.competition?.daysUntilPossibleClaim !== null ? `<span>${property.competition.daysUntilPossibleClaim}天内可能被抢租</span>` : ""}
          </div>
        `
        : "";
      card.innerHTML = `
        <div class="cr-property-card__scene" aria-hidden="true"></div>
        <div class="cr-property-card__body">
          ${marketBadges}
          <div class="cr-property-card__name">${property.name}</div>
          <div class="cr-property-card__district">${property.districtName} · 房东 ${property.landlord?.name ?? "业主"}</div>
          <div class="cr-property-card__metrics">
            <span>建筑 ${property.area}㎡</span>
            <span>可用 ${property.usableArea}㎡</span>
            <span>${property.floorCount}层</span>
            <span>${money(property.monthlyRent)}/月</span>
          </div>
          <div class="cr-property-card__features">
            <span class="${property.foodServiceAllowed ? "is-good" : "is-bad"}">${property.foodServiceAllowed ? "可做餐饮" : "限制餐饮"}</span>
            <span class="${property.exhaustAllowed ? "is-good" : "is-bad"}">${property.exhaustAllowed ? "可排烟" : "不可排烟"}</span>
            ${property.leaseTerms?.negotiable ? `<span class="is-good">可议价</span>` : ""}
            ${property.parkingSpaces > 0 ? `<span>${property.parkingSpaces}车位</span>` : ""}
          </div>
          <div class="cr-property-card__footer">
            <span>签约首付 ${money(property.quote.upfront)}</span>
            <strong>${property.quote.affordable === false ? "资金不足" : "查看房源"}</strong>
          </div>
        </div>`;
      card.addEventListener("click", () => this.renderDetail(property.id));
      list.append(card);
    }

    this.root.append(header, districtRow, marketInfo, list);
    return model;
  }

  renderDetail(propertyId, offerId = null) {
    this.selectedPropertyId = propertyId;
    const model = this.pageSystem.getPropertyDetail(
      propertyId,
      this.restaurantId,
      this.months,
      offerId
    );
    this.months = model.quote.months;
    this.offerId =
      model.activeOffer?.status === "accepted"
        ? model.activeOffer.id
        : offerId;

    const {
      property,
      district,
      quote,
      leaseState,
      landlord,
      leaseTerms,
      activeOffer
    } = model;
    this.root.innerHTML = "";

    const back = el("button", "cr-property-back", "← 返回房源列表");
    back.type = "button";
    back.addEventListener("click", () => this.renderMarketplace());

    const shell = el("section", "cr-property-detail");
    shell.innerHTML = `
      <div class="cr-property-detail__visual" aria-hidden="true"></div>
      <div class="cr-property-detail__content">
        <div class="cr-property-detail__eyebrow">${property.districtName}${property.source === "market" ? " · 动态房源" : ""}</div>
        <h2>${property.name}</h2>
        <div class="cr-property-detail__landlord">
          <strong>房东 ${landlord?.name ?? "业主"}</strong>
          <span>${leaseTerms.negotiable ? "可议价" : "固定条件"}</span>
        </div>
        <div class="cr-property-detail__specs">
          <div><strong>${property.area}㎡</strong><span>建筑面积</span></div>
          <div><strong>${property.usableArea}㎡</strong><span>可用面积</span></div>
          <div><strong>${property.floorCount}层</strong><span>楼层</span></div>
          <div><strong>${money(property.monthlyRent)}</strong><span>挂牌月租</span></div>
        </div>
        <div class="cr-property-detail__district">
          <span>推荐 ${property.recommendation?.score ?? "-"}</span>
          <span>商圈机会 ${property.recommendation?.districtOpportunityScore ?? "-"}</span>
          <span>客流 ${district?.trafficIndex ?? "-"}</span>
          <span>消费力 ${district?.spendingPower ?? "-"}</span>
          <span>竞争 ${district?.competition ?? "-"}</span>
          <span>交通 ${district?.transitAccess ?? "-"}</span>
          <span>停车 ${district?.parkingConvenience ?? "-"}</span>
          <span>外卖需求 ${district?.deliveryDemand ?? "-"}</span>
          ${property.frontageMeters !== null ? `<span>门面 ${property.frontageMeters}m</span>` : ""}
          ${property.ceilingHeight !== null ? `<span>层高 ${property.ceilingHeight}m</span>` : ""}
          <span>${property.foodServiceAllowed ? "可做餐饮" : "餐饮受限"}</span>
          <span>${property.exhaustAllowed ? "可排烟" : "不可排烟"}</span>
        </div>
        ${property.source === "market" ? `
          <div class="cr-property-listing-meta">
            <span>房源评分 ${property.qualityScore ?? "-"}</span>
            <span>${property.listing.remainingDays ?? "-"}天后市场换新</span>
            <span>抢租热度 ${leaseTerms.competitorDemand}</span>
          </div>
        ` : ""}
        <div class="cr-property-detail__terms">
          <span>租期 ${leaseTerms.minMonths}-${leaseTerms.maxMonths}个月</span>
          <span>物业费 ${money(leaseTerms.propertyFeeMonthly)}/月</span>
          <span>转让费 ${money(leaseTerms.transferFee)}</span>
          <span>最高免租 ${leaseTerms.rentFreeMaxDays}天</span>
          <span>续租涨幅约 ${Math.round((leaseTerms.renewalIncreaseRate ?? 0) * 100)}%</span>
        </div>
        ${activeOffer ? `
          <div class="cr-property-offer ${activeOffer.status}">
            <strong>${activeOffer.status === "accepted" ? "房东已接受" : "房东还价"}</strong>
            <span>月租 ${money(activeOffer.monthlyRent)} · 免租 ${activeOffer.rentFreeDays}天 · 有效至第${activeOffer.expiresDay}日</span>
          </div>
        ` : ""}
        <div class="cr-property-detail__quote">
          <span>月租 ${money(quote.monthlyRent)}</span>
          <span>押金 ${money(quote.deposit)}</span>
          <span>物业费 ${money(quote.propertyFeeMonthly)}</span>
          <span>转让费 ${money(quote.transferFee)}</span>
          <span>免租 ${quote.rentFreeDays}天</span>
          <strong>签约首付 ${money(quote.upfront)}</strong>
        </div>
      </div>`;

    const actions = el("div", "cr-property-detail__actions");

    if (leaseState.canNegotiate && this.restaurantId && !activeOffer) {
      const negotiateButton = el(
        "button",
        "cr-property-negotiate-button",
        "尝试议价"
      );
      negotiateButton.type = "button";
      negotiateButton.addEventListener("click", () => this.negotiateSelected(model));
      actions.append(negotiateButton);
    }

    if (activeOffer?.status === "countered") {
      const acceptCounterButton = el(
        "button",
        "cr-property-negotiate-button",
        `接受房东还价 ${money(activeOffer.monthlyRent)}`
      );
      acceptCounterButton.type = "button";
      acceptCounterButton.addEventListener("click", () => {
        const accepted = this.pageSystem.acceptCounter(activeOffer.id);
        this.offerId = accepted.id;
        this.renderDetail(propertyId, accepted.id);
      });
      actions.append(acceptCounterButton);
    }

    const leaseButton = el(
      "button",
      "cr-property-lease-button",
      leaseState.hasActiveLease
        ? "当前门店已有租约"
        : !property.foodServiceAllowed
          ? "该房源不允许餐饮"
          : quote.affordable === false
            ? "资金不足"
            : activeOffer?.status === "accepted"
              ? "按谈妥条件签约"
              : "按挂牌条件签约"
    );
    leaseButton.type = "button";
    leaseButton.disabled =
      !this.restaurantId ||
      !leaseState.canSign ||
      activeOffer?.status === "countered";
    leaseButton.addEventListener("click", () => this.signSelected());
    actions.append(leaseButton);

    this.root.append(back, shell, actions);
    return model;
  }

  negotiateSelected(model) {
    if (!this.restaurantId || !this.selectedPropertyId) {
      throw new Error("Restaurant and property must be selected before negotiation");
    }

    const requestedRent = Math.round(model.property.monthlyRent * 0.97);
    const requestedRentFreeDays = Math.min(
      7,
      model.leaseTerms.rentFreeMaxDays ?? 0
    );
    const result = this.pageSystem.negotiateLease({
      restaurantId: this.restaurantId,
      propertyId: this.selectedPropertyId,
      months: this.months,
      requestedRent,
      requestedRentFreeDays
    });

    this.offerId =
      result.offer.status === "accepted"
        ? result.offer.id
        : null;
    this.renderDetail(
      this.selectedPropertyId,
      this.offerId
    );
    return result;
  }

  signSelected() {
    if (!this.restaurantId || !this.selectedPropertyId) {
      throw new Error("Restaurant and property must be selected before lease signing");
    }

    const detail = this.pageSystem.getPropertyDetail(
      this.selectedPropertyId,
      this.restaurantId,
      this.months,
      this.offerId
    );
    const offerId =
      detail.activeOffer?.status === "accepted"
        ? detail.activeOffer.id
        : null;

    const result = this.pageSystem.signLease({
      restaurantId: this.restaurantId,
      propertyId: this.selectedPropertyId,
      months: this.months,
      offerId
    });

    if (typeof this.onNavigate === "function") {
      this.onNavigate(result.nextPage, result);
    }

    return result;
  }
}

export const cityPropertyView = new CityPropertyView();
