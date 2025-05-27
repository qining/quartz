import { QuartzComponentConstructor, QuartzComponentProps } from "./types"

export default (() => {
  function Waline(props: QuartzComponentProps) {
    return (
      // 1. 外层留一个固定的 wrapper 骨架
      <div id="waline-wrapper">
        <link rel="stylesheet" href="https://unpkg.com/@waline/client@v3/dist/waline.css" />
        {/* 里面的内容我们全靠 JS 动态生成 */}
      </div>
    )
  }

  Waline.afterDOMLoaded = `
    const loadWaline = async () => {
      const wrapper = document.getElementById('waline-wrapper');
      if (!wrapper) return;

      // 🚨 终极暴力强拆：每次都把旧坑挖掉，绝不给 Waline 弄混的机会
      const oldContainer = document.getElementById('waline-container');
      if (oldContainer) {
        oldContainer.remove();
      }

      // 🚨 重新浇筑新地基
      const newContainer = document.createElement('div');
      newContainer.id = 'waline-container';
      wrapper.appendChild(newContainer);

      try {
        const { init } = await import('https://unpkg.com/@waline/client@v3/dist/waline.js');

        // 不保存全局实例，也不调用 destroy，直接在这个纯净的新地基上初始化
        init({
          el: newContainer,
          serverURL: window.location.origin + '/waline',
          path: window.location.pathname,
          dark: 'html[saved-theme="dark"]',
          emoji: [
            'https://unpkg.com/@waline/emojis@1.2.0/bilibili',
            'https://unpkg.com/@waline/emojis@1.2.0/weibo',
            'https://unpkg.com/@waline/emojis@1.2.0/alus',
          ],
        });
      } catch (e) {
        console.error('Waline 加载失败', e);
      }
    };

    // 🚨 防御性绑定：确保就算 Quartz 发神经重复跑这段代码，监听器也只挂载一次
    if (!window.walineNavBound) {
      document.addEventListener('nav', loadWaline);
      window.walineNavBound = true;
    }
  `

  Waline.css = `
  #waline-wrapper {
    margin-top: 2rem;
  }
  `

  return Waline
}) satisfies QuartzComponentConstructor
