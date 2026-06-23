// ====== 菜品数据 ======
const dishData = {
  yuanye: {
    emoji: '🍵',
    name: '原叶糯米酸奶',
    subtitle: '茶底饮品 · 冷饮',
    tags: ['清爽', '有嚼劲', '茶香'],
    taste: '淡淡的茶香打底，酸奶顺滑浓郁，糯米粒QQ弹弹的，嚼起来有满足感。清爽不腻，喝完会想再来一杯。',
    addedAt: '2025-06-23',
  },
  mangguo: {
    emoji: '🥭',
    name: '芒果糯米酸奶',
    subtitle: '水果饮品 · 冷饮',
    tags: ['甜蜜', '热带风', '层次丰富'],
    taste: '芒果的甜是那种热带阳光的味道，配上酸奶的微酸刚刚好。糯米吸满了果香，每一口都是层次感。甜而不齁，夏天必备。',
    addedAt: '2025-06-23',
  },
  huanggua: {
    emoji: '🥒',
    name: '黄瓜冰浆',
    subtitle: '自创特饮 · 冷饮',
    tags: ['清香', '冰爽', '小甜蜜'],
    taste: '黄瓜的清香，冰沙的口感，小布丁的甜味。三种味道交织在一起，清清爽爽又带点小甜蜜。夏天喝一口整个人都凉下来了。',
    addedAt: '2025-06-23',
  },
  kele: {
    emoji: '🍗',
    name: '可乐鸡翅',
    subtitle: '肉菜 · 甜口',
    tags: ['甜咸', '嫩滑', '焦糖色'],
    taste: '外皮微焦带着可乐的焦糖色，咬一口甜咸交融，肉嫩得脱骨。最后收汁裹在表面，亮晶晶的超有食欲。连骨头都想嗦一嗦。',
    addedAt: '2025-06-23',
  },
  tudou: {
    emoji: '🥔',
    name: '酸辣土豆丝',
    subtitle: '素菜 · 酸辣口',
    tags: ['脆爽', '开胃', '下饭'],
    taste: '切得细细的，过了冷水所以特别脆。醋的酸、辣椒的辣、花椒的麻，每一口都开胃。米饭杀手级别，不小心会多吃两碗。',
    addedAt: '2025-06-23',
  },
  fanqie: {
    emoji: '🍅',
    name: '西红柿炒鸡蛋',
    subtitle: '家常菜 · 酸甜口',
    tags: ['经典', '嫩滑', '治愈'],
    taste: '西红柿炒出沙沙的口感，酸甜的汤汁包裹着嫩滑的鸡蛋。家常味道，吃一口就觉得安心。拌饭绝了，汤汁一滴都不想剩。',
    addedAt: '2025-06-23',
  },
  jizhen: {
    emoji: '🫚',
    name: '辣炒鸡胗',
    subtitle: '硬菜 · 辣口',
    tags: ['嘎嘣脆', '越嚼越香', '有后劲'],
    taste: '嘎嘣脆的口感，越嚼越香。辣味是那种慢慢上来的后劲，配上青椒的清香，特别适合当下酒菜或者配饭吃。吃完嘴巴辣辣的很过瘾。',
    addedAt: '2025-06-23',
  }
};

// 判断是否是新品（3天内）
function isNewDish(key) {
  const dish = dishData[key];
  if (!dish || !dish.addedAt) return false;
  const added = new Date(dish.addedAt).getTime();
  const now = Date.now();
  return (now - added) < 3 * 24 * 60 * 60 * 1000;
}

// ====== localStorage 工具 ======
const Store = {
  get(key, fallback) {
    try {
      const v = localStorage.getItem('bingbing_' + key);
      return v ? JSON.parse(v) : fallback;
    } catch { return fallback; }
  },
  set(key, value) {
    localStorage.setItem('bingbing_' + key, JSON.stringify(value));
  }
};

// ====== 统计 & 成就 ======
const ACHIEVEMENTS = [
  { id: 'first_order', emoji: '🎯', name: '首次点单', desc: '完成第一次点单' },
  { id: 'streak_3', emoji: '🔥', name: '连续点单', desc: '连续3天点单' },
  { id: 'select_all', emoji: '👑', name: '全选达人', desc: '一次全选所有菜品' },
  { id: 'wishlist_done', emoji: '💫', name: '心愿实现', desc: '第一个心愿菜品上线' },
  { id: 'msg_10', emoji: '📝', name: '留言达人', desc: '留言超过10条' },
  { id: 'random_5', emoji: '🎲', name: '随缘吃货', desc: '使用随机推荐5次' },
];

function getStats() {
  return Store.get('stats', {
    orderCount: 0,
    lastOrderDate: '',
    consecutiveDays: 0,
    randomCount: 0,
  });
}

function saveStats(stats) {
  Store.set('stats', stats);
}

function getUnlockedAchievements() {
  return Store.get('achievements', []);
}

function unlockAchievement(id) {
  const unlocked = getUnlockedAchievements();
  if (unlocked.includes(id)) return false;
  unlocked.push(id);
  Store.set('achievements', unlocked);
  showAchievementToast(id);
  return true;
}

