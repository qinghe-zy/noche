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
  backdrop-filter: blur(12px);
}

.paper-confirm-dialog {
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
  color: var(--text-primary, var(--noche-text));
  font-family: var(--font-body, inherit);
}

.paper-confirm-dialog::before {
  content: "";
  position: absolute;
  left: 22px;
  right: 22px;
  top: 14px;
  height: 1px;
  background: var(--noche-dialog-label);
  opacity: 0.65;
}

.paper-confirm-dialog__head {
  padding: 32px 24px 18px;
  text-align: center;
  border-bottom: 1px solid var(--noche-dialog-border-soft);
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.paper-confirm-dialog__title {
  display: block;
  font-size: 24px;
  line-height: 1.35;
  color: var(--noche-dialog-title);
  font-family: var(--font-heading, inherit);
}

.paper-confirm-dialog__copy {
  display: block;
  margin-top: 10px;
  font-size: 13px;
  line-height: 1.8;
  color: var(--noche-dialog-copy);
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
  background: var(--noche-dialog-surface);
}

.paper-confirm-dialog__action + .paper-confirm-dialog__action {
  border-top: 1px solid var(--noche-dialog-border-soft);
}

.paper-confirm-dialog__action-title {
  font-size: 18px;
  line-height: 1.4;
  color: var(--noche-dialog-title);
}

.paper-confirm-dialog__action-copy {
  font-size: 12px;
  line-height: 1.7;
  color: var(--noche-dialog-copy);
}

.paper-confirm-dialog__action--muted .paper-confirm-dialog__action-title {
  color: var(--noche-dialog-copy);
}

.paper-confirm-dialog__action--danger .paper-confirm-dialog__action-title {
  color: var(--noche-dialog-danger);
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
