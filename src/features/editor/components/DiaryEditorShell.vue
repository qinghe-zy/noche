<template>
  <view class="diary-editor-shell" :class="themeClass">
    <view class="diary-editor-shell__grain"></view>

    <view class="diary-editor-shell__fixed-layer">
      <view class="diary-editor-shell__topbar" :style="topbarStyle">
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

      <view class="diary-editor-shell__header">
        <text class="diary-editor-shell__date">{{ headlineDate }}</text>
        <input
          v-if="mode === 'edit'"
          class="diary-editor-shell__title-input"
          :value="title"
          :placeholder="titlePlaceholder"
          placeholder-class="diary-editor-shell__title-placeholder"
          maxlength="40"
          @input="$emit('title-input', $event)"
        />
        <DiaryPreludeHeaderMeta
          :mode="mode"
          :subtitle="headerSubtitle"
          :time-label="headerTimeLabel"
          :status="diaryPreludeStatus"
          :prelude="diaryPrelude"
          :show-image-action="showImageAction"
          @edit="$emit('edit-diary-prelude')"
          @pick-image="$emit('pick-images')"
        />
      </view>

      <view v-if="errorMessage" class="diary-editor-shell__notice">
        <text>{{ errorMessage }}</text>
      </view>
    </view>

    <view class="diary-editor-shell__interactive-layer" :style="interactiveLayerStyle">
      <scroll-view class="diary-editor-shell__body" scroll-y :scroll-top="writingScrollTop" :scroll-with-animation="scrollWithAnimation" :style="bodyStyle">
        <view class="diary-editor-shell__body-stage" :style="bodyStageStyle" @tap="handleEditorAreaFocus">
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

          <view v-if="mode === 'edit'" class="diary-editor-shell__editor-field">
            <view v-if="showInlinePlaceholder" class="diary-editor-shell__inline-placeholder">
              {{ bodyPlaceholder }}
            </view>
            <textarea
              class="diary-editor-shell__textarea literary-text"
              :value="content"
              :focus="textareaFocused"
              :cursor="localCursorPosition"
              adjust-position="false"
              disable-default-padding
              maxlength="-1"
              :cursor-spacing="cursorSpacing"
              :show-confirm-bar="false"
              :placeholder="showInlinePlaceholder ? '' : bodyPlaceholder"
              placeholder-class="diary-editor-shell__placeholder"
              :style="textareaStyle"
              @tap.stop="handleTextareaTap"
              @input="handleInput"
              @focus="handleTextareaFocus"
              @blur="handleTextareaBlur"
              @linechange="handleLineChange"
            />
          </view>
          <view
            v-if="mode === 'edit'"
            class="diary-editor-shell__blank-spacer"
            :style="blankSpacerStyle"
            @tap="handleEditorAreaFocus"
          ></view>

          <view v-else class="diary-editor-shell__read">
            <text class="diary-editor-shell__read-content literary-text" :style="writingTextStyle">{{ content }}</text>
          </view>
        </view>
      </scroll-view>
    </view>

  </view>
</template>

<script setup lang="ts">
import { computed, getCurrentInstance, nextTick, onMounted, ref, toRefs, watch } from "vue";
import type { DiaryPreludeMeta, DiaryPreludeStatus } from "@/domain/diaryPrelude/types";
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
import DiaryPreludeHeaderMeta from "@/features/editor/components/DiaryPreludeHeaderMeta.vue";
import AppIcon from "@/shared/ui/AppIcon.vue";
import TopbarIconButton from "@/shared/ui/TopbarIconButton.vue";

type EditorMode = "edit" | "read";
type QueryRect = { height?: number | null; top?: number | null };
type TextareaInputPayload = { value?: string; cursor?: number };
type TextareaFocusPayload = { cursor?: number };

const instance = getCurrentInstance();
const themeClass = useThemeClass();
const fixedLayerHeight = ref(140);
const textareaFocused = ref(false);
const localCursorPosition = ref<number | undefined>(undefined);
const shouldLockCursorToEnd = ref(false);
const hasBodyInteracted = ref(false);
const measuredContentHeight = ref(0);
const writingScrollTop = ref(0);
const scrollWithAnimation = ref(false);
const bodyViewportTop = ref(0);
const pendingTapCaretLineBottom = ref<number | null>(null);

