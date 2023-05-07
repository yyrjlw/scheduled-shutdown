import { getDriver, type shutdownModal } from '@/libs/drivers'
import { notification } from './tauri-util'

export const shutdown = async (modal: shutdownModal) => {
  const driver = await getDriver()
  if (Reflect.has(driver, modal)) {
    try {
      Reflect.apply(driver[modal] as Function, null, [])
    } catch (error) {
      console.trace(error)
      notification({
        title: '定时关机小工具',
        body: '程序执行出现错误，请确认是否以管理员身份运行'
      })
    }
  } else {
    throw new Error('未定义的方法')
  }
}
