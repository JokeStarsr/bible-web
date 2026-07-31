'use client';

// 通用头像组件：有 avatarUrl 显示图片，否则显示名称首字母圆形背景
interface AvatarProps {
  name: string;
  avatarUrl?: string;
  size?: number; // 直径 px
  className?: string;
}

export default function Avatar({ name, avatarUrl, size = 40, className = '' }: AvatarProps) {
  const initial = (name || '?').charAt(0).toUpperCase();
  const fontSize = Math.max(10, Math.floor(size * 0.4));
  if (avatarUrl) {
    return (
      <div
        className={`rounded-full overflow-hidden flex-shrink-0 bg-amber-50 ${className}`}
        style={{ width: size, height: size }}
      >
        <img
          src={avatarUrl}
          alt={name}
          className="w-full h-full object-cover"
          onError={(e) => {
            // 图片加载失败时隐藏 img，让外层背景兜底（简易处理）
            (e.currentTarget as HTMLImageElement).style.display = 'none';
          }}
        />
      </div>
    );
  }
  return (
    <div
      className={`rounded-full flex items-center justify-center flex-shrink-0 bg-amber-100 text-amber-700 font-bold ${className}`}
      style={{ width: size, height: size, fontSize }}
    >
      {initial}
    </div>
  );
}