const props = defineProps<{
  mode: EditorMode;
  atmosphereLine: string;
  headlineDate: string;
  headerSubtitle: string;
  headerTimeLabel: string;
  title: string;
  titlePlaceholder: string;
  content: string;
  bodyPlaceholder: string;
  savedHintLabel: string;
  errorMessage: string | null;
  showSavedHint: boolean;
  canContinueWrite: boolean;
  continueWriteLabel: string;
  cursorSpacing: number;
  writingFontSizePx: number;
  writingLineHeightPx: number;
  cursorPosition: number;
  focusEndRequestKey: number;
  stampOpacity: number;
  attachments: Attachment[];
  focusedAttachmentId?: string;
  showImageAction: boolean;
  diaryPreludeStatus: DiaryPreludeStatus;
  diaryPrelude: DiaryPreludeMeta | null;
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
  (event: "edit-diary-prelude"): void;
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
  resolveInteractiveLayerHeight(visibleWindowHeight.value, fixedLayerHeight.value, 220),
);

const interactiveLayerStyle = computed(() => ({
  height: `${interactiveLayerHeight.value}px`,
}));

const editorAvailableWidth = computed(() =>
  Math.max(screenWidth.value - rpxToPx(96), props.writingFontSizePx * 6),
);

const bodyBottomPadding = computed(() =>
  rpxToPx(96) + (keyboardVisible.value ? minLineGapToKeyboard.value : restoreAfterKeyboardHide.value),
);

const bodyStyle = computed(() => ({
  height: `${interactiveLayerHeight.value}px`,
}));

const bodyStageStyle = computed(() => ({
  minHeight: `${interactiveLayerHeight.value}px`,
  paddingBottom: `${bodyBottomPadding.value}px`,
}));
const showInlinePlaceholder = computed(() =>
  props.mode === "edit"
  && isEditorContentVisuallyEmpty("diary", props.content)
  && !hasBodyInteracted.value,
);
const blankSpacerStyle = computed(() => ({
  minHeight: `${Math.max(rpxToPx(80), minLineGapToKeyboard.value)}px`,
}));

const renderWritingHeight = computed(() =>
  Math.max(
    measuredContentHeight.value + props.writingLineHeightPx,
    props.writingLineHeightPx * 2,
  ),
);

const writingTextStyle = computed(() => ({
  fontSize: `${props.writingFontSizePx}px`,
  lineHeight: `${props.writingLineHeightPx}px`,
  "--diary-writing-font-size": `${props.writingFontSizePx}px`,
  "--diary-writing-line-height": `${props.writingLineHeightPx}px`,
}));
const textareaStyle = computed(() => ({
  ...writingTextStyle.value,
  height: `${renderWritingHeight.value}px`,
}));

const caretLineBottom = computed(() =>
  estimateEditorCaretLineBottom({
    content: props.content,
    cursor: localCursorPosition.value ?? props.cursorPosition,
    availableWidth: editorAvailableWidth.value,
    fontSizePx: props.writingFontSizePx,
    lineHeightPx: props.writingLineHeightPx,
  }),
);

function measureFixedLayer(): void {
  nextTick(() => {
    const publicInstance = instance?.proxy;
    if (!publicInstance || typeof uni === "undefined" || typeof uni.createSelectorQuery !== "function") {
      return;
    }

    uni
      .createSelectorQuery()
      .in(publicInstance)
      .select(".diary-editor-shell__fixed-layer")
      .boundingClientRect()
      .select(".diary-editor-shell__body")
      .boundingClientRect()
      .exec((results: Array<QueryRect | null | undefined>) => {
        const [fixedLayerRect, bodyRect] = results ?? [];
        fixedLayerHeight.value = Math.max(fixedLayerRect?.height ?? 0, 0);

        if (typeof bodyRect?.top === "number") {
          bodyViewportTop.value = bodyRect.top;
        }
      });
  });
}

function readEventDetail<T>(event: Event): T | undefined {
  return (event as Event & { detail?: T }).detail;
}

