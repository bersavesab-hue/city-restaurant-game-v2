const UI_V2_COMPONENT_CATALOG =
  Object.freeze({
    pageHero:
      Object.freeze({
        id: "page-hero",
        role:
          "一级页面主视觉，承载静态美术与动态标题，不把业务数字烘焙进图片"
      }),

    sectionHeader:
      Object.freeze({
        id: "section-header",
        role:
          "统一分区标题、数量、查看全部入口"
      }),

    kpiStrip:
      Object.freeze({
        id: "kpi-strip",
        role:
          "2-4个核心指标的统一展示容器"
      }),

    kpiCard:
      Object.freeze({
        id: "kpi-card",
        role:
          "指标图标、标题、主值、趋势"
      }),

    filterTabs:
      Object.freeze({
        id: "filter-tabs",
        role:
          "同级状态/分类筛选"
      }),

    searchField:
      Object.freeze({
        id: "search-field",
        role:
          "列表搜索"
      }),

    statusChip:
      Object.freeze({
        id: "status-chip",
        role:
          "营业、筹备、异常、在岗、休息、高潜力等短状态"
      }),

    actionCard:
      Object.freeze({
        id: "action-card",
        role:
          "单一功能入口，图标/配图 + 标题 + 说明 + 动态状态"
      }),

    imageFeatureCard:
      Object.freeze({
        id: "image-feature-card",
        role:
          "经营中心等高权重模块的大图功能入口"
      }),

    taskRow:
      Object.freeze({
        id: "task-row",
        role:
          "今日待办、告警、经营问题等可操作事项"
      }),

    entityCarousel:
      Object.freeze({
        id: "entity-carousel",
        role:
          "门店等可变数量实体的横向浏览"
      }),

    entityCard:
      Object.freeze({
        id: "entity-card",
        role:
          "门店等实体摘要卡"
      }),

    dataList:
      Object.freeze({
        id: "data-list",
        role:
          "员工等高密度可搜索列表"
      }),

    listRow:
      Object.freeze({
        id: "list-row",
        role:
          "高密度实体列表单行"
      }),

    mapViewport:
      Object.freeze({
        id: "map-viewport",
        role:
          "城市页独占的可交互地图主视觉"
      }),

    mapFilterBar:
      Object.freeze({
        id: "map-filter-bar",
        role:
          "城市商圈状态筛选"
      }),

    detailSheet:
      Object.freeze({
        id: "detail-sheet",
        role:
          "城市当前商圈详情与机会"
      }),

    promoBanner:
      Object.freeze({
        id: "promo-banner",
        role:
          "更多页底部品牌/氛围横幅，非业务关键入口"
      })
  });

export {
  UI_V2_COMPONENT_CATALOG
};
