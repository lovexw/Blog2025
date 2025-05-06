import { defineConfig } from 'vitepress'
import AutoNavPlugin from 'vitepress-auto-nav-sidebar'

// import XMindPlugin from 'vite-plugin-vue-xmind'
const { nav, sidebar } = AutoNavPlugin({
  ignoreFolders: [
    'node_modules',
    'assets',
    'public',
    '.vitepress',
    'code',
    '.obsidian',
    'utils',
    'resource',
    'xmind',
    'Vue'
  ],
  dirPrefix: '',
  filePrefix: '',
  ignoreFiles: ['个人简历', '学习大纲', '学习计划', '面试准备', '互联网公司列表', 'index'],
  isCollapse: true,
})

// 辅助函数：从绝对路径中提取相对路径（docs文件夹之后的部分）
function extractRelativePath(path) {
  if (!path) return path;
  
  // 更通用的方法：查找 docs\ 后面的部分
  const docsIndex = path.lastIndexOf('\\docs\\');
  if (docsIndex !== -1) {
    // 提取 docs 之后的路径并转换为正斜杠格式
    return '/' + path.substring(docsIndex + 6).replace(/\\/g, '/');
  }
  
  // 处理已经是相对路径的情况
  // 去除 .md 扩展名
  let result = path.replace(/\.md$/, '');
  
  // 确保以 / 开头（除非是外部链接）
  if (!result.startsWith('/') && !result.startsWith('http')) {
    result = '/' + result;
  }
  
  return result;
}

// 从Windows路径中提取文件夹或文件名
function extractName(path) {
  if (!path) return path;
  
  // 如果包含反斜杠，取最后一部分
  if (path.includes('\\')) {
    const parts = path.split('\\');
    return parts[parts.length - 1];
  }
  
  return path;
}

// 递归处理导航数组
function processNavigation(items) {
  if (!items || !Array.isArray(items)) return items;
  
  return items.map(item => {
    const newItem = {...item};
    
    // 处理显示文本 - 只保留目录/文件名
    if (typeof newItem.text === 'string' && newItem.text.includes('\\')) {
      newItem.text = extractName(newItem.text);
    }
    
    // 处理链接 - 提取相对路径
    if (typeof newItem.link === 'string') {
      newItem.link = extractRelativePath(newItem.link);
    }
    
    // 处理子导航项
    if (newItem.items && Array.isArray(newItem.items)) {
      newItem.items = processNavigation(newItem.items);
    }
    
    return newItem;
  });
}

// 处理侧边栏结构
function processSidebar(sidebar) {
  if (!sidebar) return sidebar;
  
  const result = {};
  
  Object.keys(sidebar).forEach(key => {
    // 处理路径键名
    const newKey = extractRelativePath(key);
    
    // 处理侧边栏各项
    result[newKey] = sidebar[key].map(section => {
      const newSection = {...section};
      
      // 处理显示文本
      if (typeof newSection.text === 'string' && newSection.text.includes('\\')) {
        newSection.text = extractName(newSection.text);
      }
      
      // 处理子项
      if (newSection.items && Array.isArray(newSection.items)) {
        newSection.items = newSection.items.map(item => {
          const newItem = {...item};
          
          // 处理显示文本
          if (typeof newItem.text === 'string' && newItem.text.includes('\\')) {
            newItem.text = extractName(newItem.text);
          }
          
          // 处理链接
          if (typeof newItem.link === 'string') {
            newItem.link = extractRelativePath(newItem.link);
          }
          
          return newItem;
        });
      }
      
      return newSection;
    });
  });
  
  return result;
}

// 应用处理函数
const processedNav = processNavigation(nav);
const processedSidebar = processSidebar(sidebar);

// 打印导航栏和侧边栏配置
console.log('Navigation configuration:', processedNav)
console.log('Sidebar configuration:', processedSidebar)

