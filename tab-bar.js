(function() {
  const tabs = [
    { icon: '🍽️', label: '菜单', href: 'menu.html' },
    { icon: '💫', label: '心愿', href: 'wishlist.html' },
    { icon: '🌱', label: '爱情树', href: 'tree.html' },
    { icon: '💌', label: '留言', href: 'message.html' },
    { icon: '📋', label: '记录', href: 'orders.html' },
    { icon: '🏆', label: '成就', href: 'achievements.html' },
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
      transition: all 0.2s; padding: 4px 0;
    }
    .tab-item-icon { font-size: 22px; }
    .tab-item-label { font-size: 10px; color: #999; }
    .tab-item.active .tab-item-label { color: #43a047; font-weight: 600; }
    .tab-item:active { transform: scale(0.9); }
    body { padding-bottom: 70px !important; }
  `;
  document.head.appendChild(style);

  const bar = document.createElement('div');
  bar.className = 'tab-bar';
  bar.innerHTML = tabs.map(tab => {
    const isActive = current === tab.href;
    return '<a class="tab-item' + (isActive ? ' active' : '') + '" href="' + tab.href + '">' +
      '<span class="tab-item-icon">' + tab.icon + '</span>' +
      '<span class="tab-item-label">' + tab.label + '</span>' +
    '</a>';
  }).join('');
  document.body.appendChild(bar);
})();
