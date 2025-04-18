<template>
  <div class="sidebar-scroller"></div>
</template>

<script setup>
import { onMounted, watch, nextTick, ref } from 'vue'
import { useRoute } from 'vitepress'

const route = useRoute()
const isNavigatingFromSidebar = ref(false)

// 设置侧边栏点击事件监听
function setupSidebarClickListener() {
  const sidebar = document.querySelector('.VPSidebar')
  if (!sidebar) return
  
  sidebar.addEventListener('click', (e) => {
    // 检查点击的是否为链接元素
    const link = e.target.tagName === 'A' ? e.target : e.target.closest('a')
    if (link) {
      isNavigatingFromSidebar.value = true
      
      // 100ms后重置标志，以防导航被取消
      setTimeout(() => {
        isNavigatingFromSidebar.value = false
      }, 100)
    }
  })
}

// 主要定位函数
function scrollToActiveItem() {
  // 确保DOM有足够时间加载
  setTimeout(() => {
    try {
      // 1. 首先找到侧边栏
      const sidebar = document.querySelector('.VPSidebar')
      if (!sidebar) return
      
      // 2. 展开包含当前路径的侧边栏项
      expandSidebarForCurrentPath(sidebar)
      
      // 3. 找到活动项
      const activeItem = findActiveItem(sidebar)
      if (!activeItem) return
      
      // 4. 滚动到活动项 - 使用原生scrollIntoView
      const scrollContainer = sidebar.querySelector('.VPSidebarNav') || sidebar
      
      // 判断元素是否在可视区域内
      const containerRect = scrollContainer.getBoundingClientRect()
      const itemRect = activeItem.getBoundingClientRect()
      const isVisible = (
        itemRect.top >= containerRect.top &&
        itemRect.bottom <= containerRect.bottom
      )
      
      // 如果已经可见，不需要滚动
      if (isVisible) return
      
      // 滚动活动项到可视区域中央
      activeItem.scrollIntoView({
        behavior: 'smooth',  // 平滑滚动
        block: 'center'      // 尽量滚动到中央位置
      })
      
      // 视觉反馈
      highlightItem(activeItem)
    } catch (error) {
      // 静默处理错误
    }
  }, 200) // 减少等待时间
}

// 展开侧边栏中与当前路径相关的折叠项
function expandSidebarForCurrentPath(sidebar) {
  try {
    const currentPath = decodeURIComponent(route.path)
    
    // 找到所有可能的链接
    const allLinks = sidebar.querySelectorAll('a')
    
    for (const link of allLinks) {
      const href = link.getAttribute('href')
      if (!href) continue
      
      try {
        const decodedHref = decodeURIComponent(href)
        
        // 检查链接是否匹配当前路径
        const isMatch = 
          currentPath === decodedHref || 
          currentPath === decodedHref.replace(/\.html$/, '') ||
          currentPath.endsWith(decodedHref)
        
        if (isMatch) {
          // 展开所有父级折叠项
          let current = link.parentElement
          
          while (current && current !== sidebar) {
            if (current.classList && current.classList.contains('VPSidebarItem')) {
              const toggle = current.querySelector('.title')
              if (toggle && toggle.getAttribute('aria-expanded') === 'false') {
                toggle.click()
              }
            }
            current = current.parentElement
          }
          
          // 为链接添加active类（如果需要）
          if (!link.classList.contains('active')) {
            link.classList.add('active')
          }
          
          break
        }
      } catch (e) {
        // 继续检查下一个链接
      }
    }
  } catch (error) {
    // 静默处理错误
  }
}

// 查找活动项（已有active类的链接）
function findActiveItem(sidebar) {
  // 常用的活动项选择器
  const selectors = [
    '.VPSidebarItem .active',
    '.is-active',
    '.active'
  ]
  
  // 尝试找到具有active类的元素
  for (const selector of selectors) {
    const items = sidebar.querySelectorAll(selector)
    if (items.length > 0) {
      // 如果有多个匹配项，优先选择链接元素
      for (const item of items) {
        if (item.tagName === 'A') {
          return item
        }
      }
      return items[0]
    }
  }
  
  // 如果没找到，尝试通过路径匹配
  const currentPath = decodeURIComponent(route.path)
  
  // 尝试不同的路径格式
  const pathSelectors = [
    `a[href="${currentPath}"]`,
    `a[href="${currentPath.replace(/\.html$/, '')}"]`,
    `a[href="${currentPath.replace(/^\//, '')}"]`
  ]
  
  for (const selector of pathSelectors) {
    const item = sidebar.querySelector(selector)
    if (item) {
      return item
    }
  }
  
  return null
}

// 高亮显示元素
function highlightItem(element) {
  if (!element) return
  
  const originalBg = element.style.backgroundColor
  
  // 添加短暂的高亮效果
  element.style.transition = 'background-color 0.3s ease'
  element.style.backgroundColor = 'rgba(100, 108, 255, 0.12)'
  
  setTimeout(() => {
    element.style.backgroundColor = originalBg
  }, 800)
}

// 组件生命周期
onMounted(() => {
  // 初始化侧边栏点击监听
  nextTick(() => {
    setupSidebarClickListener()
  })
  
  // 初始加载时执行一次定位
  setTimeout(scrollToActiveItem, 300)
})

// 监听路由变化
watch(() => route.path, () => {
  // 检查是否是从侧边栏导航
  if (isNavigatingFromSidebar.value) return
  
  // 路由变化时，给DOM时间更新后再执行定位
  nextTick(() => {
    setTimeout(scrollToActiveItem, 200)
  })
})
</script>

<style scoped>
.sidebar-scroller {
  display: none;
}
</style> 