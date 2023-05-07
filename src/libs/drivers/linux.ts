import type { IDriver } from '.'
import { Command } from '@tauri-apps/api/shell'

export class Linux implements IDriver {
  async shutdown() {
    await new Command('systemctl', ['poweroff', '-f']).execute()
  }
  async restart() {
    await new Command('systemctl', ['reboot', '-f']).execute()
  }
  async sleep() {
    await new Command('systemctl', ['suspend', '-f']).execute()
  }
  async hibernate() {
    await new Command('systemctl', ['hibernate', '-f']).execute()
  }
}

export default new Linux()
