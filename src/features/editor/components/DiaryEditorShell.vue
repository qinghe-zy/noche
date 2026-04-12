<template>
  <view class="diary-editor-shell noche-mobile-page">
    <view class="diary-editor-shell__grain"></view>

    <view class="diary-editor-shell__topbar">
      <TopbarIconButton @tap="$emit('go-back')" />

      <text class="diary-editor-shell__topbar-center literary-text">{{ atmosphereLine }}</text>

      <view
        v-if="mode === 'edit'"
        class="diary-editor-shell__icon-button"
        @tap="$emit('formal-save')"
      >
        <text v-if="showSavedHint" class="diary-editor-shell__saved-hint">{{ savedHintLabel }}</text>
        <AppIcon name="check" class="diary-editor-shell__topbar-svg" />
      </view>
      <view
        v-else-if="canContinueWrite"
        class="diary-editor-shell__continue-button"
        @tap="$emit('continue-write')"
      >
        {{ continueWriteLabel }}
      </view>
      <view v-else class="diary-editor-shell__spacer"></view>
    </view>

    <view class="diary-editor-shell__canvas noche-mobile-main">
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

      <scroll-view
        :id="writingSurfaceIds.body"
        class="diary-editor-shell__body noche-mobile-scroll"
        :scroll-y="writingScrollEnabled"
        :scroll-top="writingScrollTop"
        :style="writingBodyStyle"
        @scroll="writingSurface.handleScroll"
      >
        <view :id="writingSurfaceIds.content" class="diary-editor-shell__body-fill noche-mobile-scroll-fill">
          <view v-if="attachments.length" class="diary-editor-shell__attachments">
            <view
              v-for="attachment in attachments"
              :key="attachment.id"
              class="diary-editor-shell__attachment-card"
              :class="{ 'diary-editor-shell__attachment-card--focused': focusedAttachmentId === attachment.id }"
              :id="`entry-attachment-${attachment.id}`"
              @click="$emit('preview-attachment', attachment.id)"
            >
              <image class="diary-editor-shell__attachment-image" :src="normalizeLocalImageSrc(attachment.localUri)" mode="aspectFill" />
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
            :id="writingSurfaceIds.surface"
            class="diary-editor-shell__textarea noche-writing-surface literary-text"
            :style="writingSurfaceStyle"
            :value="content"
            auto-height
            adjust-position="false"
            maxlength="-1"
            :show-confirm-bar="false"
            :placeholder="bodyPlaceholder"
            placeholder-class="diary-editor-shell__placeholder"
            @blur="writingSurface.handleBlur"
            @focus="writingSurface.handleFocus"
            @input="handleWritingInput"
            @keyboardheightchange="writingSurface.handleKeyboardHeightChange"
            @linechange="writingSurface.handleLineChange"
          />

          <view v-else class="diary-editor-shell__read">
            <text
              :id="writingSurfaceIds.surface"
              class="diary-editor-shell__read-content noche-writing-surface literary-text"
              :style="writingSurfaceStyle"
            >{{ content }}</text>
          </view>
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
import { computed, toRefs } from "vue";
import type { DiaryPreludeMeta, DiaryPreludeStatus } from "@/domain/diaryPrelude/types";
import type { Attachment } from "@/shared/types/attachment";
import { useWritingSurfaceController } from "@/features/editor/composables/useWritingSurfaceController";
import DiaryPreludeHeaderMeta from "@/features/editor/components/DiaryPreludeHeaderMeta.vue";
import AppIcon from "@/shared/ui/AppIcon.vue";
import TopbarIconButton from "@/shared/ui/TopbarIconButton.vue";
import { normalizeLocalImageSrc } from "@/shared/utils/localFiles";

type EditorMode = "edit" | "read";

let lastPickImagesTriggerAt = 0;

const props = defineProps<{
  mode: EditorMode;
  atmosphereLine: string;
  headlineDate: string;
  headerSubtitle: string;
  headerTimeLabel: string;
  content: string;
  bodyPlaceholder: string;
  savedHintLabel: string;
  errorMessage: string | null;
  showSavedHint: boolean;
  canContinueWrite: boolean;
  continueWriteLabel: string;
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
const {
  attachments,
  atmosphereLine,
  bodyPlaceholder,
  canContinueWrite,
  content,
  continueWriteLabel,
  diaryPrelude,
  diaryPreludeStatus,
  errorMessage,
  focusedAttachmentId,
  headerSubtitle,
  headerTimeLabel,
  headlineDate,
  mode,
  savedHintLabel,
  showSavedHint,
  stampOpacity,
} = toRefs(props);
const surfaceLayoutSignature = computed(() => [
  props.mode,
  props.attachments.length,
  props.focusedAttachmentId ?? "none",
  props.errorMessage ?? "clean",
].join(":"));
const writingSurface = useWritingSurfaceController({
  variant: "diary",
  mode,
  content,
  layoutSignature: surfaceLayoutSignature,
});
const writingSurfaceIds = writingSurface.ids;
const writingBodyStyle = writingSurface.bodyStyle;
const writingScrollEnabled = writingSurface.scrollEnabled;
const writingScrollTop = writingSurface.scrollTop;
const writingSurfaceStyle = computed(() => writingSurface.surfaceStyle.value);

function handleWritingInput(event: Event | { detail?: { value?: string; cursor?: number } }): void {
  writingSurface.handleInput(event);
  emit("content-input", event);
}

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
  background: var(--noche-bg);
  color: var(--noche-text);
  font-family: "Noto Serif SC", "Source Han Serif SC", serif;
  position: relative;
}

