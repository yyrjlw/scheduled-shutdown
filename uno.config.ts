import { defineConfig, presetIcons, presetUno } from 'unocss'

export default defineConfig({
  presets: [presetUno(), presetIcons()],
  theme: {
    
  },
  shortcuts: {
    'flex-y-center': 'flex items-center',
    'flex-x-center': 'flex justify-center',
    'flex-xy-center': 'flex justify-center items-center',
    'flex-col-full': 'h-full flex flex-col'
  }
})
