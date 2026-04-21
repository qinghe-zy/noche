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
  background: var(--noche-overlay);
  backdrop-filter: blur(12px);
}

.paper-input-dialog {
  width: min(100%, 420px);
  position: relative;
  background: var(--noche-dialog-surface);
  border: 1px solid var(--noche-dialog-border);
  border-radius: 26px;
  box-shadow: var(--noche-dialog-shadow);
  overflow: hidden;
}

.paper-input-dialog::before {
  content: "";
  position: absolute;
  left: 22px;
  right: 22px;
  top: 14px;
  height: 1px;
  background: var(--noche-dialog-label);
  opacity: 0.65;
}

.paper-input-dialog__head {
  padding: 32px 22px 14px;
  text-align: center;
}

.paper-input-dialog__title {
  display: block;
  font-size: 22px;
  line-height: 1.35;
  color: var(--noche-dialog-title);
}

.paper-input-dialog__copy {
  display: block;
  margin-top: 8px;
  font-size: 13px;
  line-height: 1.75;
  color: var(--noche-dialog-copy);
}

.paper-input-dialog__body {
  padding: 0 22px 18px;
}

.paper-input-dialog__textarea {
  width: 100%;
  min-height: 110px;
  padding: 18px 16px;
  background: var(--noche-dialog-paper);
  border: 1px solid var(--noche-dialog-border);
  border-radius: 16px;
  font-size: 16px;
  line-height: 1.75;
  color: var(--noche-dialog-paper-ink);
}

.paper-input-dialog__actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  border-top: 1px solid var(--noche-dialog-border-soft);
}

.paper-input-dialog__action {
  min-height: 58px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.paper-input-dialog__action + .paper-input-dialog__action {
  border-left: 1px solid var(--noche-dialog-border-soft);
}

.paper-input-dialog__action-text {
  font-size: 16px;
  line-height: 1.4;
  color: var(--noche-dialog-copy);
}

.paper-input-dialog__action-text--primary {
  color: var(--noche-dialog-title);
}

.type-scale-small .paper-input-dialog__title { font-size: 21px; }
.type-scale-large .paper-input-dialog__title { font-size: 24px; }
.type-scale-small .paper-input-dialog__copy { font-size: 12px; }
.type-scale-large .paper-input-dialog__copy { font-size: 14px; }
.type-scale-small .paper-input-dialog__textarea,
.type-scale-small .paper-input-dialog__action-text { font-size: 15px; }
.type-scale-large .paper-input-dialog__textarea,
.type-scale-large .paper-input-dialog__action-text { font-size: 17px; }
</style>
