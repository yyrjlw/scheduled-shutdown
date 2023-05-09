import type { IDriver } from '.'
import { Command } from '@tauri-apps/api/shell'

export class Linux implements IDriver {
  async shutdown() {
    await new Command('shutdown', ['-h', 'now']).execute()
  }
  async restart() {
    await new Command('shutdown', ['-r', 'now']).execute()
  }
}

export default new Linux()
