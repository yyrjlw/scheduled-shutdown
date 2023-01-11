const { contextBridge } = require('electron')
const {Shutdown} = require('./modules/shutdown')

contextBridge.exposeInMainWorld('BG_API', {
  onShutdown(action){
    return new Shutdown(action).initShutdown()
  }
})