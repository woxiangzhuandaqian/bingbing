/**
 * 统一输入栏组件 InputBar
 * 包含: 文本输入框 + 📷图片按钮 + 发送按钮 + 图片预览区
 *
 * InputBar.create({ container, placeholder, sendIcon, onSend })
 * onSend({ text, imageUrl }) — 点击发送或回车触发
 */
const InputBar = (() => {
  const CSS_ID = 'input-bar-style';

  function injectStyle() {
    if (document.getElementById(CSS_ID)) return;
    const style = document.createElement('style');
    style.id = CSS_ID;
    style.textContent = `
.input-bar {
  display: flex; gap: 10px; align-items: center; width: 100%;
}
.input-bar-text {
  flex: 1; min-width: 0; padding: 10px 14px;
  border: 1.5px solid #e0e0e0; border-radius: 20px;
  font-size: 14px; outline: none; box-sizing: border-box;
  transition: border-color 0.2s;
}
.input-bar-text:focus { border-color: var(--green, #66bb6a); }
.input-bar-img {
  width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;
  font-size: 22px; cursor: pointer; opacity: 0.6; border-radius: 50%;
  flex-shrink: 0; transition: opacity 0.15s;
}
.input-bar-img:active { opacity: 1; }
.input-bar-send {
  width: 34px; height: 34px; border-radius: 50%; border: none;
  background: var(--green, #66bb6a); color: white; font-size: 16px;
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; transition: transform 0.15s;
}
.input-bar-send:active { transform: scale(0.88); }
.input-bar-send:disabled { background: #ccc; }
.input-bar-preview {
  display: none; padding: 6px 0; margin-top: 2px;
}
.input-bar-preview img {
  max-height: 50px; border-radius: 8px; vertical-align: middle; cursor: pointer;
}
.input-bar-preview .input-bar-rm {
  margin-left: 6px; color: #f44336; cursor: pointer; font-size: 13px; vertical-align: middle;
}
.input-bar.compact { gap: 6px; }
.input-bar.compact .input-bar-text { padding: 6px 10px; font-size: 12px; border-radius: 14px; border-width: 1px; }
.input-bar.compact .input-bar-img { width: 28px; height: 28px; font-size: 16px; }
.input-bar.compact .input-bar-send { width: 26px; height: 26px; font-size: 13px; }
.input-bar.compact + .input-bar-preview img { max-height: 36px; }
`;
    document.head.appendChild(style);
  }

  let _counter = 0;

  function create({ container, placeholder, sendIcon, onSend, showImage, size }) {
    injectStyle();
    const id = 'ib-' + (++_counter);
    const icon = sendIcon || '➤';
    const hasImage = showImage !== false;

    const barEl = document.createElement('div');
    barEl.className = 'input-bar' + (size === 'compact' ? ' compact' : '');
    barEl.id = id;
    barEl.innerHTML =
      '<input type="text" class="input-bar-text" placeholder="' + (placeholder || '说点什么~') + '" maxlength="200">' +
      (hasImage ? '<label class="input-bar-img">📷<input type="file" accept="image/*" style="display:none"></label>' : '') +
      '<button class="input-bar-send">' + icon + '</button>';

    const previewEl = document.createElement('div');
    previewEl.className = 'input-bar-preview';
    previewEl.innerHTML = '<img><span class="input-bar-rm">✕</span>';

    const textInput = barEl.querySelector('.input-bar-text');
    const fileInput = hasImage ? barEl.querySelector('input[type="file"]') : null;
    const sendBtn = barEl.querySelector('.input-bar-send');
    const previewImg = previewEl.querySelector('img');
    const removeBtn = previewEl.querySelector('.input-bar-rm');

    let imgUploadPromise = null;

    if (fileInput) {
      fileInput.addEventListener('change', function() {
        const file = this.files[0];
        if (!file) return;
        imgUploadPromise = uploadImage(file);
        const reader = new FileReader();
        reader.onload = function(e) {
          previewImg.src = e.target.result;
          previewEl.style.display = '';
        };
        reader.readAsDataURL(file);
      });
    }

    function clearImg() {
      imgUploadPromise = null;
      previewEl.style.display = 'none';
      previewImg.src = '';
      if (fileInput) fileInput.value = '';
    }

    removeBtn.addEventListener('click', clearImg);
    previewImg.addEventListener('click', function() {
      if (previewImg.src) showImagePreview(previewImg.src);
    });

    async function doSend() {
      const text = textInput.value.trim();
      if (!text && !imgUploadPromise) return;
      let imageUrl = '';
      if (imgUploadPromise) {
        imageUrl = await imgUploadPromise;
        imgUploadPromise = null;
        previewEl.style.display = 'none';
        if (fileInput) fileInput.value = '';
      }
      textInput.value = '';
      if (onSend) onSend({ text, imageUrl });
    }

    sendBtn.addEventListener('click', doSend);
    textInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') doSend();
    });

    if (typeof container === 'string') {
      container = document.getElementById(container) || document.querySelector(container);
    }
    if (container) {
      container.appendChild(barEl);
      container.appendChild(previewEl);
    }

    return {
      el: barEl,
      previewEl: previewEl,
      getInput: () => textInput,
      getSendBtn: () => sendBtn,
      focus: () => textInput.focus(),
      clear: clearImg,
      disable: (v) => { sendBtn.disabled = v; textInput.disabled = v; }
    };
  }

  return { create };
})();
