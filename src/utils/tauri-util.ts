import {
  isPermissionGranted,
  requestPermission,
  sendNotification
} from '@tauri-apps/api/notification'

/**
 * 发送系统通知
 * @param param
 */
export const notification = async (param: Parameters<typeof sendNotification>[0]) => {
  let permissionGranted = await isPermissionGranted()
  if (!permissionGranted) {
    const permission = await requestPermission()
    permissionGranted = permission === 'granted'
  }
  if (permissionGranted) {
    sendNotification(param)
  }
}
