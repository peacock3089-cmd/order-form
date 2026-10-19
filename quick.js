// 表單資料存在這支手機上（localStorage）：下次打開先顯示上次的資料，
// 不用等 LINE 登入和 GAS 回應；背景拿到最新資料後，有變才換上。
// 每個群組分開存（連結上的 gid）。存不了（例如無痕模式）就當作沒有暫存，照舊等 GAS。
const QuickCache = {
  key(name) {
    return 'qc1_' + name + '_' + (new URLSearchParams(location.search).get('gid') || '');
  },
  get(name) {
    try {
      const v = localStorage.getItem(this.key(name));
      return v ? JSON.parse(v) : null;
    } catch (e) {
      return null;
    }
  },
  // 存最新的資料；回傳 true＝跟手機上原本存的不一樣（畫面要換成最新的）
  set(name, data) {
    const s = JSON.stringify(data);
    let old = null;
    try {
      old = localStorage.getItem(this.key(name));
      localStorage.setItem(this.key(name), s);
    } catch (e) {}
    return s !== old;
  },
};
