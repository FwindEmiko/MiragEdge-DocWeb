// 3D倾斜效果函数
export function init3DTiltEffect() {
  // SSR 守卫：VitePress 在 Node 端执行主题代码时无 document
  if (typeof window === 'undefined' || typeof document === 'undefined') return

  const cards = document.querySelectorAll('.VPHome .VPFeature');

  cards.forEach(card => {
    // 幂等：避免 HMR 或重复调用时累积多份监听器
    if (card.dataset.tiltProcessed) return
    card.dataset.tiltProcessed = '1'

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      // 卡片隐藏或尺寸为 0 时除零会产生 NaN，污染 CSS 变量
      if (rect.width === 0 || rect.height === 0) return
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // 计算中心点
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // 计算旋转角度
      const rotateX = ((y - centerY) / centerY) * -10;
      const rotateY = ((x - centerX) / centerX) * 10;

      // 设置 CSS 变量
      card.style.setProperty('--rotate-x', `${rotateX}deg`);
      card.style.setProperty('--rotate-y', `${rotateY}deg`);

      // 设置光泽位置变量
      card.style.setProperty('--bg-x', `${x}px`);
      card.style.setProperty('--bg-y', `${y}px`);
    });

    // 鼠标离开时复位
    card.addEventListener('mouseleave', () => {
      card.style.setProperty('--rotate-x', '0deg');
      card.style.setProperty('--rotate-y', '0deg');
      card.style.setProperty('--bg-x', '50%');
      card.style.setProperty('--bg-y', '50%');
    });
  });
}