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

export default defineConfig({
  base: '',
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
    ['link', { rel: 'stylesheet', type: 'text/css', href: 'https://cdnjs.cloudflare.com/ajax/libs/fancybox/3.5.2/jquery.fancybox.min.css' }]
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
        link: 'https://algorithm.merlin218.top'
      }
    ],
    sidebar: processedSidebar,
    footer: {
      message: 'MIT Licensed | Copyright © 2021 - 2022',
      copyright: '粤ICP备2021165391号'
    },
    socialLinks: [
      {
        icon: 'github',
        link: 'https://github.com/Merlin218'
      }
    ],
    editLink: {
      pattern: 'https://github.com/Merlin218/Merlin218.github.io/edit/master/docs/:path',
      text: '更正错误'
    },
    lastUpdatedText: '更新时间'
  },
})
