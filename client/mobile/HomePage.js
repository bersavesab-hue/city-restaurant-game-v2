const W = 864, H = 1536;
const esc = value => String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
const box = (x,y,w,h) => `left:${x/W*100}%;top:${y/H*100}%;width:${w/W*100}%;height:${h/H*100}%`;
const money = value => `¥ ${Math.round(Number(value)||0).toLocaleString("zh-CN")}`;
const trend = value => { const n=Math.round(Number(value)||0); return n>0?`▲ +${n}%`:n<0?`▼ ${n}%`:"— 0%"; };
const art = (name,x,y,w,h) => `<img class="home-art" style="${box(x,y,w,h)}" src="assets/home/${name}.png" alt="">`;
const metric = (x,w,icon,label,value,sub,route) => `<button class="home-metric home-card" style="${box(x,582,w,126)}" data-nav="${route}" type="button"><span class="home-metric-icon">${icon}</span><span>${label}</span><strong>${esc(value)}</strong><small>${esc(sub)}</small></button>`;

function renderHomePage(model) {
  const r=model?.restaurant??{}, t=model?.time??{}, m=model?.money??{}, o=model?.operations??{};
  const p=model?.progress??{}, d=model?.district??{}, chance=model?.opportunity??{};
  const growth=Math.max(0,Math.min(100,Math.round((Number(p.progress)||0)*100)));
  const actionTarget=/员工/.test(chance.action??"")?"staff":/财务/.test(chance.action??"")?"more":"business";
  const dialogs=(model?.dialogue??[]).slice(0,2), tasks=(model?.schedule??[]).slice(0,4);
  const signal=n=>(Number(n)||0)>=75?"较高":(Number(n)||0)>=55?"中等":"较低";
  return `<section class="home-editor-canvas" data-ui-component="home-page" data-layout-key="home-page" data-home-layout-version="layered-v1" aria-label="门店首页">
    ${art("scene-clean",0,0,864,582)}
    <div class="home-top home-date" style="${box(14,17,165,74)}"><span>☀️</span><strong>第${esc(t.day??1)}天</strong><small>经营日程</small></div>
    <div class="home-top" style="${box(184,18,145,63)}"><span>🕒</span><strong data-bind="clock">${esc(t.clock??"00:00")}</strong><small>${r.status==="open"?"● 营业中":"● 未营业"}</small></div>
    <div class="home-top" style="${box(334,18,186,64)}"><span>💵</span><small>资金</small><strong>${money(m.balance)}</strong></div>
    <div class="home-top" style="${box(525,17,118,65)}"><span>⭐</span><small>星级评价</small><strong>${Number(r.reviewScore??0).toFixed(1)}分</strong></div>
    <div class="home-top" style="${box(648,18,160,64)}"><span>👑</span><strong>Lv.${esc(r.level??1)}</strong><small>${esc(p.title??"门店")}</small><i style="width:${growth}%"></i></div>
    <button class="home-top home-settings" style="${box(811,18,49,61)}" type="button" data-nav="more" aria-label="设置">⚙</button>
    ${metric(14,212,"💰","今日营业额",money(m.todayRevenue),trend(m.revenueTrend),"business")}
    ${metric(231,200,"▂▅▇","今日利润",money(m.todayProfit),trend(m.profitTrend),"business")}
    ${metric(435,199,"☻","满意度",`${Math.round(Number(r.satisfaction)||0)}%`,"顾客反馈","business")}
    ${metric(638,212,"●●","在岗员工",o.employees??0,(o.employees??0)>=4?"工作正常":"查看排班 ›","staff")}

    <section class="home-opportunity home-card" style="${box(14,716,836,208)}">
      <img class="home-section-header" src="assets/home/opportunity-header.png" alt="今日机会">
      <button class="home-panel-more home-opportunity-more" type="button" data-nav="business" aria-label="查看商圈情报"></button>
      <p class="home-opportunity-text"><b>${esc(chance.title??"今日经营机会")}</b><br>${esc(chance.detail??"查看门店和商圈动态。")}</p>
      <div class="home-city"><img src="assets/home/city-skyline.png" alt=""><b>${esc(d.name??"商圈")}</b></div>
      <div class="home-tags">${(chance.tags??[]).slice(0,4).map(tag=>`<span>${esc(tag)}</span>`).join("")}</div>
      <button class="home-action" type="button" data-nav="${actionTarget}">${esc(chance.action??"去经营")} ❯</button>
    </section>
    <section class="home-growth home-card" style="${box(15,934,445,232)}">
      <img class="home-section-header" src="assets/home/growth-header.png" alt="门店成长">
      <strong class="home-growth-title">下一阶段：${esc(p.nextTitle??"继续经营")}</strong>
      <div class="home-progress"><i style="width:${growth}%"></i></div><b class="home-progress-number">${growth}%</b>
      <div class="home-growth-actions">
        <button type="button" data-open-sheet="renovation"><img src="assets/home/growth-renovation.png" alt="装修"></button>
        <button type="button" data-nav="staff"><img src="assets/home/growth-staff.png" alt="员工"></button>
        <button type="button" data-nav="research"><img src="assets/home/growth-research.png" alt="研发"></button>
        <button type="button" data-nav="business"><img src="assets/home/growth-business.png" alt="经营"></button>
      </div>
    </section>
    <section class="home-feed home-card" style="${box(468,934,382,232)}">
      <img class="home-section-header" src="assets/home/feed-header.png" alt="店内动态">
      <button class="home-panel-more" type="button" data-nav="staff" aria-label="更多店内动态"></button>
      ${dialogs.map(item=>`<div class="home-dialogue"><img src="assets/home/${item.role==="后厨"?"avatar-chef":"avatar-server"}.png" alt=""><div><strong>${esc(item.speaker)} <small>(${esc(item.role)})</small></strong><p>${esc(item.text)}</p></div><time>${esc(item.time)}</time></div>`).join("")}
    </section>
    <section class="home-market home-card" style="${box(15,1175,445,180)}">
      <img class="home-section-header" src="assets/home/market-header.png" alt="商圈情报">
      <button class="home-panel-more" type="button" data-nav="business" aria-label="更多商圈情报"></button>
      <div class="home-market-grid">
        <div><span>♨</span><b>本区热度</b><strong>${signal(d.trafficIndex)}</strong></div>
        <div><span>♟</span><b>主力客群</b><strong>${esc(d.mainCustomer??"待调查")}</strong></div>
        <div><span>🛵</span><b>外卖热度</b><strong>${signal(d.deliveryDemand)}</strong></div>
        <div><span>▂▅▇</span><b>竞争强度</b><strong>${signal(d.competition)}</strong></div>
      </div>
    </section>
    <section class="home-schedule home-card" style="${box(469,1175,381,180)}">
      <img class="home-section-header" src="assets/home/schedule-header.png" alt="今日日程">
      <button class="home-panel-more" type="button" data-nav="business" aria-label="更多日程"></button>
      <div class="home-schedule-rows">${tasks.map(item=>`<div class="${esc(item.status)}"><span>${item.status==="done"?"✓":item.status==="active"?"●":"+"}</span><time>${esc(item.time)}</time><b>${esc(item.title)}</b><strong>${item.status==="done"?"已完成":item.status==="active"?"进行中":"未开始"}</strong></div>`).join("")}</div>
    </section>
    <div class="home-bottom" style="${box(0,1362,864,174)}"><img src="assets/home/nav-home.png" alt=""></div>
    ${["store","business","research","staff","more"].map((id,i)=>`<button class="home-nav-hit" type="button" data-nav="${id}" style="${box(i*172,1362,i===4?176:172,130)}" aria-label="${["门店","经营","研发","员工","更多"][i]}"></button>`).join("")}
  </section>`;
}

export { renderHomePage };
