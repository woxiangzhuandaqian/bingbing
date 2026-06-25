(function() {
  const APP_ID = 'a75DgOHChJYhYKphmBmf3lFTNG8biNLb';
  const SECRET_KEY = 'wq1Nh7e0Q45k6YuRBDNki4wDWcrkTITp';
  const AGENT_API = 'https://agentapi.baidu.com/assistant/conversation';

  let threadId = '';
  let isSending = false;
  let isOpen = false;

  function getOpenId() {
    let id = localStorage.getItem('bingbing_chat_openid');
    if (!id) {
      id = 'user_' + Math.random().toString(36).slice(2, 12);
      localStorage.setItem('bingbing_chat_openid', id);
    }
    return id;
  }

  const style = document.createElement('style');
  style.textContent = `
    .chat-bubble {
      position: fixed; bottom: 80px; right: 20px; width: 50px; height: 50px;
      border-radius: 50%; background: linear-gradient(135deg, #66bb6a, #43a047);
      color: white; display: flex; align-items: center; justify-content: center;
      font-size: 24px; box-shadow: 0 4px 15px rgba(76,175,80,0.4);
      cursor: pointer; z-index: 900; user-select: none; touch-action: none;
      transition: transform 0.2s;
    }
    .chat-bubble:active { transform: scale(0.9); }
    .chat-bubble.has-panel { box-shadow: 0 4px 15px rgba(76,175,80,0.6); }

    .chat-panel {
      position: fixed; bottom: 140px; right: 16px;
      width: calc(100vw - 32px); max-width: 360px; height: 450px;
      background: white; border-radius: 20px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.15);
      display: flex; flex-direction: column;
      z-index: 899; overflow: hidden;
      transform: scale(0.8) translateY(20px); opacity: 0;
      pointer-events: none; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .chat-panel.open { transform: scale(1) translateY(0); opacity: 1; pointer-events: auto; }

    .chat-panel-header {
      padding: 14px 16px; background: linear-gradient(135deg, #66bb6a, #43a047);
      color: white; font-size: 15px; font-weight: 600;
      display: flex; justify-content: space-between; align-items: center;
    }
    .chat-panel-close { background: none; border: none; color: white; font-size: 20px; cursor: pointer; }

    .chat-panel-messages {
      flex: 1; overflow-y: auto; padding: 12px; display: flex;
      flex-direction: column; gap: 10px;
    }

    .chat-msg { max-width: 85%; padding: 10px 14px; border-radius: 16px; font-size: 13px; line-height: 1.5; word-break: break-word; }
    .chat-msg-user { align-self: flex-end; background: var(--green, #66bb6a); color: white; border-bottom-right-radius: 4px; }
    .chat-msg-bot { align-self: flex-start; background: #f5f5f5; color: #333; border-bottom-left-radius: 4px; }

    .chat-msg-loading { align-self: flex-start; background: #f5f5f5; padding: 12px 16px; border-radius: 16px; border-bottom-left-radius: 4px; display: flex; gap: 4px; }
    .chat-dot { width: 6px; height: 6px; background: #bbb; border-radius: 50%; animation: chatBounce 1.4s infinite; }
    .chat-dot:nth-child(2) { animation-delay: 0.2s; }
    .chat-dot:nth-child(3) { animation-delay: 0.4s; }
    @keyframes chatBounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-4px)} }

    .chat-panel-input {
      padding: 10px 12px; border-top: 1px solid #f0f0f0;
      display: flex; gap: 8px;
    }
    .chat-panel-input input {
      flex: 1; padding: 8px 14px; border: 1.5px solid #e0e0e0;
      border-radius: 20px; font-size: 13px; outline: none;
    }
    .chat-panel-input input:focus { border-color: #66bb6a; }
    .chat-panel-input button {
      width: 34px; height: 34px; border-radius: 50%; border: none;
      background: #66bb6a; color: white; font-size: 12px; cursor: pointer;
    }
  `;
  document.head.appendChild(style);

  // 悬浮气泡
  const bubble = document.createElement('div');
  bubble.className = 'chat-bubble';
  bubble.innerHTML = '💬';
  document.body.appendChild(bubble);

  // 聊天面板
  const panel = document.createElement('div');
  panel.className = 'chat-panel';
  panel.innerHTML = `
    <div class="chat-panel-header">
      <span>💬 家希小助手</span>
      <button class="chat-panel-close" onclick="this.closest('.chat-panel').classList.remove('open')">&times;</button>
    </div>
    <div class="chat-panel-messages" id="chat-panel-msgs">
      <div class="chat-msg chat-msg-bot">嘿🧊🧊~ 想我了吗？今天想吃什么，跟我说就行，御厨随时待命 👨‍🍳</div>
    </div>
    <div class="chat-panel-input">
      <input id="chat-panel-input" placeholder="跟家希说点什么~" maxlength="200">
      <button id="chat-panel-send">➤</button>
    </div>
  `;
  document.body.appendChild(panel);

  // 点击气泡开关面板
  bubble.addEventListener('click', function(e) {
    if (bubble._dragged) { bubble._dragged = false; return; }
    isOpen = !isOpen;
    panel.classList.toggle('open', isOpen);
  });

  // 拖动
  let startX, startY, startLeft, startTop, moved;
  bubble.addEventListener('touchstart', function(e) {
    const touch = e.touches[0];
    const rect = bubble.getBoundingClientRect();
    startX = touch.clientX; startY = touch.clientY;
    startLeft = rect.left; startTop = rect.top;
    moved = false;
  });
  bubble.addEventListener('touchmove', function(e) {
    const touch = e.touches[0];
    const dx = touch.clientX - startX;
    const dy = touch.clientY - startY;
    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) moved = true;
    if (moved) {
      bubble.style.left = (startLeft + dx) + 'px';
      bubble.style.top = (startTop + dy) + 'px';
      bubble.style.right = 'auto';
      bubble.style.bottom = 'auto';
      e.preventDefault();
    }
  });
  bubble.addEventListener('touchend', function() {
    if (moved) bubble._dragged = true;
  });

  // 发送消息
  function addMsg(text, type) {
    const div = document.createElement('div');
    div.className = 'chat-msg chat-msg-' + type;
    div.textContent = text;
    document.getElementById('chat-panel-msgs').appendChild(div);
    const msgs = document.getElementById('chat-panel-msgs');
    msgs.scrollTop = msgs.scrollHeight;
    return div;
  }

  async function send() {
    if (isSending) return;
    const input = document.getElementById('chat-panel-input');
    const text = input.value.trim();
    if (!text) return;
    input.value = '';
    addMsg(text, 'user');
    isSending = true;

    const loading = document.createElement('div');
    loading.className = 'chat-msg-loading';
    loading.innerHTML = '<div class="chat-dot"></div><div class="chat-dot"></div><div class="chat-dot"></div>';
    document.getElementById('chat-panel-msgs').appendChild(loading);

    try {
      const body = {
        message: { content: { type: 'text', value: { showText: text } } },
        source: APP_ID, from: 'openapi', openId: getOpenId()
      };
      if (threadId) body.threadId = threadId;

      const res = await fetch(AGENT_API + '?appId=' + APP_ID + '&secretKey=' + SECRET_KEY, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      loading.remove();
      const botMsg = addMsg('', 'bot');
      let fullText = '';
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop();
        for (const line of lines) {
          if (!line.startsWith('data:')) continue;
          try {
            const json = JSON.parse(line.slice(5));
            if (json.status === 0 && json.data?.message) {
              threadId = json.data.message.threadId || threadId;
              for (const c of (json.data.message.content || [])) {
                if (c.dataType === 'markdown' && c.data?.text) {
                  fullText += c.data.text;
                  botMsg.textContent = fullText;
                  const msgs = document.getElementById('chat-panel-msgs');
                  msgs.scrollTop = msgs.scrollHeight;
                }
              }
            }
          } catch (e) {}
        }
      }
      if (!fullText) botMsg.textContent = '嗯嗯~';
    } catch (e) {
      loading.remove();
      addMsg('网络好像不太好，等一下再试试~', 'bot');
    }
    isSending = false;
  }

  document.getElementById('chat-panel-send').addEventListener('click', send);
  document.getElementById('chat-panel-input').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') send();
  });
})();
