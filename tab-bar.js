(function() {
  const tabs = [
    { icon: '🍽️', label: '菜单', href: 'menu.html', tab: 'menu' },
    { icon: '💫', label: '心愿', href: 'wishlist.html', tab: 'wishlist' },
    { icon: '🐱', label: '喵喵', href: 'tree.html', tab: 'tree' },
    { icon: '💌', label: '留言', href: 'message.html', tab: 'message' },
    { icon: '📋', label: '记录', href: 'orders.html', tab: 'orders' },
    { icon: '🏆', label: '成就', href: 'achievements.html', tab: 'achievements' },
  ];

  const current = location.pathname.split('/').pop() || 'menu.html';

  const style = document.createElement('style');
  style.textContent = `
    .tab-bar {
      position: fixed; bottom: 0; left: 0; width: 100%;
      height: 56px; background: white;
      border-top: 1px solid rgba(0,0,0,0.06);
      display: flex; align-items: center; justify-content: space-around;
      padding-bottom: env(safe-area-inset-bottom, 0);
      z-index: 100; box-shadow: 0 -2px 10px rgba(0,0,0,0.04);
    }
    .tab-item {
      display: flex; flex-direction: column; align-items: center;
      gap: 2px; text-decoration: none; cursor: pointer;
      transition: all 0.2s; padding: 4px 0; position: relative;
    }
    .tab-item-icon { font-size: 22px; }
    .tab-item-label { font-size: 10px; color: #999; }
    .tab-item.active .tab-item-label { color: #43a047; font-weight: 600; }
    .tab-item:active { transform: scale(0.9); }
    .tab-badge {
      position: absolute; top: -2px; right: -8px;
      min-width: 16px; height: 16px; border-radius: 8px;
      background: #f44336; border: 1px solid white;
      font-size: 10px; color: white; font-weight: 600;
      display: flex; align-items: center; justify-content: center;
      padding: 0 4px; box-sizing: border-box;
    }
    body { padding-bottom: 70px !important; }
  `;
  document.head.appendChild(style);

  const bar = document.createElement('div');
  bar.className = 'tab-bar';
  bar.innerHTML = tabs.map(tab => {
    const isActive = current === tab.href;
    return '<a class="tab-item' + (isActive ? ' active' : '') + '" href="' + tab.href + '" data-tab="' + tab.tab + '">' +
      '<span class="tab-item-icon">' + tab.icon + '</span>' +
      '<span class="tab-item-label">' + tab.label + '</span>' +
    '</a>';
  }).join('');
  document.body.appendChild(bar);

  // 未读小红点
  var SB_URL = 'https://ovjlremcavbqkcnejvit.supabase.co';
  var SB_HEADERS = { 'apikey': 'sb_publishable_jckCjiypg2K_1YFRam5bDw_3qv4ESS8', 'Authorization': 'Bearer sb_publishable_jckCjiypg2K_1YFRam5bDw_3qv4ESS8', 'Content-Type': 'application/json' };
  var user = localStorage.getItem('bingbing_user_id');
  if (user) {
    // 查询未读
    fetch(SB_URL + '/rest/v1/unread?user=eq.' + user + '&count=gt.0', { headers: SB_HEADERS })
      .then(function(r) { return r.json(); })
      .then(function(data) {
        data.forEach(function(d) {
          var tabEl = bar.querySelector('[data-tab="' + d.tab + '"]');
          if (tabEl && !tabEl.classList.contains('active')) {
            var badge = document.createElement('span');
            badge.className = 'tab-badge';
            badge.textContent = d.count > 99 ? '99+' : d.count;
            tabEl.appendChild(badge);
          }
        });
      }).catch(function() {});

    // 当前页清零
    var currentTab = tabs.find(function(t) { return t.href === current; });
    if (currentTab) {
      fetch(SB_URL + '/rest/v1/unread?user=eq.' + user + '&tab=eq.' + currentTab.tab, {
        method: 'PATCH', headers: SB_HEADERS,
        body: JSON.stringify({ count: 0 })
      }).catch(function() {});
    }
  }

  // 加载悬浮小助手
  var chatScript = document.createElement('script');
  chatScript.src = 'chat-widget.js';
  document.body.appendChild(chatScript);
})();
