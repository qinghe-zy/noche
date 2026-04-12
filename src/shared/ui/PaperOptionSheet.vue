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
  background: rgba(44, 46, 42, 0.2);
  backdrop-filter: blur(8px);
}

.paper-option-sheet {
  width: min(100%, 420px);
  background: var(--noche-surface);
  border: 1px solid var(--noche-border);
  border-radius: 24px;
  box-shadow: 0 18px 40px rgba(44, 46, 42, 0.12);
  overflow: hidden;
}

.paper-option-sheet__head {
  padding: 24px 22px 14px;
  text-align: center;
  border-bottom: 1px solid rgba(221, 212, 200, 0.5);
}

.paper-option-sheet__title {
  display: block;
  font-size: 22px;
  line-height: 1.35;
  color: #31332e;
}

.paper-option-sheet__copy {
  display: block;
  margin-top: 8px;
  font-size: 13px;
  line-height: 1.75;
  color: rgba(99, 95, 85, 0.8);
}

.paper-option-sheet__options {
  display: flex;
  flex-direction: column;
}

.paper-option-sheet__option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 20px 22px;
}

.paper-option-sheet__option + .paper-option-sheet__option {
  border-top: 1px solid rgba(221, 212, 200, 0.44);
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
  color: #31332e;
}

.paper-option-sheet__option-copy-text {
  font-size: 12px;
  line-height: 1.7;
  color: rgba(99, 95, 85, 0.68);
}

.paper-option-sheet__option--danger .paper-option-sheet__option-title {
  color: #8a3d3a;
}

.paper-option-sheet__option-icon {
  width: 16px;
  height: 16px;
  color: rgba(138, 129, 120, 0.48);
}

.paper-option-sheet__footer {
  border-top: 1px solid rgba(221, 212, 200, 0.5);
  padding: 16px 22px 18px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.paper-option-sheet__footer-text {
  font-size: 15px;
  line-height: 1.4;
  color: rgba(99, 95, 85, 0.82);
}
</style>
