# 🧊🧊女王的专属小馆

专属于我们的小空间 ✨

## 功能

- 🎁 猜谜游戏（首次访问触发）
- 🍽️ 菜单点单 + 随机推荐
- ⭐ 菜品评分
- 💫 许愿池（心愿菜单）
- 📌 留言板（便利贴墙）
- 🏆 成就系统
- 🔔 飞书通知（点单/许愿/留言实时推送）
- 👀 访问埋点

## 文件结构

```
├── index.html          猜谜入口
├── menu.html           菜单主页
├── wishlist.html       许愿池
├── message.html        留言板
├── achievements.html   成就
├── style.css           共享样式
└── app.js              共享逻辑 + 数据
```

## 加新菜

在 `app.js` 的 `dishData` 里加一条，`menu.html` 里加对应的 HTML 卡片，push 即可。`addedAt` 设为当天日期，3天内自动显示 NEW 角标。
