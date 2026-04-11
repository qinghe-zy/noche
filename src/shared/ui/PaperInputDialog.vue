<template>
  <view
    v-if="open"
    class="paper-input-dialog__mask"
    @tap="handleMaskClose"
  >
    <view class="paper-input-dialog" @tap.stop>
      <view class="paper-input-dialog__head">
        <text class="paper-input-dialog__title">{{ title }}</text>
        <text v-if="copy" class="paper-input-dialog__copy">{{ copy }}</text>
      </view>

      <view class="paper-input-dialog__body">
        <textarea
          :value="draftValue"
          :maxlength="maxlength"
          :placeholder="placeholder"
          :auto-height="true"
          class="paper-input-dialog__textarea"
          @input="handleInput"
        />
      </view>

      <view class="paper-input-dialog__actions">
        <view class="paper-input-dialog__action paper-input-dialog__action--muted" @tap="emit('close')">
          <text class="paper-input-dialog__action-text">{{ cancelText }}</text>
        </view>
        <view class="paper-input-dialog__action paper-input-dialog__action--primary" @tap="emit('confirm', draftValue)">
          <text class="paper-input-dialog__action-text paper-input-dialog__action-text--primary">{{ confirmText }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";

const props = withDefaults(defineProps<{
  open: boolean;
  title: string;
  copy?: string;
  value?: string;
  placeholder?: string;
  confirmText?: string;
  cancelText?: string;
  maxlength?: number;
  maskClosable?: boolean;
}>(), {
  copy: "",
  value: "",
  placeholder: "",
  confirmText: "保存",
  cancelText: "取消",
  maxlength: 60,
  maskClosable: true,
});

const emit = defineEmits<{
  (event: "confirm", value: string): void;
  (event: "close"): void;
}>();

const draftValue = ref(props.value);

watch(
  () => props.value,
  (nextValue) => {
    draftValue.value = nextValue;
  },
);

watch(
  () => props.open,
  (nextOpen) => {
    if (nextOpen) {
      draftValue.value = props.value;
    }
  },
);

function handleMaskClose(): void {
  if (!props.maskClosable) {
    return;
  }

  emit("close");
}

function handleInput(event: Event): void {
  const nextValue = (event as Event & { detail?: { value?: string } }).detail?.value;
  draftValue.value = nextValue ?? "";
}
</script>

<style scoped>
.paper-input-dialog__mask {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px 16px;
  background: rgba(44, 46, 42, 0.2);
  backdrop-filter: blur(8px);
}

.paper-input-dialog {
  width: min(100%, 420px);
  background: rgba(252, 248, 241, 0.98);
  border: 1px solid rgba(213, 204, 191, 0.78);
  border-radius: 24px;
  box-shadow: 0 18px 40px rgba(44, 46, 42, 0.12);
  overflow: hidden;
}

.paper-input-dialog__head {
  padding: 24px 22px 12px;
  text-align: center;
}

.paper-input-dialog__title {
  display: block;
  font-size: 22px;
  line-height: 1.35;
  color: #31332e;
}

.paper-input-dialog__copy {
  display: block;
  margin-top: 8px;
  font-size: 13px;
  line-height: 1.75;
  color: rgba(99, 95, 85, 0.8);
}

.paper-input-dialog__body {
  padding: 0 22px 20px;
}

.paper-input-dialog__textarea {
  width: 100%;
  min-height: 110px;
  padding: 16px 0;
  background: transparent;
  border: none;
  border-top: 1px solid rgba(221, 212, 200, 0.44);
  border-bottom: 1px solid rgba(221, 212, 200, 0.44);
  font-size: 16px;
  line-height: 1.75;
  color: #31332e;
}

.paper-input-dialog__actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  border-top: 1px solid rgba(221, 212, 200, 0.44);
}

.paper-input-dialog__action {
  min-height: 58px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.paper-input-dialog__action + .paper-input-dialog__action {
  border-left: 1px solid rgba(221, 212, 200, 0.44);
}

.paper-input-dialog__action-text {
  font-size: 16px;
  line-height: 1.4;
  color: rgba(99, 95, 85, 0.82);
}

.paper-input-dialog__action-text--primary {
  color: #31332e;
}
</style>