.diary-editor-shell__grain {
  position: fixed;
  inset: 0;
  pointer-events: none;
  opacity: 0.03;
  background:
    linear-gradient(to bottom, rgba(var(--noche-shadow-rgb), 0.02), rgba(var(--noche-shadow-rgb), 0.01)),
    radial-gradient(circle at center, rgba(var(--noche-paper-shadow-rgb), 0.06), transparent 60%);
}

.literary-text {
  letter-spacing: 0.05em;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
}

.diary-editor-shell__topbar {
  z-index: 10;
  display: grid;
  grid-template-columns: 72rpx 1fr 72rpx;
  align-items: center;
  min-height: var(--noche-nav-bar-height);
  gap: 16rpx;
  padding: var(--noche-status-bar-height) var(--noche-topbar-padding-x) 0;
  background: var(--noche-surface);
  backdrop-filter: blur(12rpx);
  flex-shrink: 0;
}

.diary-editor-shell__icon-button {
  width: 72rpx;
  height: 72rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  color: var(--noche-text);
}

.diary-editor-shell__topbar-center {
  text-align: center;
  font-size: 26rpx;
  color: var(--noche-muted);
  letter-spacing: 0.28em;
}

.diary-editor-shell__topbar-svg {
  width: 38rpx;
  height: 38rpx;
  color: var(--noche-text);
}

.diary-editor-shell__saved-hint {
  position: absolute;
  top: 4rpx;
  left: 50%;
  transform: translateX(-50%);
  font-family: "Inter", "PingFang SC", sans-serif;
  font-size: 18rpx;
  letter-spacing: 4rpx;
  color: var(--noche-muted);
}

.diary-editor-shell__continue-button {
  min-height: 56rpx;
  justify-self: end;
  font-size: 24rpx;
  color: var(--noche-muted);
}

.diary-editor-shell__spacer {
  width: 72rpx;
  height: 72rpx;
}

.diary-editor-shell__canvas {
  min-height: var(--noche-content-min-height);
  padding: var(--noche-page-section-gap) calc(var(--noche-page-padding-x) + 8px) var(--noche-page-bottom-padding);
  display: flex;
  flex-direction: column;
}

.diary-editor-shell__header {
  margin-bottom: 20rpx;
}

.diary-editor-shell__date {
  display: block;
  font-size: 72rpx;
  line-height: 1.08;
  letter-spacing: 0.06em;
  margin-bottom: 16rpx;
}

.diary-editor-shell__notice {
  margin-bottom: 14rpx;
  font-size: 22rpx;
  color: var(--noche-danger);
}

.diary-editor-shell__body {
  flex: 1;
  min-height: 0;
}

.diary-editor-shell__body-fill {
  gap: 0;
}

.diary-editor-shell__attachments {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16rpx;
  margin-bottom: 20rpx;
}

.diary-editor-shell__attachment-card {
  position: relative;
  width: 100%;
  aspect-ratio: 4 / 3;
  padding: 0;
  overflow: hidden;
  border-radius: 24rpx;
  background: var(--noche-surface);
}

.diary-editor-shell__attachment-card--focused {
  box-shadow: 0 0 0 2rpx rgba(var(--noche-paper-shadow-rgb), 0.38);
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
  background: var(--noche-panel);
}

.diary-editor-shell__attachment-remove-svg {
  width: 28rpx;
  height: 28rpx;
  color: var(--noche-text);
}

.diary-editor-shell__textarea,
.diary-editor-shell__read-content {
  width: 100%;
  border: none;
  background: transparent;
  padding-right: 0;
  padding-bottom: 0;
  padding-left: 0;
  color: var(--noche-text);
  font-size: 18px;
}

.diary-editor-shell__placeholder {
  color: var(--noche-muted);
  font-weight: 300;
}

.diary-editor-shell__read {
  padding-top: 2rpx;
}

.diary-editor-shell__read-content {
  white-space: pre-wrap;
}

.diary-editor-shell__footer {
  margin-top: 24rpx;
  padding-top: 18rpx;
  border-top: 1rpx solid var(--noche-border);
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
  color: var(--noche-muted);
}

</style>
