<template>
  <view class="jotting-editor-shell" :class="themeClass">
    <view class="jotting-editor-shell__fixed-layer">
      <view class="jotting-editor-shell__top-icons" :style="topbarStyle">
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
    </view>

    <view class="jotting-editor-shell__interactive-layer" :style="interactiveLayerShellStyle">
      <view class="jotting-editor-shell__card" :style="cardStyle">
        <view class="jotting-editor-shell__card-fixed-layer">
          <view class="jotting-editor-shell__meta">
            <text class="jotting-editor-shell__eyebrow">{{ eyebrowLabel }}</text>
            <text class="jotting-editor-shell__date">{{ headlineDate }}</text>
            <input
              v-if="mode === 'edit'"
              class="jotting-editor-shell__title-input"
              :value="title"
              :placeholder="titlePlaceholder"
              placeholder-class="jotting-editor-shell__title-placeholder"
              maxlength="40"
              @input="$emit('title-input', $event)"
            />
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
        </view>

        <view class="jotting-editor-shell__card-interactive-layer" :style="cardInteractiveLayerStyle">
          <scroll-view class="jotting-editor-shell__body" scroll-y :style="bodyStyle">
            <view class="jotting-editor-shell__body-stage" :style="bodyStageStyle" @tap="handleEditorAreaFocus">
              <view v-if="mode === 'edit'" class="jotting-editor-shell__editor-field">
                <view v-if="showInlinePlaceholder" class="jotting-editor-shell__inline-placeholder">
                  {{ bodyPlaceholder }}
                </view>
                <textarea
                  class="jotting-editor-shell__textarea literary-text"
                  :value="content"
                  :focus="textareaFocused"
                  :cursor="localCursorPosition"
                  adjust-position="false"
                  disable-default-padding
                  maxlength="-1"
                  :cursor-spacing="cursorSpacing"
                  :show-confirm-bar="false"
                  :placeholder="showInlinePlaceholder ? '' : bodyPlaceholder"
                  placeholder-class="jotting-editor-shell__placeholder"
                  :style="writingTextStyle"
                  @tap.stop
                  @input="handleTextareaInput"
                  @focus="handleTextareaFocus"
                  @blur="handleTextareaBlur"
                />
              </view>

              <view v-else class="jotting-editor-shell__read">
                <text v-if="readTitle" class="jotting-editor-shell__read-title">{{ readTitle }}</text>
                <text class="jotting-editor-shell__read-meta">{{ readMeta }}</text>
                <text class="jotting-editor-shell__read-content literary-text" :style="writingTextStyle">{{ content }}</text>
              </view>
            </view>
          </scroll-view>
        </view>
      </view>
    </view>

    <view v-if="mode === 'edit'" class="jotting-editor-shell__floating-attachment" :style="floatingAttachmentStyle">
      <view class="jotting-editor-shell__image-button" @tap="$emit('pick-images')">
        <AppIcon name="image" class="jotting-editor-shell__image-svg" />
      </view>
    </view>

    <text class="jotting-editor-shell__signature" :style="{ opacity: stampOpacity }">{{ signatureLine }}</text>
  </view>
</template>

<script setup lang="ts">
import { computed, getCurrentInstance, nextTick, onMounted, ref, watch } from "vue";
import type { Attachment } from "@/shared/types/attachment";
import { useEditorKeyboardViewport } from "@/features/editor/composables/useEditorKeyboardViewport";
import { isEditorContentVisuallyEmpty } from "@/features/editor/editorInputRules";
import { useThemeClass } from "@/shared/theme";
import AppIcon from "@/shared/ui/AppIcon.vue";
import TopbarIconButton from "@/shared/ui/TopbarIconButton.vue";

type EditorMode = "edit" | "read";
type QueryRect = { height?: number | null };
type TextareaInputPayload = { value?: string; cursor?: number };
type TextareaFocusPayload = { cursor?: number };

const instance = getCurrentInstance();
const themeClass = useThemeClass();
const shellFixedHeight = ref(0);
const cardFixedHeight = ref(0);
const textareaFocused = ref(false);
const localCursorPosition = ref<number | undefined>(undefined);
const shouldLockCursorToEnd = ref(false);
const hasBodyInteracted = ref(false);
const {
  statusBarHeight,
  keyboardHeight,
  keyboardVisible,
  attachmentDockBottom,
  minLineGapToKeyboard,
  restoreAfterKeyboardHide,
  windowHeight,
  rpxToPx,
} = useEditorKeyboardViewport();

const topbarStyle = computed(() => ({
  paddingTop: `${statusBarHeight.value + rpxToPx(32)}px`,
}));

const interactiveLayerHeight = computed(() =>
  Math.max(windowHeight.value - shellFixedHeight.value - (keyboardVisible.value ? keyboardHeight.value : 0), 260),
);

const interactiveLayerShellStyle = computed(() => ({
  height: `${interactiveLayerHeight.value}px`,
}));

const cardTopGap = computed(() => rpxToPx(keyboardVisible.value ? 40 : 96));