// 当通过github访问时候使用 base: '/Vitepress_Blog/', 目前配置了cloudflare则使用 / 
export default defineConfig({
  base: '/',
  appearance: false,
  lang: 'zh-CN',
  title: 'Code More Create',
  // description: "Merlin's Blog",
  assetsInclude: ['**/*.xmind'],
  // vite: {
  //   plugins: [XMindPlugin()]
  // },
  head: [
    // add jquert and fancybox
    ['script', { src: 'https://cdnjs.cloudflare.com/ajax/libs/jquery/3.3.1/jquery.slim.min.js' }],
    ['script', { src: 'https://cdnjs.cloudflare.com/ajax/libs/fancybox/3.5.2/jquery.fancybox.min.js' }],
    ['link', { rel: 'stylesheet', type: 'text/css', href: 'https://cdnjs.cloudflare.com/ajax/libs/fancybox/3.5.2/jquery.fancybox.min.css' }],
    // 移动导航面板滚动锁定 - 改进版本
    ['script', {}, `
      (function() {
        // 保存原始滚动位置
        let scrollPosition = 0;
        
        // 使用轮询方式检测导航面板状态
        function setupNavScrollLock() {
          let isNavOpen = false;
          
          // 每100ms检查一次导航面板状态
          setInterval(function() {
            // 寻找更可靠的导航菜单状态指示符
            const navScreen = document.querySelector('.VPNavScreen');
            const hamburger = document.querySelector('.VPNavBarHamburger');
            
            if (!navScreen || !hamburger) return;
            
            // 检测导航菜单是否打开
            const isCurrentlyOpen = navScreen.classList.contains('has-sidebar') || 
                                   navScreen.style.display === 'block' || 
                                   hamburger.getAttribute('aria-expanded') === 'true';
            
            // 状态变化时处理
            if (isCurrentlyOpen !== isNavOpen) {
              isNavOpen = isCurrentlyOpen;
              
              if (isNavOpen) {
                // 菜单打开: 锁定滚动
                scrollPosition = window.pageYOffset;
                document.body.style.overflow = 'hidden';
                document.body.style.position = 'fixed';
                document.body.style.top = \`-\${scrollPosition}px\`;
                document.body.style.width = '100%';
                
                // 尝试禁用触摸移动
                document.addEventListener('touchmove', preventTouchMove, { passive: false });
              } else {
                // 菜单关闭: 恢复滚动
                document.body.style.overflow = '';
                document.body.style.position = '';
                document.body.style.top = '';
                document.body.style.width = '';
                window.scrollTo(0, scrollPosition);
                
                // 恢复触摸移动
                document.removeEventListener('touchmove', preventTouchMove);
              }
            }
          }, 100);
        }
        
        // 阻止触摸移动事件
        function preventTouchMove(e) {
          // 检查是否在导航菜单内的滚动
          const target = e.target;
          const navScreen = document.querySelector('.VPNavScreen');
          
          // 允许导航菜单内部滚动
          if (navScreen && navScreen.contains(target) && 
              (target.scrollHeight > target.clientHeight || 
               target.closest('.VPNavScreenMenu') !== null)) {
            return;
          }
          
          e.preventDefault();
        }
        
        // 在DOM完全加载后设置滚动锁定
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', setupNavScrollLock);
        } else {
          setupNavScrollLock();
        }
      })();
    `],
    // 添加移动端视图优化的样式
    ['style', {}, `
      @media (max-width: 768px) {
        /* 改进导航菜单显示 */
        .VPNavScreen {
          z-index: 100 !important;
        }
        
        /* 确保内容在导航打开时不会滚动 */
        body.overflow-hidden {
          overflow: hidden !important;
        }
        
        /* 防止内容跳动 */
        body.fixed-position {
          position: fixed !important;
          width: 100% !important;
        }
      }
    `]
  ],
  markdown: {
    config: (md) => {
      // md.use(CodeRunPlugin)
      md.use(function (md) {
        // const handleImage = md.renderer.rules.image
        md.renderer.rules.image = (tokens, idx, options, env, self) => {
          const url = tokens[idx].attrs[0][1];
          if (/.xmind$/.test(url)) {
            // const title = tokens[idx].children[0].content;
            // const url = tokens[idx].attrs[0][1];
            // return `<XMindViewer src="${url}" title="${title}"></XMindViewer>`;
            return `<p>暂时不支持XMIND预览</p>`;
          } else {
            const PUBLIC_PREFIX = "/docs/.vitepress/public";
            const token = tokens[idx];
            const srcIndex = token.attrIndex("src");
            const url = token.attrs[srcIndex][1].replace(PUBLIC_PREFIX, "");
            const caption = md.utils.escapeHtml(token.content);
            return `<a data-fancybox href="${url}" content="${caption}">
                    <img src="${url}" alt="${caption}" />
                </a>`;
            // return handleImage(tokens, idx, options, env, self);
          }
        }
      })
    }
  },
  themeConfig: {
    // logo: '/logo.png',
    siteTitle: 'Code More Create',
    nav: [
      ...processedNav,
      {
        text: '🏄🏻‍♂️ 算法笔记',
        link: '/基础知识/算法与数据结构/' // 替换为本地路径
      }
    ],
    sidebar: processedSidebar,
    footer: {
      message: 'MIT Licensed | Copyright © 2023 - 2024',
      copyright: 'ringakkin'
    },
    socialLinks: [
      {
        icon: 'github',
        link: 'https://github.com/ringakkin'
      }
    ],
    editLink: {
      pattern: 'https://github.com/ringakkin/Vitepress_Blog/edit/master/docs/:path',
      text: '更正错误'
    },
    lastUpdatedText: '更新时间'
  },
})
