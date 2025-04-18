<template>
  <Layout>
    <template #sidebar-nav-before>
      <SidebarScroller />
    </template>
  </Layout>
</template>

<script setup>
import DefaultTheme from 'vitepress/theme'
import SidebarScroller from './SidebarScroller.vue'

const { Layout } = DefaultTheme
</script>