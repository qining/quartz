import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"

export default (() => {
  function Waline(props: QuartzComponentProps) {
    return (
      <div id="waline-container">
        {/* 引入 Waline 官方 CSS */}
        <link rel="stylesheet" href="https://unpkg.com/@waline/client@v3/dist/waline.css" />

        {/* 评论框挂载点 */}
        <div id="waline"></div>

        {/* 核心驱动脚本 */}
        <script type="module" dangerouslySetInnerHTML={{ __html: `
          import { init } from 'https://unpkg.com/@waline/client@v3/dist/waline.js';

          function loadWaline() {
            const container = document.getElementById('waline');
            if (!container) return;

            init({
              el: '#waline',

              // 🚨 修改点 1：使用绝对路径，解决 POST 请求 Failed to fetch 的问题
              serverURL: window.location.origin + '/waline',

              // 自动适配 Quartz 的深浅色模式
              dark: 'html[saved-theme="dark"]',

              // 开启表情包
              emoji: [
                'https://unpkg.com/@waline/emojis@1.2.0/twemoji',
                'https://unpkg.com/@waline/emojis@1.2.0/bilibili',
                'https://unpkg.com/@waline/emojis@1.2.0/weibo',
                'https://unpkg.com/@waline/emojis@1.2.0/alus',
              ],
            });
          }

          // 首次加载页面时运行
          loadWaline();

          // 当在 Quartz 博客内点击链接跳转时，重新渲染评论框
          document.addEventListener('nav', () => {
             loadWaline();
          });
        `}} />
      </div>
    )
  }

  // 组件自带的 CSS
  Waline.css = `
  #waline-container {
    margin-top: 2rem;
    padding-top: 2rem;
  }
  `

  return Waline
}) satisfies QuartzComponentConstructor
