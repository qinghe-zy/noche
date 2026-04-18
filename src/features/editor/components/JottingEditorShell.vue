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
      <view class="jotting-editor-shell__card">
        <view class="jotting-editor-shell__card-fixed-layer">
          <view class="jotting-editor-shell__meta">
            <text class="jotting-editor-shell__eyebrow">{{ eyebrowLabel }}</text>
            <view class="jotting-editor-shell__meta-date-row">
              <text class="jotting-editor-shell__date">{{ headlineDate }}</text>
              <view
                v-if="showImageAction"
                class="jotting-editor-shell__meta-image-button"
                @tap="$emit('pick-images')"
              >
                <AppIcon name="image" class="jotting-editor-shell__meta-image-icon" />
              </view>
            </view>
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

        <view class="jotting-editor-shell__card-interactive-layer">
          <scroll-view
            class="jotting-editor-shell__body"
            :scroll-y="shouldEnableBodyScroll"
            :scroll-top="writingScrollTop"
            :scroll-with-animation="scrollWithAnimation"
          >
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
                  :style="textareaStyle"
                  @tap.stop="handleTextareaTap"
                  @input="handleTextareaInput"
                  @focus="handleTextareaFocus"
                  @blur="handleTextareaBlur"
                  @linechange="handleLineChange"
                />
              </view>
              <view
                v-if="mode === 'edit'"
                class="jotting-editor-shell__blank-spacer"
                :style="blankSpacerStyle"
                @tap="handleEditorAreaFocus"
              ></view>

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

    <text class="jotting-editor-shell__signature" :style="{ opacity: stampOpacity }">{{ signatureLine }}</text>
  </view>
</template>

<script setup lang="ts">
import { computed, getCurrentInstance, nextTick, onMounted, ref, toRefs, watch } from "vue";
import type { Attachment } from "@/shared/types/attachment";
import {
  estimateEditorCaretLineBottom,
  resolveCaretAwareScrollTop,
  resolveTapCaretLineBottom,
} from "@/features/editor/editorCaretLayout";
import {
  resolveInteractiveLayerHeight,
  rpxToPx as rpxToPxFn,
} from "@/features/editor/composables/useEditorKeyboardViewport";
import { isEditorContentVisuallyEmpty } from "@/features/editor/editorInputRules";
import { useThemeClass } from "@/shared/theme";
import AppIcon from "@/shared/ui/AppIcon.vue";
import TopbarIconButton from "@/shared/ui/TopbarIconButton.vue";

type EditorMode = "edit" | "read";
type QueryRect = { height?: number | null; top?: number | null };
type TextareaInputPayload = { value?: string; cursor?: number };
type TextareaFocusPayload = { cursor?: number };

const instance = getCurrentInstance();
const themeClass = useThemeClass();
const shellFixedHeight = ref(0);
const textareaFocused = ref(false);
const localCursorPosition = ref<number | undefined>(undefined);
const shouldLockCursorToEnd = ref(false);
const hasBodyInteracted = ref(false);
const measuredContentHeight = ref(0);
const writingScrollTop = ref(0);
const scrollWithAnimation = ref(false);
const bodyViewportHeight = ref(0);
const bodyViewportTop = ref(0);
const pendingTapCaretLineBottom = ref<number | null>(null);

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
  showImageAction: boolean;
  // Viewport values passed from EditorPage — avoids a second keyboard listener
  // instance and fixes the double-subtraction bug on Android.
  statusBarHeight: number;
  keyboardVisible: boolean;
  visibleWindowHeight: number;
  minLineGapToKeyboard: number;
  restoreAfterKeyboardHide: number;
  screenWidth: number;
}>();

// Destructure viewport props into reactive refs so all computed properties and
// watchers below work without any other changes.
const {
  statusBarHeight,
  keyboardVisible,
  visibleWindowHeight,
  minLineGapToKeyboard,
  restoreAfterKeyboardHide,
  screenWidth,
} = toRefs(props);

const rpxToPx = (value: number) => rpxToPxFn(value, screenWidth.value);

