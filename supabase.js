const SUPABASE_URL = 'https://ovjlremcavbqkcnejvit.supabase.co';
const SUPABASE_KEY = 'sb_publishable_jckCjiypg2K_1YFRam5bDw_3qv4ESS8';

const supabaseHeaders = {
  'apikey': SUPABASE_KEY,
  'Authorization': 'Bearer ' + SUPABASE_KEY,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation'
};

// 用户身份管理
const User = {
  get() {
    return localStorage.getItem('bingbing_user_id');
  },
  set(name) {
    localStorage.setItem('bingbing_user_id', name);
  },
  getViewUser() {
    const params = new URLSearchParams(location.search);
    return params.get('view') || this.get();
  },
  isViewMode() {
    const params = new URLSearchParams(location.search);
    const view = params.get('view');
    return view && view !== this.get();
  }
};

// 首次需要写入时才选择身份
function showIdentityPicker() {
  if (User.get()) return Promise.resolve(User.get());
  return new Promise(resolve => {
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.4);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);z-index:9999;display:flex;align-items:center;justify-content:center;animation:fadeIn 0.3s ease;';
    overlay.innerHTML = '<div style="background:white;border-radius:24px;padding:36px 28px;text-align:center;width:85%;max-width:320px;box-shadow:0 20px 60px rgba(0,0,0,0.15);animation:scaleIn 0.3s cubic-bezier(0.68,-0.3,0.265,1.2)">' +
      '<div style="font-size:18px;font-weight:700;color:#333;margin-bottom:8px">🧊🧊的专属小馆</div>' +
      '<div style="font-size:13px;color:#aaa;margin-bottom:24px">请选择你的身份</div>' +
      '<div style="display:flex;gap:12px;justify-content:center">' +
        '<button onclick="pickUser(\'bingbing\')" style="flex:1;padding:16px 12px;border:2px solid #e8f5e9;border-radius:16px;background:white;cursor:pointer;transition:all 0.2s">' +
          '<div style="font-size:32px;margin-bottom:8px">🧊</div>' +
          '<div style="font-size:14px;font-weight:600;color:#333">🧊🧊女王</div>' +
        '</button>' +
        '<button onclick="pickUser(\'jiaxi\')" style="flex:1;padding:16px 12px;border:2px solid #e3f2fd;border-radius:16px;background:white;cursor:pointer;transition:all 0.2s">' +
          '<div style="font-size:32px;margin-bottom:8px">👨‍🍳</div>' +
          '<div style="font-size:14px;font-weight:600;color:#333">家希</div>' +
        '</button>' +
      '</div>' +
      '</div>';
    const style = document.createElement('style');
    style.textContent = '@keyframes fadeIn{from{opacity:0}to{opacity:1}}@keyframes scaleIn{from{opacity:0;transform:scale(0.8)}to{opacity:1;transform:scale(1)}}';
    document.head.appendChild(style);
    document.body.appendChild(overlay);
    window.pickUser = function(name) {
      User.set(name);
      overlay.style.opacity = '0';
      overlay.style.transition = 'opacity 0.2s';
      setTimeout(() => { overlay.remove(); style.remove(); }, 200);
      resolve(name);
    };
  });
}

// 确保有身份才写入
async function ensureUser() {
  if (!User.get()) await showIdentityPicker();
  return User.get();
}

const DB = {
  async getAll(table, order) {
    const user = User.getViewUser();
    const orderParam = order || 'time.desc';
    let url = SUPABASE_URL + '/rest/v1/' + table + '?order=' + orderParam;
    if (user) url += '&user=eq.' + user;
    const res = await fetch(url, { headers: supabaseHeaders });
    if (!res.ok) return [];
    return res.json();
  },

  async insert(table, data) {
    const user = User.get();
    if (user) data.user = user;
    const res = await fetch(SUPABASE_URL + '/rest/v1/' + table, {
      method: 'POST',
      headers: supabaseHeaders,
      body: JSON.stringify(data)
    });
    if (!res.ok) return null;
    const result = await res.json();
    return result[0] || null;
  },

  async update(table, id, data) {
    const res = await fetch(SUPABASE_URL + '/rest/v1/' + table + '?id=eq.' + id, {
      method: 'PATCH',
      headers: supabaseHeaders,
      body: JSON.stringify(data)
    });
    if (!res.ok) return null;
    const result = await res.json();
    return result[0] || null;
  },

  async delete(table, id) {
    const res = await fetch(SUPABASE_URL + '/rest/v1/' + table + '?id=eq.' + id, {
      method: 'DELETE',
      headers: supabaseHeaders
    });
    return res.ok;
  }
};

// 互动成长值
const GROWTH_VALUES = {
  message: 1,
  wishlist: 2,
  order: 3,
  review: 1,
  wish_done: 5,
  reply: 1
};

function trackInteraction(action) {
  const value = GROWTH_VALUES[action] || 1;
  const user = User.get();
  if (!user) return;
  DB.insert('interactions', { user: user, action: action, points: value, time: Date.now() });
}
