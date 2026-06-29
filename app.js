// ====== 菜品数据 ======
let dishData = {};

async function loadDishData() {
  const res = await fetch(SUPABASE_URL + '/rest/v1/dishes?order=id.asc', { headers: supabaseHeaders });
  if (!res.ok) return;
  const dishes = await res.json();
  dishData = {};
  dishes.forEach(d => {
    const key = d.key || ('dish_' + d.id);
    dishData[key] = {
      id: d.id,
      emoji: d.emoji,
      name: d.name,
      subtitle: d.subtitle || '',
      tags: d.tags || [],
      taste: d.taste || '',
      category: d.category || '菜品',
      addedAt: d.added_at,
      fromWish: d.from_wish || false,
    };
  });
}

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
  { id: 'streak_7', emoji: '💪', name: '铁杆吃货', desc: '连续7天点单' },
  { id: 'order_10', emoji: '🏅', name: '十单元老', desc: '累计点单10次' },
  { id: 'msg_30', emoji: '💬', name: '话痨本痨', desc: '留言超过30条' },
  { id: 'wishlist_5', emoji: '🌟', name: '许愿达人', desc: '许了5个愿望' },
  { id: 'review_10', emoji: '🍽️', name: '美食评论家', desc: '评价10次' },
  { id: 'all_good', emoji: '⭐', name: '全五星好评', desc: '给所有菜品好评' },
  { id: 'night_owl', emoji: '🌙', name: '夜猫子', desc: '凌晨0-5点互动一次' },
  { id: 'cat_full', emoji: '🐱', name: '猫猫满血', desc: '猫三项属性都达到100' },
  { id: 'duo_day', emoji: '💕', name: '双人互动', desc: '两人同一天都留言' },
];

async function getUnlockedAchievements() {
  if (typeof SUPABASE_URL === 'undefined' || typeof User === 'undefined') return [];
  const user = User.get();
  if (!user) return [];
  const res = await fetch(SUPABASE_URL + '/rest/v1/achievements?user=eq.' + user + '&select=achievement_id', { headers: supabaseHeaders });
  if (!res.ok) return [];
  const data = await res.json();
  return [...new Set(data.map(d => d.achievement_id))];
}

async function unlockAchievement(id) {
  const unlocked = await getUnlockedAchievements();
  if (unlocked.includes(id)) return false;
  showAchievementToast(id);
  if (typeof DB !== 'undefined' && typeof User !== 'undefined' && User.get()) {
    await DB.insert('achievements', { achievement_id: id, user: User.get(), unlocked_at: Date.now() });
  }
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

async function checkAchievements(action) {
  const unlocked = await getUnlockedAchievements();
  const hour = new Date().getHours();

  // 夜猫子: 凌晨0-5点任何互动
  if (!unlocked.includes('night_owl') && hour >= 0 && hour < 5) {
    await unlockAchievement('night_owl');
  }

  if (action === 'order') {
    if (!unlocked.includes('first_order')) await unlockAchievement('first_order');
    if (!unlocked.includes('streak_3') || !unlocked.includes('streak_7')) {
      const streak = await getOrderStreak();
      if (streak >= 3 && !unlocked.includes('streak_3')) await unlockAchievement('streak_3');
      if (streak >= 7 && !unlocked.includes('streak_7')) await unlockAchievement('streak_7');
    }
    if (!unlocked.includes('order_10')) {
      const count = await getOrderCount();
      if (count >= 10) await unlockAchievement('order_10');
    }
  }

  if (action === 'select_all') {
    if (!unlocked.includes('select_all')) await unlockAchievement('select_all');
  }

  if (action === 'random') {
    if (!unlocked.includes('random_5')) {
      const count = await getInteractionCount('random');
      if (count >= 5) await unlockAchievement('random_5');
    }
  }

  if (action === 'message' || action === 'reply') {
    if (!unlocked.includes('msg_10')) {
      const count = await getMessageCount();
      if (count >= 10) await unlockAchievement('msg_10');
    }
    if (!unlocked.includes('msg_30')) {
      const count = await getMessageCount();
      if (count >= 30) await unlockAchievement('msg_30');
    }
    // 双人互动: 两人同一天都留言
    if (!unlocked.includes('duo_day')) {
      const hasDuo = await checkDuoDay();
      if (hasDuo) await unlockAchievement('duo_day');
    }
  }

  if (action === 'review') {
    if (!unlocked.includes('review_10')) {
      const count = await getReviewCount();
      if (count >= 10) await unlockAchievement('review_10');
    }
    if (!unlocked.includes('all_good')) {
      const allGood = await checkAllGood();
      if (allGood) await unlockAchievement('all_good');
    }
  }

  if (action === 'wishlist') {
    if (!unlocked.includes('wishlist_5')) {
      const count = await getInteractionCount('wishlist');
      if (count >= 5) await unlockAchievement('wishlist_5');
    }
  }

  if (action === 'wishlist_done') {
    if (!unlocked.includes('wishlist_done')) await unlockAchievement('wishlist_done');
  }

  // 猫猫满血: 检查猫属性
  if (action === 'feed_cat') {
    if (!unlocked.includes('cat_full')) {
      const full = await checkCatFull();
      if (full) await unlockAchievement('cat_full');
    }
  }
}

async function getOrderStreak() {
  if (typeof SUPABASE_URL === 'undefined') return 0;
  const user = User.get();
  if (!user) return 0;
  const res = await fetch(SUPABASE_URL + '/rest/v1/orders?user=eq.' + user + '&order=eat_date.desc', { headers: supabaseHeaders });
  if (!res.ok) return 0;
  const orders = await res.json();
  if (orders.length === 0) return 0;
  const dates = [...new Set(orders.map(o => o.eat_date))].sort().reverse();
  let streak = 1;
  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1]);
    const curr = new Date(dates[i]);
    const diff = (prev - curr) / (24 * 60 * 60 * 1000);
    if (diff === 1) streak++;
    else break;
  }
  return streak;
}

