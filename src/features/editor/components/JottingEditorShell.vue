<template>
  <view class="jotting-editor-shell">
    <view class="jotting-editor-shell__surface">
      <view class="jotting-editor-shell__top-icons">
        <TopbarIconButton @tap="$emit('go-back')" />

        <view
          v-if="mode === 'edit'"
          class="jotting-editor-shell__icon-button"
          @tap="$emit('formal-save')"
        >
          <AppIcon name="check" class="jotting-editor-shell__icon-svg" />
        </view>
        <view
          v-else-if="canContinueWrite"
          class="jotting-editor-shell__continue-button"
          @tap="$emit('continue-write')"
        >
          {{ continueWriteLabel }}
        </view>
        <view v-else class="jotting-editor-shell__spacer"></view>
      </view>

      <view class="jotting-editor-shell__card">
        <view class="jotting-editor-shell__meta">
          <text class="jotting-editor-shell__eyebrow">{{ eyebrowLabel }}</text>
          <text class="jotting-editor-shell__date">{{ headlineDate }}</text>
        </view>

        <view v-if="attachments.length" class="jotting-editor-shell__attachments">
          <view
            v-for="attachment in attachments"
            :key="attachment.id"
            class="jotting-editor-shell__attachment-card"
            :class="{ 'jotting-editor-shell__attachment-card--focused': focusedAttachmentId === attachment.id }"
            :id="`entry-attachment-${attachment.id}`"
            @click="$emit('preview-attachment', attachment.id)"
          >
            <image class="jotting-editor-shell__attachment-image" :src="attachment.localUri" mode="aspectFill" />
            <view
              v-if="mode === 'edit'"
              class="jotting-editor-shell__attachment-remove"
              @tap.stop="$emit('remove-attachment', attachment.id)"
            >
              <AppIcon name="close" class="jotting-editor-shell__attachment-remove-svg" />
            </view>
          </view>
        </view>

        <textarea
          v-if="mode === 'edit'"
          class="jotting-editor-shell__textarea literary-text"
          :value="content"
          auto-height
          adjust-position="false"
          maxlength="-1"
          :cursor-spacing="cursorSpacing"
          :show-confirm-bar="false"
          :placeholder="bodyPlaceholder"
          placeholder-class="jotting-editor-shell__placeholder"
          @input="$emit('content-input', $event)"
        />

        <view v-else class="jotting-editor-shell__read">
          <text class="jotting-editor-shell__read-title">{{ readTitle }}</text>
          <text class="jotting-editor-shell__read-meta">{{ readMeta }}</text>
          <text class="jotting-editor-shell__read-content literary-text">{{ content }}</text>
        </view>

        <view class="jotting-editor-shell__image-trigger">
          <view class="jotting-editor-shell__image-button" @tap="$emit('pick-images')">
            <AppIcon name="image" class="jotting-editor-shell__image-svg" />
          </view>
        </view>
      </view>

      <text class="jotting-editor-shell__signature" :style="{ opacity: stampOpacity }">{{ signatureLine }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import type { Attachment } from "@/shared/types/attachment";
import AppIcon from "@/shared/ui/AppIcon.vue";
import TopbarIconButton from "@/shared/ui/TopbarIconButton.vue";

type EditorMode = "edit" | "read";

defineProps<{
  mode: EditorMode;
  eyebrowLabel: string;
  headlineDate: string;
  content: string;
  bodyPlaceholder: string;
  readTitle: string;
  readMeta: string;
  canContinueWrite: boolean;
  continueWriteLabel: string;
  signatureLine: string;
  cursorSpacing: number;
  stampOpacity: number;
  attachments: Attachment[];
  focusedAttachmentId?: string;
}>();

defineEmits<{
  (event: "go-back"): void;
  (event: "formal-save"): void;
  (event: "continue-write"): void;
  (event: "content-input", payload: Event | { detail?: { value?: string } }): void;
  (event: "pick-images"): void;
  (event: "remove-attachment", attachmentId: string): void;
  (event: "preview-attachment", attachmentId: string): void;
}>();
</script>

<style scoped>
.jotting-editor-shell,
.jotting-editor-shell * {
  box-sizing: border-box;
}

.jotting-editor-shell {
  min-height: 100vh;
  background: var(--noche-bg);
  color: var(--noche-text);
  font-family: "Noto Serif SC", "Source Han Serif SC", serif;
}

.jotting-editor-shell__surface {
  min-height: 100vh;
  padding: 28rpx 32rpx 40rpx;
  display: flex;
  flex-direction: column;
}

.literary-text {
  letter-spacing: 0.05em;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
}

.jotting-editor-shell__top-icons {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 72rpx;
  margin-bottom: 28rpx;
}

.jotting-editor-shell__icon-button {
  width: 72rpx;
  height: 72rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.jotting-editor-shell__icon-svg {
  width: 40rpx;
  height: 40rpx;
  color: var(--noche-muted);
}

.jotting-editor-shell__continue-button {
  min-height: 56rpx;
  font-size: 24rpx;
  color: var(--noche-muted);
}

.jotting-editor-shell__spacer {
  width: 72rpx;
  height: 72rpx;
}

.jotting-editor-shell__card {
  flex: 1;
  margin-top: 128rpx;
  margin-bottom: 80rpx;
  padding: 92rpx 44rpx 40rpx;
  border-radius: 28rpx;
  background: var(--noche-surface);
  box-shadow: 0 8rpx 48rpx rgba(49, 51, 46, 0.06);
  position: relative;
  display: flex;
  flex-direction: column;
}

.jotting-editor-shell__meta {
  margin-bottom: 28rpx;
}

.jotting-editor-shell__eyebrow {
  display: block;
  margin-bottom: 12rpx;
  font-family: "Inter", "PingFang SC", sans-serif;
  font-size: 18rpx;
  letter-spacing: 0.26em;
  text-transform: uppercase;
  color: var(--noche-muted);
}

.jotting-editor-shell__date {
  display: block;
  font-size: 60rpx;
  line-height: 1.14;
  letter-spacing: 0.04em;
}

.jotting-editor-shell__attachments {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16rpx;
  margin-bottom: 20rpx;
}

.jotting-editor-shell__attachment-card {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  padding: 0;
  overflow: hidden;
  border-radius: 20rpx;
  background: var(--noche-panel);
}

.jotting-editor-shell__attachment-card--focused {
  box-shadow: 0 0 0 2rpx rgba(109, 103, 95, 0.38);
}

.jotting-editor-shell__attachment-image {
  width: 100%;
  height: 100%;
}

.jotting-editor-shell__attachment-remove {
  position: absolute;
  top: 10rpx;
  right: 10rpx;
  width: 44rpx;
  height: 44rpx;
  border-radius: 999rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--noche-panel);
}

.jotting-editor-shell__attachment-remove-svg {
  width: 28rpx;
  height: 28rpx;
  color: var(--noche-text);
}

.jotting-editor-shell__textarea,
.jotting-editor-shell__read-content {
  width: 100%;
  flex: 1;
  min-height: 520rpx;
  border: none;
  background: transparent;
  padding: 0;
  color: var(--noche-text);
  font-size: 18px;
  line-height: 2;
}

.jotting-editor-shell__placeholder {
  color: var(--noche-muted);
  font-weight: 300;
}

.jotting-editor-shell__read-title {
  display: block;
  margin-bottom: 16rpx;
  font-size: 40rpx;
  line-height: 1.24;
}

.jotting-editor-shell__read-meta {
  display: block;
  margin-bottom: 24rpx;
  font-family: "Inter", "PingFang SC", sans-serif;
  font-size: 20rpx;
  color: var(--noche-muted);
}

.jotting-editor-shell__read-content {
  white-space: pre-wrap;
}

.jotting-editor-shell__image-trigger {
  position: absolute;
  left: 32rpx;
  bottom: 28rpx;
}

.jotting-editor-shell__image-button {
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.jotting-editor-shell__image-svg {
  width: 32rpx;
  height: 32rpx;
  color: var(--noche-muted);
}

.jotting-editor-shell__signature {
  text-align: center;
  font-size: 20rpx;
  color: var(--noche-muted);
  font-style: italic;
}
</style>
