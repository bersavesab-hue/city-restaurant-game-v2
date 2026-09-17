function money(value) {
  return (
    "¥" +
    Math.round(
      Number(value ?? 0)
    ).toLocaleString(
      "zh-CN"
    )
  );
}

function bottleneckName(id) {
  return {
    kitchen: "厨房",
    seating: "桌位",
    service: "前厅服务"
  }[id] ?? "暂无";
}

class CapacityManagementView {
  renderMarkup(page) {
    return `
      <section class="capacity-page">
        <header>
          <span>门店运营效率</span>
          <h1>产能与排队</h1>
        </header>

        <section class="capacity-kpis">
          <article>
            <span>桌位小时产能</span>
            <strong>
              ${page.capacity.seatingGuests}人
            </strong>
          </article>

          <article>
            <span>厨房小时产能</span>
            <strong>
              ${page.capacity.kitchenGuests}份
            </strong>
          </article>

          <article>
            <span>前厅小时产能</span>
            <strong>
              ${page.capacity.serviceGuests}人
            </strong>
          </article>

          <article>
            <span>主要瓶颈</span>
            <strong>
              ${bottleneckName(
                page.dominantBottleneck
              )}
            </strong>
          </article>
        </section>

        <section>
          <h2>门店配置</h2>

          <p>
            ${page.config.tables}张桌
            ·
            ${page.config.seats}个座位
          </p>

          <p>
            平均用餐
            ${page.config.averageMealMinutes}分钟
          </p>

          <p>
            厨房
            ${page.config.kitchenStations}个工作位
          </p>

          <p>
            顾客耐心
            ${page.config.queueToleranceMinutes}分钟
          </p>
        </section>

        <section>
          <h2>近7天排队表现</h2>

          <article>
            <span>到店</span>
            <strong>
              ${page.last7Days.arrivals}
            </strong>
          </article>

          <article>
            <span>完成接待</span>
            <strong>
              ${page.last7Days.served}
            </strong>
          </article>

          <article>
            <span>接待率</span>
            <strong>
              ${page.last7Days.serviceRate}%
            </strong>
          </article>

          <article>
            <span>弃单</span>
            <strong>
              ${page.last7Days.abandoned}
            </strong>
          </article>

          <article>
            <span>平均等待</span>
            <strong>
              ${page.last7Days.averageWaitMinutes}分钟
            </strong>
          </article>

          <article>
            <span>流失营业额</span>
            <strong>
              ${money(
                page.last7Days
                  .lostRevenue
              )}
            </strong>
          </article>
        </section>

        <section>
          <h2>瓶颈次数</h2>

          <p>
            厨房
            ${page.bottlenecks.kitchen}
          </p>

          <p>
            桌位
            ${page.bottlenecks.seating}
          </p>

          <p>
            前厅服务
            ${page.bottlenecks.service}
          </p>
        </section>
      </section>
    `;
  }
}

export const capacityManagementView =
  new CapacityManagementView();

export {
  CapacityManagementView
};
