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
  background: var(--noche-surface);
  border: 1px solid var(--noche-border);
  border-radius: 22px;
  box-shadow: 0 18px 40px rgba(44, 46, 42, 0.14);
  overflow: hidden;
}

.paper-confirm-dialog__head {
  padding: 26px 24px 18px;
  text-align: center;
  border-bottom: 1px solid var(--noche-border);
}

.paper-confirm-dialog__title {
  display: block;
  font-size: 24px;
  line-height: 1.35;
  color: var(--noche-text);
}

.paper-confirm-dialog__copy {
  display: block;
  margin-top: 10px;
  font-size: 13px;
  line-height: 1.8;
  color: var(--noche-muted);
}

.paper-confirm-dialog__actions {
  display: flex;
  flex-direction: column;
}

.paper-confirm-dialog__action {
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: center;
  text-align: center;
  background: transparent;
}

.paper-confirm-dialog__action + .paper-confirm-dialog__action {
  border-top: 1px solid var(--noche-border);
}

.paper-confirm-dialog__action-title {
  font-size: 18px;
  line-height: 1.4;
  color: var(--noche-text);
}

.paper-confirm-dialog__action-copy {
  font-size: 12px;
  line-height: 1.7;
  color: var(--noche-muted);
}

.paper-confirm-dialog__action--muted .paper-confirm-dialog__action-title {
  color: var(--noche-muted);
}

.paper-confirm-dialog__action--danger .paper-confirm-dialog__action-title {
  color: #8a3d3a;
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
