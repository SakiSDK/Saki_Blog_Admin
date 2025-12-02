import type { ThemeState } from '@/types/stores/theme.type';
import { defineStore } from "pinia";
import { ref, watch } from "vue";
import { useDark, useToggle } from '@vueuse/core'


export const useThemeStore = defineStore('theme', () => {
  const theme = ref<ThemeState>('light')
  const isDark = useDark({
    selector: 'html',
    attribute: 'class',
    valueDark: 'dark',
    valueLight: 'light',
  })
  const toggleDark = useToggle(isDark)
  const toggleTheme = () => {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
  }
  watch(theme, (newValue) => {
    document.documentElement.dataset.theme = newValue;
    isDark.value = newValue === 'dark'
  },{immediate:true})
  return {
    theme,
    toggleTheme
  }
}, {
  persist: true
})
