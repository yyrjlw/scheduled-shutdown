<script setup lang="ts">
import { zhCN, dateZhCN, darkTheme, type GlobalThemeOverrides } from 'naive-ui'
import Index from '@/views/Home/index.vue'

const themeOverrides: GlobalThemeOverrides = {
  common: {
    primaryColor: '#FF0000'
  },
  Button: {
    textColor: '#FF0000'
  }
}
</script>

<template>
  <NConfigProvider :locale="zhCN" :date-locale="dateZhCN" :theme="darkTheme" class="h-full">
    <Index />
  </NConfigProvider>
</template>

<style scoped></style>
