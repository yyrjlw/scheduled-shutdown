import type { IDriver } from '.'
import { Command } from '@tauri-apps/api/shell'

export class Windows implements IDriver {
  async shutdown() {
    await new Command('shutdown', ['/p', '/f']).execute()
  }
  async restart() {
    await new Command('shutdown', ['/r', '/t', '0']).execute()
  }
  async hibernate() {
    await new Command('shutdown', ['/h']).execute()
  }
}

export default new Windows()
