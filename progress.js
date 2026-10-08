// 送出按鈕變成「預估」進度條（所有表單共用）
// GAS 不會回報做到哪一步，只能照「這個表單過去送出花了多久」來估：
//   跑到 90% 就停住慢慢爬，等 GAS 真的回覆才跳到 95%（通知群組），送完 100%
//   每次實際花的時間記在這支手機（localStorage），之後越估越準
function SubmitProgress(btn, key) {
  const store = 'eta_' + key;
  let est = 6000; // 第一次沒有紀錄：先抓 6 秒
  try { est = Number(localStorage.getItem(store)) || est; } catch (e) {}
  const orig = { text: btn.textContent, bg: btn.style.background, shadow: btn.style.textShadow };
  const t0 = Date.now();
  let label = '處理中';
  let pct = 0;
  let timer = null;

  function paint(p, text) {
    btn.style.background = 'linear-gradient(to right, #06c755 ' + p + '%, #a7d8b9 ' + p + '%)';
    btn.style.textShadow = '0 1px 2px rgba(0,0,0,.25)';
    btn.textContent = text || (label + '… ' + Math.floor(p) + '%');
  }
  function stop() { if (timer) { clearInterval(timer); timer = null; } }

  btn.disabled = true;
  paint(0);
  timer = setInterval(() => {
    const r = (Date.now() - t0) / est;
    pct = r < 1 ? 90 * r : 90 + 8 * (1 - Math.exp(1 - r)); // 超過預估時間只慢慢爬到 98%
    paint(pct);
  }, 100);

  return {
    // GAS 回覆了：記下這次花的時間（新舊平均，避免一次特別慢就亂掉）
    received() {
      stop();
      const took = Date.now() - t0;
      const next = Math.round(est * 0.6 + took * 0.4);
      try { localStorage.setItem(store, String(Math.min(60000, Math.max(1500, next)))); } catch (e) {}
      label = '通知群組';
      pct = Math.max(pct, 95);
      paint(pct);
    },
    // 全部完成（按鈕維持反灰，避免重複送出）
    finish(text) {
      stop();
      paint(100, text || '✅ 完成');
    },
    // 失敗：按鈕恢復原樣，讓人可以再按
    reset() {
      stop();
      btn.style.background = orig.bg;
      btn.style.textShadow = orig.shadow;
      btn.textContent = orig.text;
    },
  };
}