function showAchievementToast(id) {
  const ach = ACHIEVEMENTS.find(a => a.id === id);
  if (!ach) return;
  const toast = document.createElement('div');
  toast.style.cssText = 'position:fixed;top:60px;left:50%;transform:translateX(-50%);background:white;border-radius:14px;padding:12px 20px;box-shadow:0 4px 20px rgba(0,0,0,0.12);z-index:999;display:flex;align-items:center;gap:8px;font-size:14px;animation:slideUp 0.4s ease;';
  toast.innerHTML = '<span style="font-size:20px">' + ach.emoji + '</span><span>成就解锁：<b>' + ach.name + '</b></span>';
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

function checkAchievements(action) {
  const stats = getStats();
  const unlocked = getUnlockedAchievements();

  if (action === 'order') {
    if (!unlocked.includes('first_order')) unlockAchievement('first_order');
    const today = new Date().toDateString();
    if (stats.lastOrderDate !== today) {
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      stats.consecutiveDays = (stats.lastOrderDate === yesterday) ? stats.consecutiveDays + 1 : 1;
      stats.lastOrderDate = today;
      stats.orderCount++;
      saveStats(stats);
    }
    if (stats.consecutiveDays >= 3 && !unlocked.includes('streak_3')) unlockAchievement('streak_3');
  }

  if (action === 'select_all') {
    if (!unlocked.includes('select_all')) unlockAchievement('select_all');
  }

  if (action === 'random') {
    stats.randomCount = (stats.randomCount || 0) + 1;
    saveStats(stats);
    if (stats.randomCount >= 5 && !unlocked.includes('random_5')) unlockAchievement('random_5');
  }

  if (action === 'message') {
    const msgs = Store.get('messages', []);
    if (msgs.length >= 10 && !unlocked.includes('msg_10')) unlockAchievement('msg_10');
  }

  if (action === 'wishlist_done') {
    if (!unlocked.includes('wishlist_done')) unlockAchievement('wishlist_done');
  }
}

// ====== 通知推送 ======
const FEISHU_WEBHOOK = 'https://open.feishu.cn/open-apis/bot/v2/hook/af76aa3f-1c13-4b1f-903e-eb9deb174946';

function sendNotification(text) {
  if (!FEISHU_WEBHOOK) return;
  const now = new Date();
  const time = (now.getMonth() + 1) + '/' + now.getDate() + ' ' +
    now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0') + ':' + now.getSeconds().toString().padStart(2, '0');
  const msg = text + '\n⏰ ' + time;
  console.log('[通知] 发送:', msg);
  const data = JSON.stringify({ msg_type: 'text', content: { text: msg } });
  const blob = new Blob([data], { type: 'text/plain' });
  navigator.sendBeacon(FEISHU_WEBHOOK, blob);
}

// ====== 时间问候 ======
function getGreeting() {
  const h = new Date().getHours();
  if (h < 6) return '夜深了，想吃点什么宵夜？';
  if (h < 11) return '早上好~今天想吃点什么？';
  if (h < 14) return '中午好~来看看菜单吧';
  if (h < 18) return '下午好~来杯饮品？';
  return '晚上好~今晚想吃什么？';
}

// ====== 访问记录 ======
function getVisitorId() {
  let id = Store.get('visitorId', null);
  if (!id) {
    id = 'V' + Math.random().toString(36).slice(2, 8).toUpperCase();
    Store.set('visitorId', id);
  }
  return id;
}

function trackVisit() {
  if (!FEISHU_WEBHOOK) return;

  const ua = navigator.userAgent;
  let device = '其他';
  let osVersion = '';
  let browser = '';

  if (/iPhone|iPad|iPod/i.test(ua)) {
    device = 'iPhone';
    const m = ua.match(/OS (\d+[_\.]\d+)/);
    if (m) osVersion = 'iOS ' + m[1].replace('_', '.');
  } else if (/Android/i.test(ua)) {
    device = 'Android';
    const m = ua.match(/Android ([\d.]+)/);
    if (m) osVersion = 'Android ' + m[1];
  } else if (/Macintosh/i.test(ua)) {
    device = 'Mac';
    const m = ua.match(/Mac OS X ([\d_]+)/);
    if (m) osVersion = 'macOS ' + m[1].replace(/_/g, '.');
  } else if (/Windows/i.test(ua)) {
    device = 'Windows';
  }

  if (/MicroMessenger/i.test(ua)) browser = '微信';
  else if (/QQ\//i.test(ua)) browser = 'QQ';
  else if (/CriOS/i.test(ua)) browser = 'Chrome';
  else if (/FxiOS/i.test(ua)) browser = 'Firefox';
  else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) browser = 'Safari';
  else if (/Chrome/i.test(ua)) browser = 'Chrome';
  else browser = '浏览器';

  const isReturning = Store.get('visitedBefore', false);
  Store.set('visitedBefore', true);

  const now = new Date();
  const time = (now.getMonth() + 1) + '/' + now.getDate() + ' ' +
    now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0') + ':' + now.getSeconds().toString().padStart(2, '0');

  const deviceInfo = device + (osVersion ? ' · ' + osVersion : '') + ' · ' + browser;

  sendNotification(
    '👀 有人来访\n访客：' + getVisitorId() + (isReturning ? '（老访客）' : '（新访客）') +
    '\n设备：' + deviceInfo +
    '\n页面：' + (document.title || location.pathname)
  );
}

trackVisit();

// ====== 页面停留时长 ======
const _pageEnterTime = Date.now();

function trackLeave() {
  const duration = Math.round((Date.now() - _pageEnterTime) / 1000);
  if (duration < 3) return;
  const min = Math.floor(duration / 60);
  const sec = duration % 60;
  const durationStr = min > 0 ? min + '分' + sec + '秒' : sec + '秒';
  sendNotification(
    '📊 页面停留\n访客：' + getVisitorId() +
    '\n页面：' + (document.title || location.pathname) +
    '\n停留：' + durationStr
  );
}

document.addEventListener('pagehide', trackLeave);
document.addEventListener('visibilitychange', function() {
  if (document.visibilityState === 'hidden') trackLeave();
});