const cardBottomGap = computed(() => rpxToPx(keyboardVisible.value ? 112 : 220));

const cardVisualHeight = computed(() =>
  Math.max(
    interactiveLayerHeight.value - cardTopGap.value - cardBottomGap.value,
    Math.min(interactiveLayerHeight.value - rpxToPx(104), 260),
  ),
);

const cardStyle = computed(() => ({
  height: `${cardVisualHeight.value}px`,
}));

const cardInteractiveLayerHeight = computed(() =>
  Math.max(cardVisualHeight.value - cardFixedHeight.value - rpxToPx(72), 180),
);

const cardInteractiveLayerStyle = computed(() => ({
  height: `${cardInteractiveLayerHeight.value}px`,
}));

const bodyBottomPadding = computed(() =>
  rpxToPx(88) + (keyboardVisible.value ? minLineGapToKeyboard.value : restoreAfterKeyboardHide.value),
);

const bodyStyle = computed(() => ({
  height: `${cardInteractiveLayerHeight.value}px`,
}));

const bodyStageStyle = computed(() => ({
  minHeight: `${cardInteractiveLayerHeight.value}px`,
  paddingBottom: `${bodyBottomPadding.value}px`,
}));
const showInlinePlaceholder = computed(() =>
  props.mode === "edit"
  && isEditorContentVisuallyEmpty("jotting", props.content)
  && !hasBodyInteracted.value,
);

const floatingAttachmentStyle = computed(() => ({
  bottom: `${attachmentDockBottom.value}px`,
}));
const writingTextStyle = computed(() => ({
  fontSize: `${props.writingFontSizePx}px`,
  lineHeight: `${props.writingLineHeightPx}px`,
  "--jotting-writing-font-size": `${props.writingFontSizePx}px`,
  "--jotting-writing-line-height": `${props.writingLineHeightPx}px`,
}));

const props = defineProps<{
  mode: EditorMode;
  eyebrowLabel: string;
  headlineDate: string;
  title: string;
  titlePlaceholder: string;
  content: string;
  bodyPlaceholder: string;
  readTitle: string;
  readMeta: string;
  canContinueWrite: boolean;
  continueWriteLabel: string;
  signatureLine: string;
  cursorSpacing: number;
  writingFontSizePx: number;
  writingLineHeightPx: number;
  cursorPosition: number;
  focusEndRequestKey: number;
  stampOpacity: number;
  attachments: Attachment[];
  focusedAttachmentId?: string;
}>();

const emit = defineEmits<{
  (event: "go-back"): void;
  (event: "formal-save"): void;
  (event: "continue-write"): void;
  (event: "title-input", payload: Event | { detail?: { value?: string } }): void;
  (event: "content-input", payload: Event | { detail?: { value?: string } }): void;
  (event: "pick-images"): void;
  (event: "remove-attachment", attachmentId: string): void;
  (event: "preview-attachment", attachmentId: string): void;
  (event: "focus-end-request"): void;
  (event: "content-selection-change", cursor: number): void;
  (event: "editor-focus", cursor: number): void;
  (event: "editor-blur"): void;
}>();

function measureHeights(): void {
  nextTick(() => {
    const publicInstance = instance?.proxy;
    if (!publicInstance || typeof uni === "undefined" || typeof uni.createSelectorQuery !== "function") {
      return;
    }

    const query = uni.createSelectorQuery().in(publicInstance);

    query
      .select(".jotting-editor-shell__fixed-layer")
      .boundingClientRect((result: QueryRect | QueryRect[]) => {
        const rect = Array.isArray(result) ? result[0] : result;
        shellFixedHeight.value = Math.max(rect?.height ?? 0, 0);
      });

    query
      .select(".jotting-editor-shell__card-fixed-layer")
      .boundingClientRect((result: QueryRect | QueryRect[]) => {
        const rect = Array.isArray(result) ? result[0] : result;
        cardFixedHeight.value = Math.max(rect?.height ?? 0, 0);
      })
      .exec();
  });
}

onMounted(() => {
  localCursorPosition.value = props.cursorPosition;
  measureHeights();
});

watch(
  () => props.content,
  (nextContent) => {
    if (!shouldLockCursorToEnd.value) {
      return;
    }

    localCursorPosition.value = nextContent.length;
  },
);

watch(
  () => props.cursorPosition,
  (nextCursor) => {
    if (shouldLockCursorToEnd.value) {
      return;
    }

    localCursorPosition.value = nextCursor;
  },
);

watch(
  () => [props.attachments.length, props.mode],
  () => {
    measureHeights();
  },
);

watch(
  () => props.focusEndRequestKey,
  () => {
    focusEditorToEnd();
  },
);

function releaseCursorLock(): void {
  shouldLockCursorToEnd.value = false;
  localCursorPosition.value = undefined;
}

function focusEditorToEnd(): void {
  shouldLockCursorToEnd.value = true;
  localCursorPosition.value = props.content.length;

  if (!textareaFocused.value) {
    textareaFocused.value = true;
    return;
  }

  nextTick(() => {
    releaseCursorLock();
  });
}

