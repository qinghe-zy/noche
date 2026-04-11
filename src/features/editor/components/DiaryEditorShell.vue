<template>
  <view class="diary-editor-shell">
    <view class="diary-editor-shell__grain"></view>

    <view class="diary-editor-shell__topbar">
      <TopbarIconButton @tap="$emit('go-back')" />

      <text class="diary-editor-shell__topbar-center literary-text">{{ atmosphereLine }}</text>

      <view
        v-if="mode === 'edit'"
        class="diary-editor-shell__icon-button"
        @tap="$emit('formal-save')"
      >
        <text v-if="showSavedHint" class="diary-editor-shell__saved-hint">已存</text>
        <AppIcon name="check" class="diary-editor-shell__topbar-svg" />
      </view>
      <view
        v-else-if="canContinueWrite"
        class="diary-editor-shell__continue-button"
        @tap="$emit('continue-write')"
      >
        续写
      </view>
      <view v-else class="diary-editor-shell__spacer"></view>
    </view>

    <view class="diary-editor-shell__canvas">
      <view class="diary-editor-shell__header">
        <text class="diary-editor-shell__date">{{ headlineDate }}</text>
        <DiaryPreludeHeaderMeta
          :mode="mode"
          :subtitle="headerSubtitle"
          :time-label="headerTimeLabel"
          :status="diaryPreludeStatus"
          :prelude="diaryPrelude"
          @edit="$emit('edit-diary-prelude')"
        />
      </view>

      <view v-if="errorMessage" class="diary-editor-shell__notice">
        <text>{{ errorMessage }}</text>
      </view>

      <scroll-view class="diary-editor-shell__body" scroll-y>
        <view v-if="attachments.length" class="diary-editor-shell__attachments">
          <view
            v-for="attachment in attachments"
            :key="attachment.id"
            class="diary-editor-shell__attachment-card"
            :class="{ 'diary-editor-shell__attachment-card--focused': focusedAttachmentId === attachment.id }"
            :id="`entry-attachment-${attachment.id}`"
            @click="$emit('preview-attachment', attachment.id)"
          >
            <image class="diary-editor-shell__attachment-image" :src="attachment.localUri" mode="aspectFill" />
            <view
              v-if="mode === 'edit'"
              class="diary-editor-shell__attachment-remove"
              @tap.stop="$emit('remove-attachment', attachment.id)"
            >
              <AppIcon name="close" class="diary-editor-shell__attachment-remove-svg" />
            </view>
          </view>
        </view>

        <textarea
          v-if="mode === 'edit'"
          class="diary-editor-shell__textarea literary-text"
          :value="content"
          auto-height
          maxlength="-1"
          :cursor-spacing="cursorSpacing"
          :show-confirm-bar="false"
          :placeholder="bodyPlaceholder"
          placeholder-class="diary-editor-shell__placeholder"
          @input="$emit('content-input', $event)"
        />

        <view v-else class="diary-editor-shell__read">
          <text class="diary-editor-shell__read-content literary-text">{{ content }}</text>
        </view>
      </scroll-view>

      <view class="diary-editor-shell__footer">
        <view class="diary-editor-shell__footer-tools">
          <view
            class="diary-editor-shell__tool-button"
            @tap="handlePickImagesTrigger"
            @click="handlePickImagesTrigger"
          >
            <AppIcon name="image" class="diary-editor-shell__image-svg" />
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import type { DiaryPreludeMeta, DiaryPreludeStatus } from "@/domain/diaryPrelude/types";
import type { Attachment } from "@/shared/types/attachment";
import DiaryPreludeHeaderMeta from "@/features/editor/components/DiaryPreludeHeaderMeta.vue";
import AppIcon from "@/shared/ui/AppIcon.vue";
import TopbarIconButton from "@/shared/ui/TopbarIconButton.vue";

type EditorMode = "edit" | "read";

let lastPickImagesTriggerAt = 0;

defineProps<{
  mode: EditorMode;
  atmosphereLine: string;
  headlineDate: string;
  headerSubtitle: string;
  headerTimeLabel: string;
  content: string;
  bodyPlaceholder: string;
  errorMessage: string | null;
  showSavedHint: boolean;
  canContinueWrite: boolean;
  cursorSpacing: number;
  stampOpacity: number;
  attachments: Attachment[];
  focusedAttachmentId?: string;
  diaryPreludeStatus: DiaryPreludeStatus;
  diaryPrelude: DiaryPreludeMeta | null;
}>();

const emit = defineEmits<{
  (event: "go-back"): void;
  (event: "formal-save"): void;
  (event: "continue-write"): void;
  (event: "content-input", payload: Event | { detail?: { value?: string } }): void;
  (event: "pick-images"): void;
  (event: "remove-attachment", attachmentId: string): void;
  (event: "preview-attachment", attachmentId: string): void;
  (event: "edit-diary-prelude"): void;
}>();

function handlePickImagesTrigger(): void {
  const now = Date.now();

  if (now - lastPickImagesTriggerAt < 240) {
    return;
  }

  lastPickImagesTriggerAt = now;
  emit("pick-images");
}
</script>