const emit = defineEmits<{
  (event: "go-back"): void;
  (event: "formal-save"): void;
  (event: "continue-write"): void;
  (event: "title-input", payload: Event | { detail?: { value?: string } }): void;
  (event: "content-input", payload: Event | { detail?: { value?: string } }): void;
  (event: "remove-attachment", attachmentId: string): void;
  (event: "preview-attachment", attachmentId: string): void;
  (event: "pick-images"): void;
  (event: "focus-end-request"): void;
  (event: "content-selection-change", cursor: number): void;
  (event: "editor-focus", cursor: number): void;
  (event: "editor-blur"): void;
}>();

const topbarStyle = computed(() => ({
  paddingTop: `${statusBarHeight.value + rpxToPx(32)}px`,
}));

const interactiveLayerHeight = computed(() =>
  resolveInteractiveLayerHeight(visibleWindowHeight.value, shellFixedHeight.value, 260),
);

const interactiveLayerShellStyle = computed(() => ({
  height: `${interactiveLayerHeight.value}px`,
}));

const editorAvailableWidth = computed(() =>
  Math.max(screenWidth.value - rpxToPx(152), props.writingFontSizePx * 6),
);

const bodyBottomPadding = computed(() =>
  rpxToPx(88) + (keyboardVisible.value ? minLineGapToKeyboard.value : restoreAfterKeyboardHide.value),
);

const bodyStageStyle = computed(() => ({
  minHeight: `${interactiveLayerHeight.value}px`,
  paddingBottom: `${bodyBottomPadding.value}px`,
}));
const showInlinePlaceholder = computed(() =>
  props.mode === "edit"
  && isEditorContentVisuallyEmpty("jotting", props.content)
  && !hasBodyInteracted.value,
);

const renderWritingHeight = computed(() =>
  Math.max(
    measuredContentHeight.value + props.writingLineHeightPx,
    props.writingLineHeightPx * 2,
  ),
);

const writingTextStyle = computed(() => ({
  fontSize: `${props.writingFontSizePx}px`,
  lineHeight: `${props.writingLineHeightPx}px`,
  "--jotting-writing-font-size": `${props.writingFontSizePx}px`,
  "--jotting-writing-line-height": `${props.writingLineHeightPx}px`,
}));

const textareaStyle = computed(() => ({
  ...writingTextStyle.value,
  height: `${renderWritingHeight.value}px`,
}));

const blankSpacerStyle = computed(() => ({
  minHeight: `${Math.max(rpxToPx(80), minLineGapToKeyboard.value)}px`,
}));

const shouldEnableBodyScroll = computed(() => {
  if (bodyViewportHeight.value <= 0) {
    return false;
  }

  const effectiveScrollableHeight = renderWritingHeight.value
    + (props.mode === "edit" && keyboardVisible.value ? minLineGapToKeyboard.value : 0);

  return effectiveScrollableHeight > bodyViewportHeight.value || writingScrollTop.value > 0;
});

const caretLineBottom = computed(() =>
  estimateEditorCaretLineBottom({
    content: props.content,
    cursor: localCursorPosition.value ?? props.cursorPosition,
    availableWidth: editorAvailableWidth.value,
    fontSizePx: props.writingFontSizePx,
    lineHeightPx: props.writingLineHeightPx,
  }),
);

function measureHeights(): void {
  nextTick(() => {
    const publicInstance = instance?.proxy;
    if (!publicInstance || typeof uni === "undefined" || typeof uni.createSelectorQuery !== "function") {
      return;
    }

    const query = uni.createSelectorQuery().in(publicInstance);

    query
      .select(".jotting-editor-shell__fixed-layer")
      .boundingClientRect()
      .select(".jotting-editor-shell__body")
      .boundingClientRect();

    query.exec((results: Array<QueryRect | null | undefined>) => {
      const [fixedLayerRect, bodyRect] = results ?? [];
      shellFixedHeight.value = Math.max(fixedLayerRect?.height ?? 0, 0);

      if (typeof bodyRect?.height === "number") {
        bodyViewportHeight.value = Math.max(bodyRect.height, 0);
      }

      if (typeof bodyRect?.top === "number") {
        bodyViewportTop.value = bodyRect.top;
      }
    });
  });
}