function handleEditorAreaFocus(): void {
  if (props.mode !== "edit") {
    return;
  }

  emit("focus-end-request");
}

function readEventDetail<T>(event: Event): T | undefined {
  return (event as Event & { detail?: T }).detail;
}

function handleTextareaInput(event: Event): void {
  hasBodyInteracted.value = true;
  const detail = readEventDetail<TextareaInputPayload>(event);
  const cursor = typeof detail?.cursor === "number" ? detail.cursor : props.cursorPosition;
  localCursorPosition.value = cursor;
  emit("content-selection-change", cursor);
  emit("content-input", event);
}

function handleTextareaFocus(event: Event): void {
  textareaFocused.value = true;
  const detail = readEventDetail<TextareaFocusPayload>(event);
  const cursor = typeof detail?.cursor === "number" ? detail.cursor : props.cursorPosition;
  localCursorPosition.value = cursor;
  emit("editor-focus", cursor);

  if (!shouldLockCursorToEnd.value) {
    return;
  }

  if (typeof requestAnimationFrame === "function") {
    requestAnimationFrame(releaseCursorLock);
    return;
  }

  setTimeout(releaseCursorLock, 0);
}

function handleTextareaBlur(): void {
  textareaFocused.value = false;
  releaseCursorLock();
  emit("editor-blur");
}
</script>

<style scoped>
.jotting-editor-shell,
.jotting-editor-shell * {
  box-sizing: border-box;
}

.jotting-editor-shell {
  height: 100vh;
  background: var(--noche-bg);
  color: var(--noche-text);
  font-family: "Noto Serif SC", "Source Han Serif SC", serif;
  overflow: hidden;
  position: relative;
  display: flex;
  flex-direction: column;
}

.jotting-editor-shell__fixed-layer {
  position: relative;
  z-index: 2;
  flex: 0 0 auto;
}

.jotting-editor-shell__top-icons {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 88rpx;
  padding-left: 32rpx;
  padding-right: 32rpx;
  margin-bottom: 28rpx;
}

.jotting-editor-shell__icon-button {
  width: 88rpx;
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.jotting-editor-shell__icon-svg {
  width: 44rpx;
  height: 44rpx;
  color: var(--noche-muted);
}

.jotting-editor-shell__continue-button {
  min-height: 56rpx;
  font-size: 24rpx;
  color: var(--noche-muted);
}

.jotting-editor-shell__spacer {
  width: 88rpx;
  height: 88rpx;
}

.jotting-editor-shell__interactive-layer {
  position: relative;
  flex: 0 0 auto;
  min-height: 0;
  padding: 32rpx 32rpx 72rpx;
  display: flex;
  align-items: flex-start;
  overflow: hidden;
}

.jotting-editor-shell__card {
  width: 100%;
  padding: 92rpx 44rpx 40rpx;
  border-radius: 28rpx;
  background: var(--noche-surface);
  box-shadow: 0 8rpx 48rpx rgba(49, 51, 46, 0.06);
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.jotting-editor-shell__card-fixed-layer {
  flex: 0 0 auto;
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

.jotting-editor-shell__title-input {
  width: 100%;
  min-height: 56rpx;
  margin-top: 14rpx;
  border: none;
  background: transparent;
  padding: 0;
  color: var(--noche-text);
  font-size: 28rpx;
  line-height: 1.4;
}

.jotting-editor-shell__title-placeholder {
  color: var(--noche-muted);
  font-weight: 300;
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

.jotting-editor-shell__card-interactive-layer {
  min-height: 0;
  overflow: hidden;
}

.jotting-editor-shell__body {
  height: 100%;
}

.jotting-editor-shell__body-stage {
  min-height: 100%;
  display: flex;
  flex-direction: column;
}

.jotting-editor-shell__textarea,
.jotting-editor-shell__read-content {
  width: 100%;
  min-height: 100%;
  border: none;
  background: transparent;
  padding: 0;
  color: var(--noche-text);
  font-size: 18px;
  line-height: 2;
}

.jotting-editor-shell__editor-field {
  flex: 1 0 auto;
  min-height: 100%;
  display: flex;
  position: relative;
}

.jotting-editor-shell__textarea {
  flex: 1 1 auto;
  position: relative;
  z-index: 1;
}

.jotting-editor-shell__placeholder {
  color: var(--noche-muted);
  font-weight: 300;
}

.jotting-editor-shell__inline-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  color: var(--noche-muted);
  font-size: var(--jotting-writing-font-size, 18px);
  line-height: var(--jotting-writing-line-height, 36px);
  pointer-events: none;
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

.jotting-editor-shell__floating-attachment {
  position: absolute;
  left: 64rpx;
  z-index: 3;
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
  position: absolute;
  right: 40rpx;
  bottom: 24rpx;
  font-size: 20rpx;
  color: var(--noche-muted);
  font-style: italic;
  pointer-events: none;
}
</style>