function handleInput(event: Event): void {
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

  const prevHeight = measuredContentHeight.value;
  measuredContentHeight.value = normalized;

  if (keyboardVisible.value && normalized > prevHeight) {
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

function handleEditorAreaFocus(): void {
  emit("focus-end-request");
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

onMounted(() => {
  localCursorPosition.value = props.cursorPosition;
  measureFixedLayer();
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
  () => [keyboardVisible.value, visibleWindowHeight.value, props.errorMessage],
  () => {
    measureFixedLayer();
  },
);

watch(
  () => [keyboardVisible.value, visibleWindowHeight.value],
  () => {
    nextTick(() => {
      syncWritingScroll();
    });
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
</script>

<style scoped>
.diary-editor-shell,
.diary-editor-shell * {
  box-sizing: border-box;
}

.diary-editor-shell {
  height: 100vh;
  background: var(--noche-bg);
  color: var(--noche-text);
  font-family: "Noto Serif SC", "Source Han Serif SC", serif;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
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

.diary-editor-shell__fixed-layer {
  position: relative;
  z-index: 2;
  flex: 0 0 auto;
}

.diary-editor-shell__topbar {
  display: grid;
  grid-template-columns: 88rpx 1fr 88rpx;
  align-items: center;
  gap: 16rpx;
  padding: 0 32rpx 24rpx;
  background: var(--noche-surface);
  backdrop-filter: blur(12rpx);
}

.diary-editor-shell__icon-button {
  width: 88rpx;
  height: 88rpx;
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
  width: 44rpx;
  height: 44rpx;
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
  width: 88rpx;
  height: 88rpx;
}

.diary-editor-shell__header,
.diary-editor-shell__notice {
  padding-left: 48rpx;
  padding-right: 48rpx;
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

.diary-editor-shell__title-input {
  width: 100%;
  min-height: 56rpx;
  margin-bottom: 16rpx;
  border: none;
  background: transparent;
  padding: 0;
  color: var(--noche-text);
  font-size: 30rpx;
  line-height: 1.4;
}

.diary-editor-shell__title-placeholder {
  color: var(--noche-muted);
  font-weight: 300;
}

.diary-editor-shell__notice {
  margin-bottom: 18rpx;
  font-size: 22rpx;
  color: #8a3d3a;
}

.diary-editor-shell__interactive-layer {
  position: relative;
  min-height: 0;
  flex: 0 0 auto;
  overflow: hidden;
  transition: height 220ms ease-out;
}

.diary-editor-shell__body {
  height: 100%;
  padding-left: 48rpx;
  padding-right: 48rpx;
}

.diary-editor-shell__body-stage {
  min-height: 100%;
  display: flex;
  flex-direction: column;
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
  background: var(--noche-surface);
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
  background: var(--noche-panel);
}

.diary-editor-shell__attachment-remove-svg {
  width: 28rpx;
  height: 28rpx;
  color: var(--noche-text);
}

.diary-editor-shell__textarea {
  width: 100%;
  border: none;
  background: transparent;
  padding: 0;
  color: var(--noche-text);
  font-size: 18px;
  line-height: 2.2;
  flex: 0 0 auto;
  position: relative;
  z-index: 1;
  transition: height 220ms ease-out;
}

.diary-editor-shell__read-content {
  width: 100%;
  min-height: 100%;
  border: none;
  background: transparent;
  padding: 0;
  color: var(--noche-text);
  font-size: 18px;
  line-height: 2.2;
}

.diary-editor-shell__editor-field {
  flex: 0 0 auto;
  display: flex;
  position: relative;
}

.diary-editor-shell__blank-spacer {
  width: 100%;
  flex: 1 0 auto;
}

.diary-editor-shell__inline-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  color: var(--noche-muted);
  font-size: var(--diary-writing-font-size, 18px);
  line-height: var(--diary-writing-line-height, 40px);
  pointer-events: none;
}

.diary-editor-shell__placeholder {
  color: var(--noche-muted);
  font-weight: 300;
}

.diary-editor-shell__read {
  flex: 1 0 auto;
  min-height: 100%;
  padding-top: 2rpx;
}

.diary-editor-shell__read-content {
  white-space: pre-wrap;
}
</style>
