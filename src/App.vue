<template>
  <a-config-provider :locale="locale">
    <div id="app">
      <a-row class="header" type="flex" justify="space-around" align="middle">
        <a-row type="flex" justify="space-between" align="middle">
          <label>模式：</label>
          <a-select v-model="pattern">
            <a-select-option
              v-for="{ value, txt } of patternOptions"
              :key="value"
              :value="value"
            >
              {{ txt }}
            </a-select-option>
          </a-select>
        </a-row>
        <a-row type="flex" justify="space-between" align="middle">
          <label>动作：</label>
          <a-select v-model="action">
            <a-select-option
              v-for="{ value, txt } of actionOptions"
              :key="value"
              :value="value"
            >
              {{ txt }}
            </a-select-option>
          </a-select>
        </a-row>
      </a-row>

      <a-row
        v-show="pattern == 1"
        class="time-control pattern1"
        type="flex"
        justify="space-around"
        align="middle"
      >
        <a-row type="flex" justify="space-between" align="middle">
          <label>日期：</label>
          <a-date-picker
            v-model="shutdownDate.absolute.date"
            :disabled-date="disabledDate"
            valueFormat="YYYY-MM-DD"
          />
        </a-row>
        <a-row type="flex" justify="space-between" align="middle">
          <label>时间：</label>
          <a-time-picker
            v-model="shutdownDate.absolute.time"
            valueFormat="HH:mm:ss"
          />
        </a-row>
      </a-row>

      <a-row
        v-show="pattern == 2"
        class="time-control pattern2"
        type="flex"
        justify="space-around"
        align="middle"
      >
        <a-row type="flex" justify="space-between" align="middle">
          <label>时间：</label>
          <a-input-number
            :min="0"
            :formatter="(value) => `${value}小时`"
            :parser="(value) => value.replace('小时', '')"
            v-model="shutdownDate.relative.hours"
          />
          <span style="width: 10px"></span>
          <a-input-number
            :min="0"
            :formatter="(value) => `${value}分钟`"
            :parser="(value) => value.replace('分钟', '')"
            v-model="shutdownDate.relative.minutes"
          />
        </a-row>
      </a-row>

      <div class="footer">
        <a-progress
          type="circle"
          :percent="shutdownPercent"
          strokeColor="#e74c3c"
          class="circle"
        >
          <template #format>
            <transition
              enter-active-class="animate__animated  animate__bounceIn"
              leave-active-class="animate__animated  animate__bounceOut"
            >
              <a-icon
                v-show="shutdownPercent <= 0"
                class="icon-power"
                :component="svg_power"
                @click="powerClickHandle"
              />
            </transition>

            <transition
              enter-active-class="animate__animated  animate__fadeIn animate__delay-1s"
            >
              <div v-show="shutdownPercent > 0" class="txt-CountDown-box">
                <div class="txt-CountDown">剩余{{ remainingTime }}</div>
                <a-button size="small" shape="round" @click="cancel"
                  >取消</a-button
                >
              </div>
            </transition>
          </template>
        </a-progress>
      </div>
    </div>
  </a-config-provider>
</template>

<script>
import zhCN from "ant-design-vue/lib/locale-provider/zh_CN";

import svg_power from "./assets/power.svg";

export default {
  name: "App",
  data() {
    return {
      locale: zhCN,
      pattern: 1,
      action: 1,
      patternOptions: [
        { value: 1, txt: "指定时间" },
        { value: 2, txt: "倒计时" },
      ],
      actionOptions: [
        { value: 1, txt: "关机" },
        { value: 2, txt: "重启" },
        { value: 3, txt: "休眠" },
      ],
      svg_power,
      shutdownDate: {
        absolute: {
          date: this.$moment().format("YYYY-MM-DD"),
          time: "",
        },
        relative: {
          hours: 1,
          minutes: 0,
        },
      },
      interval: null, //计时器
      shutdownPercent: 0, //进度条百分比
      remainingTime: "", //剩余时间
    };
  },
  methods: {
    disabledDate(current) {
      return current < this.$moment().endOf("day").add(-1, "days");
    },
    /**关机按钮点击事件 */
    powerClickHandle() {
      clearInterval(this.interval);
      this.shutdownPercent = 0;
      if (this.pattern === 1) {
        let futureTime =
          this.shutdownDate.absolute.date +
          " " +
          this.shutdownDate.absolute.time;
        futureTime = futureTime.trim();
        if (this.$moment().isSameOrAfter(this.$moment(futureTime))) {
          this.confirmShutdown();
        } else {
          this.startCountDown(futureTime);
        }
      } else if (this.pattern === 2) {
        const relativeTime = this.shutdownDate.relative;
        if (relativeTime.hours > 0 || relativeTime.minutes > 0) {
          let futureTime = this.$moment();
          futureTime.add({
            hours: relativeTime.hours,
            minutes: relativeTime.minutes,
          });
          this.startCountDown(futureTime.toDate());
        } else {
          this.confirmShutdown();
        }
      }
    },
    /**开始倒计时 */
    startCountDown(futureTime) {
      let timeDifference = new Date(futureTime) - new Date();
      let fun = () => {
        let realTimeDifference = new Date(futureTime) - new Date();
        this.shutdownPercent = Math.floor(
          (realTimeDifference / timeDifference) * 100
        );
        this.remainingTime = this.$moment().to(futureTime, true);
        if (this.shutdownPercent <= 0) {
          clearInterval(this.interval);
          this.confirmShutdown();
        }
      };
      fun();
      this.interval = setInterval(fun, 1000);
    },
    confirmShutdown() {
      let secondsToGo = 5;
      const actionName = this.actionOptions.find(
        (i) => i.value === this.action
      ).txt;
      let title = `${actionName}将在${secondsToGo}后执行`;
      const modal = this.$confirm({
        title,
        okText: "立即执行",
        cancelText: "取消",
        centered:true,
        onOk: () => {
            this.onShutdown()
            clearInterval(interval)
        },
        onCancel() {
          clearInterval(interval);
        },
      });
      var interval = setInterval(() => {
        secondsToGo -= 1;
        title = `${actionName}将在${secondsToGo}后执行`;
        modal.update({
          title,
        });
        if (secondsToGo <= 0) {
          clearInterval(interval);
          modal.destroy();
          this.onShutdown();
        }
      }, 1000);
    },
    onShutdown() {
      window.BG_API.onShutdown(this.action);
    },
    cancel() {
      clearInterval(this.interval);
      this.shutdownPercent = 0;
    },
  },
};
</script>

<style lang="less">
html {
  overflow: auto;
}
.header {
  background-color: #6e767f;
  color: white;
  height: 90px;
  .ant-select {
    width: 120px;
  }
}
.time-control {
  padding-top: 30px;
  transition: all 1s;
}
.footer {
  padding-top: 35px;
  text-align: center;
  .circle {
    //为了在执行power图标消失前动画时，避免将图标往上挤
    position: relative;
    .txt-CountDown-box {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
  }
  .icon-power {
    font-size: 6em !important;
    cursor: pointer;
  }
  .txt-CountDown-box {
    .txt-CountDown {
      font-size: 12px;
      white-space: nowrap;
    }
    button {
      margin-top: 8px;
    }
  }
}
</style>
