import { type } from '@tauri-apps/api/os'
import darwin from './darwin'
import linux from './linux'
import windows from './windows'

export interface IDriver {
  shutdown(): Promise<void>
  restart(): Promise<void>
  sleep?(): Promise<void>
  hibernate?(): Promise<void>
}

export type shutdownModal = keyof Pick<IDriver, 'hibernate' | 'restart' | 'shutdown' | 'sleep'>

export const getDriver = async (): Promise<IDriver> => {
  const osType = await type()
  switch (osType) {
    case 'Darwin':
      return darwin
    case 'Linux':
      return linux
    case 'Windows_NT':
      return windows
    default:
      throw new Error('不支持的系统')
  }
}
