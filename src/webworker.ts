type WorkerMessage = 'start' | 'stop'
const WorkerEvent = {
  'interval:tick': 'interval:tick'
}
export type WorkerEventType = keyof typeof WorkerEvent

self.onmessage = function (e: MessageEvent<WorkerMessage>) {
  switch (e.data) {
    case 'start':
      start()
      break

    case 'stop':
      stop()
      break

    default:
      break
  }
}

let interVal = 0

function start() {
  interVal = setInterval(() => {
    postMessage(WorkerEvent['interval:tick'])
  }, 1000)
}

function stop() {
  clearInterval(interVal)
}