onMounted(() => {
  localCursorPosition.value = props.cursorPosition;
  measureHeights();
  if (props.content.length > 0) {
    const lineCount = Math.max(props.content.split("\n").length, 1);
    measuredContentHeight.value = Math.max(lineCount * props.writingLineHeightPx, props.writingLineHeightPx);
  }
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

    if (keyboardVisible.value && textareaFocused.value) {
      nextTick(() => {
        syncWritingScroll();
      });
    }
  },
);

watch(
  () => [props.attachments.length, props.mode],
  () => {
    measureHeights();
  },
);

watch(
  () => [keyboardVisible.value, visibleWindowHeight.value],
  () => {
    nextTick(() => {
      measureHeights();
      syncWritingScroll();
    });
  },
);

watch(shouldEnableBodyScroll, (enabled) => {
  if (!enabled) {
    scrollWithAnimation.value = false;
    writingScrollTop.value = 0;
  }
});

watch(
  () => props.focusEndRequestKey,
  () => {
    focusEditorToEnd();

    if (keyboardVisible.value) {
      nextTick(() => {
        syncWritingScroll();
      });
    }
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

function handleLineChange(event: Event): void {
  const detail = readEventDetail<{ height?: number }>(event);
  if (typeof detail?.height !== "number") {
    return;
  }

  const lineHeight = props.writingLineHeightPx;
  const normalized = Math.max(Math.ceil(detail.height / lineHeight), 1) * lineHeight;

  if (normalized === measuredContentHeight.value) {
    return;
  }

  const previousHeight = measuredContentHeight.value;
  measuredContentHeight.value = normalized;

  if (keyboardVisible.value && normalized > previousHeight) {
    syncWritingScroll(normalized);
  }
}

function syncWritingScroll(nextContentHeight = measuredContentHeight.value): void {
  const preferredCaretLineBottom = pendingTapCaretLineBottom.value ?? caretLineBottom.value;
  const targetScrollTop = resolveCaretAwareScrollTop({
    caretLineBottom: Math.min(Math.max(preferredCaretLineBottom, props.writingLineHeightPx), nextContentHeight),
    viewportHeight: interactiveLayerHeight.value,
    minLineGapToKeyboard: minLineGapToKeyboard.value,
  });

  if (Math.abs(targetScrollTop - writingScrollTop.value) > 1 || !keyboardVisible.value) {
    scrollWithAnimation.value = false;
    writingScrollTop.value = targetScrollTop;
  }

  pendingTapCaretLineBottom.value = null;
}

function handleTextareaTap(event: Event): void {
  const detail = readEventDetail<{ y?: number }>(event);
  pendingTapCaretLineBottom.value = resolveTapCaretLineBottom({
    tapClientY: detail?.y,
    viewportTop: bodyViewportTop.value,
    currentScrollTop: writingScrollTop.value,
    lineHeightPx: props.writingLineHeightPx,
  });
}

function handleTextareaFocus(event: Event): void {
  textareaFocused.value = true;
  const detail = readEventDetail<TextareaFocusPayload>(event);
  const cursor = typeof detail?.cursor === "number" ? detail.cursor : props.cursorPosition;
  localCursorPosition.value = cursor;
  emit("editor-focus", cursor);

  if (keyboardVisible.value) {
    nextTick(() => {
      syncWritingScroll();
    });
  }

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
  pendingTapCaretLineBottom.value = null;
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
  align-items: stretch;
  overflow: hidden;
}

.jotting-editor-shell__card {
  width: 100%;
  height: 100%;
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

.jotting-editor-shell__meta-date-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24rpx;
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

.jotting-editor-shell__meta-image-button {
  width: 48rpx;
  height: 48rpx;
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--noche-muted);
}

.jotting-editor-shell__meta-image-icon {
  width: 28rpx;
  height: 28rpx;
  color: currentColor;
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
  flex: 1 1 auto;
  min-height: 0;
  overflow: hidden;
  display: flex;
}

.jotting-editor-shell__body {
  flex: 1 1 auto;
  min-height: 0;
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
  flex: 0 0 auto;
  position: relative;
  z-index: 1;
}

.jotting-editor-shell__blank-spacer {
  width: 100%;
  flex: 1 0 auto;
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
