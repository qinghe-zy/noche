<template>
  <view
    v-if="open"
    class="paper-confirm-dialog__mask"
    @tap="handleMaskClose"
  >
    <view class="paper-confirm-dialog" @tap.stop>
      <view class="paper-confirm-dialog__head">
        <text class="paper-confirm-dialog__title">{{ title }}</text>
        <text v-if="copy" class="paper-confirm-dialog__copy">{{ copy }}</text>
      </view>

      <view class="paper-confirm-dialog__actions">
        <view
          v-for="action in actions"
          :key="action.key"
          class="paper-confirm-dialog__action"
          :class="{
            'paper-confirm-dialog__action--muted': action.tone === 'muted',
            'paper-confirm-dialog__action--danger': action.tone === 'danger',
          }"
          @tap="emit('action', action.key)"
        >
          <text class="paper-confirm-dialog__action-title">{{ action.title }}</text>
          <text v-if="action.copy" class="paper-confirm-dialog__action-copy">{{ action.copy }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
export interface PaperConfirmDialogAction {
  key: string;
  title: string;
  copy?: string;
  tone?: "default" | "muted" | "danger";
}

const props = withDefaults(defineProps<{
  open: boolean;
  title: string;
  copy?: string;
  actions: PaperConfirmDialogAction[];
  maskClosable?: boolean;
}>(), {
  copy: "",
  maskClosable: true,
});

const emit = defineEmits<{
  (event: "action", key: string): void;
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
.paper-confirm-dialog__mask {
  position: fixed;
  inset: 0;
  z-index: 40;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 24px 16px 28px;
  background: var(--noche-overlay);
  backdrop-filter: blur(8px);
}

.paper-confirm-dialog {
  width: min(100%, 420px);
  max-height: calc(100vh - 56px);
  background: var(--surface-primary, var(--noche-surface));
  border: 1px solid var(--border-subtle, var(--noche-border));
  border-radius: 22px;
  box-shadow: var(--shadow-whisper, 0 18px 40px rgba(44, 46, 42, 0.14));
  overflow: hidden;
  display: flex;
  flex-direction: column;
  color: var(--text-primary, var(--noche-text));
  font-family: var(--font-body, inherit);
}

.paper-confirm-dialog__head {
  padding: 26px 24px 18px;
  text-align: center;
  border-bottom: 1px solid var(--border-subtle, var(--noche-border));
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.paper-confirm-dialog__title {
  display: block;
  font-size: 24px;
  line-height: 1.35;
  color: var(--text-primary, var(--noche-text));
  font-family: var(--font-heading, inherit);
}

.paper-confirm-dialog__copy {
  display: block;
  margin-top: 10px;
  font-size: 13px;
  line-height: 1.8;
  color: var(--text-secondary, var(--noche-muted));
}

.paper-confirm-dialog__actions {
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.paper-confirm-dialog__action {
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: center;
  text-align: center;
  background: var(--button-primary-bg, transparent);
  border: 1px solid var(--button-primary-border, transparent);
  box-shadow: var(--button-primary-shadow, none);
  border-radius: var(--button-radius, 18px);
  margin: 10px 16px 0;
}

.paper-confirm-dialog__action + .paper-confirm-dialog__action {
  border-top: none;
}

.paper-confirm-dialog__action-title {
  font-size: 18px;
  line-height: 1.4;
  color: var(--button-primary-text, var(--text-primary, var(--noche-text)));
}

.paper-confirm-dialog__action-copy {
  font-size: 12px;
  line-height: 1.7;
  color: color-mix(in srgb, var(--button-primary-text, var(--text-primary, var(--noche-text))) 72%, transparent);
}

.paper-confirm-dialog__action--muted .paper-confirm-dialog__action-title {
  color: var(--button-secondary-text, var(--text-secondary, var(--noche-muted)));
}

.paper-confirm-dialog__action--muted {
  background: var(--button-secondary-bg, transparent);
  border: 1px solid var(--button-secondary-border, var(--border-subtle, var(--noche-border)));
  box-shadow: var(--button-secondary-shadow, none);
}

.paper-confirm-dialog__action--danger .paper-confirm-dialog__action-title {
  color: var(--button-danger-text, #8a3d3a);
}

.paper-confirm-dialog__action--danger {
  background: color-mix(in srgb, var(--button-primary-bg, #c96442) 12%, transparent);
  border-color: color-mix(in srgb, var(--button-primary-bg, #c96442) 22%, transparent);
  box-shadow: none;
}

.type-scale-small .paper-confirm-dialog__title { font-size: 23px; }
.type-scale-large .paper-confirm-dialog__title { font-size: 26px; }
.type-scale-small .paper-confirm-dialog__copy { font-size: 12px; }
.type-scale-large .paper-confirm-dialog__copy { font-size: 14px; }
.type-scale-small .paper-confirm-dialog__action-title { font-size: 17px; }
.type-scale-large .paper-confirm-dialog__action-title { font-size: 19px; }
.type-scale-small .paper-confirm-dialog__action-copy { font-size: 11px; }
.type-scale-large .paper-confirm-dialog__action-copy { font-size: 13px; }
</style>
