import type { IDriver } from '.'
import { Command } from '@tauri-apps/api/shell'

export class Darwin implements IDriver {
  async shutdown() {
    await new Command('shutdown', ['-h', 'now']).execute()
  }
  async restart() {
    await new Command('shutdown', ['-r', 'now']).execute()
  }
  async sleep() {
    await new Command('shutdown', ['-s', 'now']).execute()
  }
}

export default new Darwin()