async function getMessageCount() {
  if (typeof SUPABASE_URL === 'undefined') return 0;
  const user = User.get();
  if (!user) return 0;
  const [msgRes, replyRes] = await Promise.all([
    fetch(SUPABASE_URL + '/rest/v1/messages?user=eq.' + user + '&select=id', { headers: supabaseHeaders }),
    fetch(SUPABASE_URL + '/rest/v1/replies?user=eq.' + user + '&target_table=eq.messages&select=id', { headers: supabaseHeaders })
  ]);
  const msgs = msgRes.ok ? await msgRes.json() : [];
  const replies = replyRes.ok ? await replyRes.json() : [];
  return msgs.length + replies.length;
}

async function getInteractionCount(action) {
  if (typeof SUPABASE_URL === 'undefined') return 0;
  const user = User.get();
  if (!user) return 0;
  const res = await fetch(SUPABASE_URL + '/rest/v1/interactions?user=eq.' + user + '&action=eq.' + action + '&select=id', { headers: supabaseHeaders });
  if (!res.ok) return 0;
  const data = await res.json();
  return data.length;
}

async function getReviewCount() {
  if (typeof SUPABASE_URL === 'undefined') return 0;
  const user = User.get();
  if (!user) return 0;
  const res = await fetch(SUPABASE_URL + '/rest/v1/replies?user=eq.' + user + '&target_table=eq.orders&select=id', { headers: supabaseHeaders });
  if (!res.ok) return 0;
  const data = await res.json();
  return data.length;
}

async function getOrderCount() {
  if (typeof SUPABASE_URL === 'undefined') return 0;
  const user = User.get();
  if (!user) return 0;
  const res = await fetch(SUPABASE_URL + '/rest/v1/orders?user=eq.' + user + '&select=id', { headers: supabaseHeaders });
  if (!res.ok) return 0;
  const data = await res.json();
  return data.length;
}

async function checkDuoDay() {
  if (typeof SUPABASE_URL === 'undefined') return false;
  const today = new Date().toISOString().split('T')[0];
  const startOfDay = new Date(today).getTime();
  const endOfDay = startOfDay + 86400000;
  const [res1, res2] = await Promise.all([
    fetch(SUPABASE_URL + '/rest/v1/messages?user=eq.bingbing&time=gte.' + startOfDay + '&time=lt.' + endOfDay + '&select=id&limit=1', { headers: supabaseHeaders }),
    fetch(SUPABASE_URL + '/rest/v1/messages?user=eq.jiaxi&time=gte.' + startOfDay + '&time=lt.' + endOfDay + '&select=id&limit=1', { headers: supabaseHeaders })
  ]);
  const d1 = res1.ok ? await res1.json() : [];
  const d2 = res2.ok ? await res2.json() : [];
  if (d1.length > 0 && d2.length > 0) return true;
  const [r1, r2] = await Promise.all([
    fetch(SUPABASE_URL + '/rest/v1/replies?user=eq.bingbing&target_table=eq.messages&time=gte.' + startOfDay + '&time=lt.' + endOfDay + '&select=id&limit=1', { headers: supabaseHeaders }),
    fetch(SUPABASE_URL + '/rest/v1/replies?user=eq.jiaxi&target_table=eq.messages&time=gte.' + startOfDay + '&time=lt.' + endOfDay + '&select=id&limit=1', { headers: supabaseHeaders })
  ]);
  const rd1 = r1.ok ? await r1.json() : [];
  const rd2 = r2.ok ? await r2.json() : [];
  return (d1.length > 0 || rd1.length > 0) && (d2.length > 0 || rd2.length > 0);
}

async function checkAllGood() {
  const ratings = Store.get('dish_ratings', {});
  const allDishes = Object.keys(dishData);
  return allDishes.length > 0 && allDishes.every(key => ratings[dishData[key].name] === 'good');
}

async function checkCatFull() {
  if (typeof SUPABASE_URL === 'undefined') return false;
  const res = await fetch(SUPABASE_URL + '/rest/v1/pet_status?id=eq.1', { headers: supabaseHeaders });
  if (!res.ok) return false;
  const data = await res.json();
  if (!data.length) return false;
  const s = data[0];
  return s.hunger >= 100 && s.water >= 100 && s.happiness >= 100;
}

// ====== 通知推送 ======
const FEISHU_WEBHOOK = 'https://open.feishu.cn/open-apis/bot/v2/hook/af76aa3f-1c13-4b1f-903e-eb9deb174946';

function sendNotification(text) {
  if (!FEISHU_WEBHOOK) return;
  const now = new Date();
  const time = (now.getMonth() + 1) + '/' + now.getDate() + ' ' +
    now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0') + ':' + now.getSeconds().toString().padStart(2, '0');
  const msg = text + '\n🕐 触发时间：' + time;
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
