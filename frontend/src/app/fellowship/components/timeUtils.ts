// 主内通讯页面时间格式化工具
// today: HH:MM
// yesterday: 昨天 / 어제
// older: MM-DD

export function formatListTime(iso: string | undefined, t: (k: string) => string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterdayStart = new Date(todayStart.getTime() - 24 * 60 * 60 * 1000);
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  if (d >= todayStart) return `${hh}:${mm}`;
  if (d >= yesterdayStart) return t('fellowship.yesterday');
  return `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// 消息时间：今天 HH:MM；昨天：昨天 HH:MM；更早：MM-DD HH:MM
export function formatMessageTime(iso: string, t: (k: string) => string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterdayStart = new Date(todayStart.getTime() - 24 * 60 * 60 * 1000);
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  if (d >= todayStart) return `${hh}:${mm}`;
  if (d >= yesterdayStart) return `${t('fellowship.yesterday')} ${hh}:${mm}`;
  return `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${hh}:${mm}`;
}
