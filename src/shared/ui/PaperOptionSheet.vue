<template>
  <view
    v-if="open"
    class="paper-option-sheet__mask"
    @tap="handleMaskClose"
  >
    <view class="paper-option-sheet" @tap.stop>
      <view v-if="title || copy" class="paper-option-sheet__head">
        <text v-if="title" class="paper-option-sheet__title">{{ title }}</text>
        <text v-if="copy" class="paper-option-sheet__copy">{{ copy }}</text>
      </view>

      <view class="paper-option-sheet__options">
        <view
          v-for="option in options"
          :key="option.key"
          class="paper-option-sheet__option"
          :class="{
            'paper-option-sheet__option--danger': option.tone === 'danger',
          }"
          @tap="emit('select', option.key)"
        >
          <view class="paper-option-sheet__option-copy">
            <text class="paper-option-sheet__option-title">{{ option.title }}</text>
            <text v-if="option.copy" class="paper-option-sheet__option-copy-text">{{ option.copy }}</text>
          </view>
          <AppIcon v-if="option.trailingIcon" :name="option.trailingIcon" class="paper-option-sheet__option-icon" />
        </view>
      </view>

      <view class="paper-option-sheet__footer" @tap="emit('close')">
        <text class="paper-option-sheet__footer-text">{{ cancelText }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import AppIcon from "@/shared/ui/AppIcon.vue";

export interface PaperOptionSheetOption {
  key: string;
  title: string;
  copy?: string;
  tone?: "default" | "danger";
  trailingIcon?: "chevron-right" | "check";
}

const props = withDefaults(defineProps<{
  open: boolean;
  title?: string;
  copy?: string;
  options: PaperOptionSheetOption[];
  cancelText?: string;
  maskClosable?: boolean;
}>(), {
  title: "",
  copy: "",
  cancelText: "收起",
  maskClosable: true,
});

const emit = defineEmits<{
  (event: "select", key: string): void;
  (event: "close"): void;
}>();

function handleMaskClose(): void {
  if (!props.maskClosable) {
    return;
  }

  emit("close");
}
</script>

<style scoped>
.paper-option-sheet__mask {
  position: fixed;
  inset: 0;
  z-index: 45;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 24px 16px 28px;
  background: var(--noche-overlay);
  backdrop-filter: blur(12px);
}

.paper-option-sheet {
  width: min(100%, 420px);
  max-height: calc(100vh - 56px);
  position: relative;
  background: var(--noche-dialog-surface);
  border: 1px solid var(--noche-dialog-border);
  border-radius: 26px;
  box-shadow: var(--noche-dialog-shadow);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.paper-option-sheet::before {
  content: "";
  position: absolute;
  left: 22px;
  right: 22px;
  top: 14px;
  height: 1px;
  background: var(--noche-dialog-label);
  opacity: 0.65;
}

.paper-option-sheet__head {
  padding: 32px 22px 14px;
  text-align: center;
  border-bottom: 1px solid var(--noche-dialog-border-soft);
  flex-shrink: 0;
}

.paper-option-sheet__title {
  display: block;
  font-size: 22px;
  line-height: 1.35;
  color: var(--noche-dialog-title);
}

.paper-option-sheet__copy {
  display: block;
  margin-top: 8px;
  font-size: 13px;
  line-height: 1.75;
  color: var(--noche-dialog-copy);
}

.paper-option-sheet__options {
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.paper-option-sheet__option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 20px 22px;
}

.paper-option-sheet__option + .paper-option-sheet__option {
  border-top: 1px solid var(--noche-dialog-border-soft);
}

.paper-option-sheet__option-copy {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.paper-option-sheet__option-title {
  font-size: 17px;
  line-height: 1.45;
  color: var(--noche-dialog-title);
}

.paper-option-sheet__option-copy-text {
  font-size: 12px;
  line-height: 1.7;
  color: var(--noche-dialog-copy);
}

.paper-option-sheet__option--danger .paper-option-sheet__option-title {
  color: var(--noche-dialog-danger);
}

.paper-option-sheet__option-icon {
  width: 16px;
  height: 16px;
  color: var(--noche-dialog-copy);
}

.paper-option-sheet__footer {
  border-top: 1px solid var(--noche-dialog-border-soft);
  padding: 16px 22px 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.paper-option-sheet__footer-text {
  font-size: 15px;
  line-height: 1.4;
  color: var(--noche-dialog-copy);
}

.type-scale-small .paper-option-sheet__title { font-size: 21px; }
.type-scale-large .paper-option-sheet__title { font-size: 24px; }
.type-scale-small .paper-option-sheet__copy { font-size: 12px; }
.type-scale-large .paper-option-sheet__copy { font-size: 14px; }
.type-scale-small .paper-option-sheet__option-title { font-size: 16px; }
.type-scale-large .paper-option-sheet__option-title { font-size: 18px; }
.type-scale-small .paper-option-sheet__option-copy-text { font-size: 11px; }
.type-scale-large .paper-option-sheet__option-copy-text { font-size: 13px; }
.type-scale-small .paper-option-sheet__footer-text { font-size: 14px; }
.type-scale-large .paper-option-sheet__footer-text { font-size: 16px; }
</style>
