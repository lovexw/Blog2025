<template>
  <div class="sidebar-scroller"></div>
</template>

<script setup>
import { onMounted, watch, onBeforeUnmount, ref } from 'vue'
import { useRoute } from 'vitepress'

const route = useRoute()
const isTopNavClick = ref(false)
let navClickListener = null // 存储事件监听器引用

function scrollActiveItemIntoView() {
  if (!isTopNavClick.value) return

  // 使用 requestAnimationFrame 确保 DOM 已更新
  requestAnimationFrame(() => {
    // 安全地获取元素
    const sidebar = document.querySelector('.VPSidebar')
    if (!sidebar) {
      isTopNavClick.value = false
      return
    }

    const links = document.querySelectorAll('.VPLink.link')
    let activeLink = null
    
    links.forEach(link => {
      const href = link.getAttribute('href')
      if (href === route.path || href === decodeURIComponent(route.path)) {
        activeLink = link
      }
    })

    if (activeLink) {
      try {
        const linkRect = activeLink.getBoundingClientRect()
        const sidebarRect = sidebar.getBoundingClientRect()
        const relativeTop = linkRect.top - sidebarRect.top
        
        sidebar.scrollTo({
          top: sidebar.scrollTop + relativeTop - (sidebarRect.height / 3),
          behavior: 'smooth'
        })
        
        // 添加视觉提示
        activeLink.style.transition = 'background-color 0.3s ease'
        activeLink.style.backgroundColor = 'var(--vp-c-brand-soft)'
        
        setTimeout(() => {
          if (activeLink) { // 二次检查元素是否仍存在
            activeLink.style.backgroundColor = ''
          }
        }, 1000)
      } catch (e) {
        console.error('Error during sidebar scroll:', e)
      }
    }
    
    isTopNavClick.value = false
  })
}

onMounted(() => {
  // 使用更安全的方式添加事件监听
  const handleNavClick = (e) => {
    const link = e.target.closest('.VPLink')
    if (link) {
      isTopNavClick.value = true
    }
  }

  // 延迟一点添加事件监听，确保 DOM 已加载
  setTimeout(() => {
    const navBar = document.querySelector('.VPNavBarMenu')
    if (navBar) {
      navBar.addEventListener('click', handleNavClick)
      navClickListener = handleNavClick // 保存引用以便后续清理
    }
  }, 100)

  const stopWatch = watch(
    () => route.path,
    () => {
      scrollActiveItemIntoView()
    }
  )

  onBeforeUnmount(() => {
    if (stopWatch) stopWatch()
    
    // 安全地清理事件监听
    const navBar = document.querySelector('.VPNavBarMenu')
    if (navBar && navClickListener) {
      navBar.removeEventListener('click', navClickListener)
    }
  })
})
</script>

<style scoped>
.sidebar-scroller {
  display: none;
}

:deep(.VPLink.link) {
  transition: background-color 0.3s ease;
}

:deep(.VPLink.link:hover) {
  background-color: var(--vp-c-brand-soft);
}
</style> 