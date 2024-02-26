<template>
  <div class="flex-col-full">
    <header class="flex-y-center justify-between bg-[#2c3e50] text-white h-24 px-14">
      <div class="flex-y-center">
        <div>模式：</div>
        <n-select
          :disabled="!!countDown"
          v-model:value="model"
          size="small"
          :options="selectOptionsForModal"
        />
      </div>
      <div class="flex-y-center">
        <span>动作：</span>
        <n-select
          :disabled="!!countDown"
          v-model:value="action"
          size="small"
          :options="selectOptionsForAction"
        />
      </div>
    </header>
    <section class="flex-1 flex-y-center flex-col py-9 bg-[#34495e] text-white">
      <section class="flex-y-center">
        <span>时间：</span>
        <n-date-picker
          :disabled="!!countDown"
          v-show="model === 0"
          class="w-52"
          v-model:value="targetTime"
          type="datetime"
          size="small"
          format="yyyy年MM月dd日 HH:mm:ss"
          :status="datePickerStatus"
          :is-date-disabled="dateDisabled"
          @confirm="onDateConfirm"
        />
        <div v-show="model === 1" class="flex gap-x-3">
          <n-input-number
            :disabled="!!countDown"
            size="small"
            class="w-32"
            v-model:value="targetCountDown.hours"
            :min="0"
          >
            <template #suffix>小时</template>
          </n-input-number>
          <n-input-number
            :disabled="!!countDown"
            size="small"
            class="w-32"
            v-model:value="targetCountDown.minutes"
            :min="0"
            :max="59"
          >
            <template #suffix>分钟</template>
          </n-input-number>
        </div>
      </section>
      <section class="mt-9">
        <n-progress type="circle" class="w-52!" :percentage="percentage" :status="progressStatus">
          <Transition
            mode="out-in"
            :leave-active-class="
              !!countDown ? 'animate__animated animate__faster animate__bounceOut' : ''
            "
          >
            <button
              v-if="!countDown"
              class="i-codicon-debug-start aspect-square w-9/12 h-auto cursor-pointer text-[#3498db]"
              @click="toggleCountDownStatus"
            ></button>
            <div v-else class="flex flex-col items-center">
              <div class="my-3 text-xl flex-y-center gap-1">
                <span>{{ Math.trunc(countDown / 3600) }}</span>
                <span :class="{ invisible: showColon }">:</span>
                <span>{{ Math.trunc((countDown % 3600) / 60) }}</span>
                <span :class="{ invisible: showColon }">:</span>
                <span>{{ Math.trunc((countDown % 3600) % 60) }}</span>
              </div>
              <div class="px-6">
                <n-button @click="toggleCountDownStatus" round ghost type="info">取消</n-button>
              </div>
            </div>
          </Transition>
        </n-progress>
      </section>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import dayjs from 'dayjs'
import type { FormValidationStatus } from 'naive-ui/es/form/src/interface'
import { computed } from 'vue'
import { createDiscreteApi } from 'naive-ui'
import { notification } from '@/utils/tauri-util'
import { type } from '@tauri-apps/api/os'
import type { shutdownModal } from '@/libs/drivers'
import { shutdown } from '@/utils/os-util'
import type { WorkerEventType } from '@/webworker'

const { message } = createDiscreteApi(['message'])

//#region 模式
const model = ref<0 | 1>(1)
const selectOptionsForModal = ['指定时间', '倒计时'].map((i, index) => ({
  value: index,
  label: i
}))
//#endregion

//#region 动作
const action = ref<shutdownModal>('shutdown')
const selectOptionsForAction = [
  {
    label: '关机',
    value: 'shutdown'
  },
  {
    label: '睡眠',
    value: 'sleep'
  },
  {
    label: '重启',
    value: 'restart'
  },
  {
    label: '休眠',
    value: 'hibernate'
  }
] as { value: shutdownModal; label: string; disabled?: boolean }[]
type().then((osType) => {
  if (osType === 'Darwin' || osType === 'Windows_NT') {
    selectOptionsForAction[1].disabled = true
  }
})
//#endregion

/**指定时间 */
const targetTime = ref(new Date().getTime())
/**禁止选择当天之前的日期 */
const dateDisabled = (current: number) => current < dayjs().startOf('date').valueOf()
/**时间选择框校验状态 */
const datePickerStatus = ref<FormValidationStatus | undefined>(undefined)
/**时间选择框点击确认之后进行校验 */
const onDateConfirm = (value: number) => {
  if (dayjs(value).isBefore(new Date())) datePickerStatus.value = 'error'
  else datePickerStatus.value = 'success'
}
/**设定倒计时的时间 */
const targetCountDown = ref({
  hours: 0,
  minutes: 0
})

/**进度条的值 */
const percentage = computed(() =>
  countDown.value === 0 ? 0 : Math.trunc((countDown.value / countDownInitialValue) * 100)
)
/**进度条的状态 */
const progressStatus = computed(() => {
  switch (true) {
    case percentage.value > 75 && percentage.value <= 100:
      return 'success'
    case percentage.value > 50 && percentage.value <= 75:
      return 'info'
    case percentage.value > 25 && percentage.value <= 50:
      return 'warning'
    default:
      return 'error'
  }
})
const showColon = computed(() => countDown.value % 2 != 0)

const worker = new Worker(new URL('@/webworker.ts', import.meta.url))
/**倒计时 */
const countDown = ref(0)
/**倒计时的初始值(用于进度条的计算) */
let countDownInitialValue = 0
let isStarted = false

worker.onmessage = function (e: MessageEvent<WorkerEventType>) {
  switch (e.data) {
    case 'interval:tick':
      startCounting()
      break

    default:
      break
  }
}

function startCounting() {
  if (countDown.value > 0) {
    countDown.value--
    if (countDown.value === 60) {
      notification({
        title: '定时关机小工具',
        body: `温馨提示：离自动${
          selectOptionsForAction.find((i) => i.value === action.value)!.label
        }还剩一分钟`
      })
    }
  } else {
    stopCountdown()
    shutdown(action.value)
  }
}

/**停止倒计时 */
const stopCountdown = () => {
  countDown.value = 0
  countDownInitialValue = 0
  worker.postMessage('stop')
  isStarted = false
}

/**开始倒计时 */
const toggleCountDownStatus = () => {
  if (isStarted) {
    stopCountdown()
  } else {
    //#region 判断选择的时间是否合法
    if (model.value === 0 && dayjs(targetTime.value).isBefore(new Date())) {
      message.info('难道你还想回到过去吗?')
      datePickerStatus.value = 'error'
      return
    }
    if (
      model.value === 1 &&
      targetCountDown.value.hours === 0 &&
      targetCountDown.value.minutes === 0
    ) {
      message.info('相信我，直接拔掉电源，关机会更快！！！')
      return
    }
    //#endregion

    isStarted = true

    //#region 变量初始化
    const now = dayjs()
    if (model.value === 0) {
      countDown.value = dayjs(targetTime.value - now.valueOf()).unix()
    } else {
      const target = dayjs()
        .add(targetCountDown.value.hours, 'hour')
        .add(targetCountDown.value.minutes, 'minute')
      countDown.value = dayjs(target.valueOf() - now.valueOf()).unix()
    }
    countDownInitialValue = countDown.value
    //#endregion

    //开始倒计时
    worker.postMessage('start')
  }
}
</script>

<style lang="scss" scoped>
header {
  .n-select {
    width: 120px;
  }
}

:deep(.n-progress-custom-content) {
  width: 100%;
  height: 100%;
}
</style>