<style scoped>
.diary-editor-shell,
.diary-editor-shell * {
  box-sizing: border-box;
}

.diary-editor-shell {
  min-height: 100vh;
  background: #fbf9f5;
  color: #31332e;
  font-family: "Noto Serif SC", "Source Han Serif SC", serif;
  position: relative;
}

.diary-editor-shell__grain {
  position: fixed;
  inset: 0;
  pointer-events: none;
  opacity: 0.03;
  background:
    linear-gradient(to bottom, rgba(255, 255, 255, 0.82), rgba(255, 255, 255, 0.72)),
    radial-gradient(circle at center, rgba(49, 51, 46, 0.06), transparent 60%);
}

.literary-text {
  letter-spacing: 0.05em;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
}

.diary-editor-shell__topbar {
  position: sticky;
  top: 0;
  z-index: 10;
  display: grid;
  grid-template-columns: 72rpx 1fr 72rpx;
  align-items: center;
  gap: 16rpx;
  padding: 28rpx 36rpx 24rpx;
  background: rgba(251, 249, 245, 0.95);
  backdrop-filter: blur(12rpx);
}

.diary-editor-shell__icon-button {
  width: 72rpx;
  height: 72rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  color: rgba(49, 51, 46, 0.82);
}

.diary-editor-shell__topbar-center {
  text-align: center;
  font-size: 26rpx;
  color: rgba(49, 51, 46, 0.7);
  letter-spacing: 0.28em;
}

.diary-editor-shell__topbar-svg {
  width: 38rpx;
  height: 38rpx;
  color: rgba(49, 51, 46, 0.82);
}

.diary-editor-shell__saved-hint {
  position: absolute;
  top: 4rpx;
  left: 50%;
  transform: translateX(-50%);
  font-family: "Inter", "PingFang SC", sans-serif;
  font-size: 18rpx;
  letter-spacing: 4rpx;
  color: rgba(177, 179, 171, 0.88);
}

.diary-editor-shell__continue-button {
  min-height: 56rpx;
  justify-self: end;
  font-size: 24rpx;
  color: rgba(99, 95, 85, 0.78);
}

.diary-editor-shell__spacer {
  width: 72rpx;
  height: 72rpx;
}

.diary-editor-shell__canvas {
  min-height: calc(100vh - 124rpx);
  padding: 36rpx 48rpx 40rpx;
  display: flex;
  flex-direction: column;
}

.diary-editor-shell__header {
  margin-bottom: 26rpx;
}

.diary-editor-shell__date {
  display: block;
  font-size: 72rpx;
  line-height: 1.08;
  letter-spacing: 0.06em;
  margin-bottom: 16rpx;
}

.diary-editor-shell__notice {
  margin-bottom: 18rpx;
  font-size: 22rpx;
  color: #8a3d3a;
}

.diary-editor-shell__body {
  flex: 1;
  min-height: 0;
}

.diary-editor-shell__attachments {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20rpx;
  margin-bottom: 28rpx;
}

.diary-editor-shell__attachment-card {
  position: relative;
  width: 100%;
  aspect-ratio: 4 / 3;
  padding: 0;
  overflow: hidden;
  border-radius: 24rpx;
  background: rgba(245, 244, 238, 0.85);
}

.diary-editor-shell__attachment-card--focused {
  box-shadow: 0 0 0 2rpx rgba(109, 103, 95, 0.38);
}

.diary-editor-shell__attachment-image {
  width: 100%;
  height: 100%;
}

.diary-editor-shell__attachment-remove {
  position: absolute;
  top: 12rpx;
  right: 12rpx;
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 999rpx;
  background: rgba(251, 249, 245, 0.82);
}

.diary-editor-shell__attachment-remove-svg {
  width: 28rpx;
  height: 28rpx;
  color: rgba(49, 51, 46, 0.72);
}

.diary-editor-shell__textarea,
.diary-editor-shell__read-content {
  width: 100%;
  min-height: 560rpx;
  border: none;
  background: transparent;
  padding: 0;
  color: rgba(49, 51, 46, 0.92);
  font-size: 18px;
  line-height: 2.2;
}

.diary-editor-shell__placeholder {
  color: rgba(177, 179, 171, 0.42);
  font-weight: 300;
}

.diary-editor-shell__read {
  padding-top: 2rpx;
}

.diary-editor-shell__read-content {
  white-space: pre-wrap;
}

.diary-editor-shell__footer {
  margin-top: 36rpx;
  padding-top: 28rpx;
  border-top: 1rpx solid rgba(177, 179, 171, 0.18);
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.diary-editor-shell__footer-tools {
  display: flex;
  align-items: center;
  gap: 28rpx;
}

.diary-editor-shell__tool-button {
  min-width: 44rpx;
  min-height: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.diary-editor-shell__image-svg {
  width: 40rpx;
  height: 40rpx;
  color: rgba(184, 180, 170, 0.9);
}

</style>
