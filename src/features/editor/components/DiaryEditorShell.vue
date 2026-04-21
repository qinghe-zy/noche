<template>
  <view class="diary-editor-shell" :class="themeClass">
    <view class="diary-editor-shell__grain"></view>

    <template v-if="mode === 'read'">
      <view class="diary-shell-read">
        <scroll-view
          class="diary-shell-read__scroll"
          :scroll-y="readCanScroll"
          @scroll="onReadScroll"
        >
          <view class="diary-shell-read__spacer" :style="readSpacerStyle"></view>

          <view class="diary-shell-read__paper" :style="readPaperStyle">
            <view v-if="errorMessage" class="diary-editor-shell__notice">
              <text>{{ errorMessage }}</text>
            </view>

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
              </view>
            </view>

            <text class="diary-shell-read__content diary-editor-shell__read-content literary-text" :style="writingTextStyle">
              {{ content }}
            </text>
          </view>

          <view class="diary-shell-read__bottom-pad"></view>
        </scroll-view>

        <view class="diary-shell-read__overlay">
          <view class="diary-shell-read__overlay-bg" :style="readOverlayBackgroundStyle"></view>

          <view class="diary-shell-read__topbar" :style="topbarStyle">
            <TopbarIconButton @tap="$emit('go-back')" />

            <view
              v-if="canContinueWrite"
              class="diary-editor-shell__continue-button diary-shell-read__continue-button"
              @tap="handleContinueWriteTap"
            >
              {{ continueWriteLabel }}
            </view>
            <view v-else class="diary-editor-shell__spacer"></view>
          </view>

          <text class="diary-shell-read__date" :style="readDateStyle">{{ headlineDate }}</text>

          <view v-if="showCollapsedTitleRow" class="diary-shell-read__title-row" :style="readTitleRowStyle">
            <text
              v-if="title"
              class="diary-shell-read__title"
              :style="readTitleTextStyle"
            >
              {{ title }}
            </text>
            <DiaryPreludeHeaderMeta
              v-if="showCompactPreludeIcons"
              class="diary-shell-read__title-icons"
              variant="compact-icons"
              :mode="mode"
              :subtitle="headerSubtitle"
              :time-label="headerTimeLabel"
              :status="diaryPreludeStatus"
              :prelude="diaryPrelude"
            />
          </view>

          <DiaryPreludeHeaderMeta
            class="diary-shell-read__meta"
            :style="readMetaStyle"
            :mode="mode"
            :subtitle="headerSubtitle"
            :time-label="headerTimeLabel"
            :status="diaryPreludeStatus"
            :prelude="diaryPrelude"
            :show-glyphs="false"
            @edit="$emit('edit-diary-prelude')"
          />
        </view>
      </view>
    </template>

    <template v-else>
      <view class="diary-shell-edit">
        <scroll-view
          class="diary-shell-edit__scroll"
          :scroll-y="!isEditShellScrollLocked && editCanShellScroll"
          :scroll-top="editScrollTopBinding"
          :scroll-with-animation="scrollWithAnimation"
          @scroll="onEditShellScroll"
        >
          <view class="diary-shell-edit__spacer" :style="editSpacerStyle"></view>

          <view class="diary-shell-edit__paper" :style="editPaperStyle">
            <input
              class="diary-editor-shell__title-input diary-shell-edit__title-input"
              :style="editTitleInputStyle"
              :value="title"
              :placeholder="titlePlaceholder"
              placeholder-class="diary-editor-shell__title-placeholder"
              maxlength="40"
              @input="$emit('title-input', $event)"
            />

            <view v-if="errorMessage" class="diary-editor-shell__notice diary-shell-edit__notice">
              <text>{{ errorMessage }}</text>
            </view>

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
                  class="diary-editor-shell__attachment-remove"
                  @tap.stop="$emit('remove-attachment', attachment.id)"
                >
                  <AppIcon name="close" class="diary-editor-shell__attachment-remove-svg" />
                </view>
              </view>
            </view>

            <view class="diary-shell-edit__body" :style="editBodyStyle">
              <view class="diary-shell-edit__editor-field">
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
                  @input="handleTextareaInput"
                  @focus="handleTextareaFocus"
                  @blur="handleTextareaBlur"
                  @linechange="handleLineChange"
                />
              </view>
              <view
                class="diary-shell-edit__blank-spacer"
                :style="editStaticBlankSpacerStyle"
                @tap="handleBlankAreaFocus"
              ></view>
            </view>
          </view>

          <view class="diary-shell-edit__bottom-pad"></view>
        </scroll-view>

        <view class="diary-shell-edit__overlay">
          <view class="diary-shell-edit__overlay-bg" :style="editOverlayBackgroundStyle"></view>

          <view class="diary-shell-edit__topbar" :style="topbarStyle">
            <TopbarIconButton @tap="$emit('go-back')" />

            <view class="diary-shell-edit__topbar-actions">
              <view
                v-if="showImageAction"
                class="diary-editor-shell__meta-image-button diary-shell-edit__topbar-image-button"
                @tap="$emit('pick-images')"
              >
                <AppIcon name="image" class="diary-editor-shell__meta-image-icon" />
              </view>

              <view class="diary-editor-shell__icon-button diary-shell-edit__save-button" @tap="$emit('formal-save')">
                <text v-if="showSavedHint" class="diary-editor-shell__saved-hint">{{ savedHintLabel }}</text>
                <AppIcon name="check" class="diary-editor-shell__topbar-svg" />
              </view>
            </view>
          </view>

          <text class="diary-shell-edit__date" :style="editDateStyle">{{ headlineDate }}</text>

          <view v-if="showCollapsedTitleRow" class="diary-shell-edit__title-row" :style="editTitleRowStyle">
            <text
              v-if="title"
              class="diary-shell-edit__title-display"
              :style="editTitleTextStyle"
            >
              {{ title }}
            </text>
            <DiaryPreludeHeaderMeta
              v-if="showCompactPreludeIcons"
              class="diary-shell-edit__title-icons"
              variant="compact-icons"
              :mode="mode"
              :subtitle="headerSubtitle"
              :time-label="headerTimeLabel"
              :status="diaryPreludeStatus"
              :prelude="diaryPrelude"
            />
          </view>

          <DiaryPreludeHeaderMeta
            class="diary-shell-edit__meta"
            :style="editMetaStyle"
            :mode="mode"
            :subtitle="headerSubtitle"
            :time-label="headerTimeLabel"
            :status="diaryPreludeStatus"
            :prelude="diaryPrelude"
            :show-glyphs="false"
            @edit="$emit('edit-diary-prelude')"
          />
        </view>
      </view>
    </template>
  </view>
</template>

<script setup lang="ts">
import { computed, getCurrentInstance, nextTick, onBeforeUnmount, onMounted, ref, toRefs, watch } from "vue";
import type { DiaryPreludeMeta, DiaryPreludeStatus } from "@/domain/diaryPrelude/types";
import type { Attachment } from "@/shared/types/attachment";
import {
  estimateEditorCaretLineBottom,
  estimateEditorContentHeight,
  resolveCaretAwareScrollTop,
  resolveTapCaretLineBottom,
} from "@/features/editor/editorCaretLayout";
import {
  estimateJottingTextWidth,
  interpolateJottingMetric,
  resolveJottingCollapseProgress,
  resolveJottingProgressWindow,
} from "@/features/editor/jottingContinuousCollapse";
import {
  resolveInteractiveLayerHeight,
  rpxToPx as rpxToPxFn,
} from "@/features/editor/composables/useEditorKeyboardViewport";
import { useDeferredKeyboardViewportSync } from "@/features/editor/composables/useDeferredKeyboardViewportSync";
import { isEditorContentVisuallyEmpty } from "@/features/editor/editorInputRules";
import { shouldRenderDiaryPreludeHeaderMeta } from "@/features/editor/diaryPreludeState";
import { useThemeClass } from "@/shared/theme";
import DiaryPreludeHeaderMeta from "@/features/editor/components/DiaryPreludeHeaderMeta.vue";
import AppIcon from "@/shared/ui/AppIcon.vue";
import TopbarIconButton from "@/shared/ui/TopbarIconButton.vue";

type EditorMode = "edit" | "read";
type QueryRect = { height?: number | null; top?: number | null };
type TextareaInputPayload = { value?: string; cursor?: number };
type TextareaFocusPayload = { cursor?: number };
type ScrollEventPayload = { scrollTop?: number };

const instance = getCurrentInstance();
const themeClass = useThemeClass();
const shellFixedHeight = ref(0);
const textareaFocused = ref(false);
const localCursorPosition = ref<number | undefined>(undefined);
const shouldLockCursorToEnd = ref(false);
const hasBodyInteracted = ref(false);
const measuredContentHeight = ref(0);
const bodyViewportHeight = ref(0);
const bodyViewportTop = ref(0);
const pendingTapCaretLineBottom = ref<number | null>(null);
const scrollWithAnimation = ref(false);

const readScrollTop = ref(0);
const measuredReadPaperHeight = ref(0);
const measuredDateWidth = ref(0);

const editShellScrollTop = ref(0);
const editUserScrollTop = ref(0);
const editCollapseProgress = ref(0);
const measuredEditPaperHeight = ref(0);
const isProgrammaticEditBodyScroll = ref(false);
const editProgrammaticScrollTop = ref<number | undefined>(undefined);

let editBodyScrollTimer: ReturnType<typeof setTimeout> | null = null;

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
  statusBarHeight: number;
  keyboardVisible: boolean;
  visibleWindowHeight: number;
  minLineGapToKeyboard: number;
  restoreAfterKeyboardHide: number;
  screenWidth: number;
}>();

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

const topbarTop = computed(() => statusBarHeight.value + rpxToPx(32));
const topbarHeight = computed(() => rpxToPx(88));
const topbarBottom = computed(() => topbarTop.value + topbarHeight.value);

const topbarStyle = computed(() => ({
  paddingTop: `${topbarTop.value}px`,
}));

const interactiveLayerHeight = computed(() =>
  resolveInteractiveLayerHeight(visibleWindowHeight.value, shellFixedHeight.value, 240),
);

const editorAvailableWidth = computed(() =>
  Math.max(screenWidth.value - rpxToPx(96), props.writingFontSizePx * 6),
);

const bodyBottomPadding = computed(() =>
  rpxToPx(96) + (keyboardVisible.value ? minLineGapToKeyboard.value : restoreAfterKeyboardHide.value),
);

const showInlinePlaceholder = computed(() =>
  props.mode === "edit"
  && isEditorContentVisuallyEmpty("diary", props.content)
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
  "--diary-writing-font-size": `${props.writingFontSizePx}px`,
  "--diary-writing-line-height": `${props.writingLineHeightPx}px`,
}));

const textareaStyle = computed(() => ({
  ...writingTextStyle.value,
  height: `${renderWritingHeight.value}px`,
}));

const editTitleInputStyle = computed(() => ({
  fontSize: `${rpxToPx(30)}px`,
  lineHeight: `${rpxToPx(42)}px`,
}));

const editStaticBlankSpacerStyle = computed(() => ({
  minHeight: `${Math.max(rpxToPx(120), restoreAfterKeyboardHide.value)}px`,
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

const dateExpandedTop = computed(() => topbarBottom.value + rpxToPx(48));
const dateExpandedLeft = computed(() => rpxToPx(48));
const titleExpandedLeft = computed(() => rpxToPx(48));
const dateExpandedFontSize = computed(() => rpxToPx(72));
const dateCollapsedFontSize = computed(() => rpxToPx(26));
const titleExpandedFontSize = computed(() => rpxToPx(30));
const titleCollapsedFontSize = computed(() => rpxToPx(26));
const dateExpandedLineHeight = computed(() => dateExpandedFontSize.value * 1.08);
const titleExpandedLineHeight = computed(() => titleExpandedFontSize.value * 1.35);
const collapsedDateLineHeight = computed(() => dateCollapsedFontSize.value * 1.14);
const collapsedTitleLineHeight = computed(() => titleCollapsedFontSize.value * 1.24);
const collapsedDateTop = computed(() => topbarTop.value + (topbarHeight.value - collapsedDateLineHeight.value) / 2);
const collapsedTitleTop = computed(() => topbarTop.value + (topbarHeight.value - collapsedTitleLineHeight.value) / 2);
const titleExpandedTop = computed(() => dateExpandedTop.value + dateExpandedLineHeight.value + rpxToPx(16));
const metaExpandedTop = computed(() => titleExpandedTop.value + titleExpandedLineHeight.value + rpxToPx(16));
const metaExpandedHeight = computed(() => rpxToPx(72));
const dateCollapsedLeft = computed(() => rpxToPx(132));
const titleGapAfterDate = computed(() => rpxToPx(12));
const expandedHeaderHeight = computed(() => metaExpandedTop.value + metaExpandedHeight.value - topbarBottom.value);
const spacerHeight = computed(() => topbarBottom.value + expandedHeaderHeight.value);
const collapseDistance = computed(() => Math.max(expandedHeaderHeight.value, 1));

const showCompactPreludeIcons = computed(() =>
  shouldRenderDiaryPreludeHeaderMeta(props.diaryPreludeStatus, props.diaryPrelude),
);
const showCollapsedTitleRow = computed(() =>
  Boolean(props.title) || showCompactPreludeIcons.value,
);

const {
  pendingKeyboardViewportSync,
  deferKeyboardViewportSync,
  requestKeyboardViewportSync: queueKeyboardViewportSync,
  flushPendingKeyboardViewportSync: takePendingKeyboardViewportSync,
  resetKeyboardViewportSync,
} = useDeferredKeyboardViewportSync<number>({
  keyboardVisible,
  bodyViewportHeight,
  scheduleMeasurement: (flush) => {
    nextTick(() => {
      measureEditBodyViewport();
      flush();
    });
  },
});

const readCanScroll = computed(() =>
  measuredReadPaperHeight.value > Math.max(visibleWindowHeight.value - spacerHeight.value, 0),
);

const editCanShellScroll = computed(() =>
  measuredEditPaperHeight.value > Math.max(visibleWindowHeight.value - spacerHeight.value, 0),
);

const readCollapseProgress = computed(() =>
  resolveJottingCollapseProgress({
    effectiveCollapseScroll: readScrollTop.value,
    collapseStart: 0,
    collapseDistance: collapseDistance.value,
  }),
);

const isEditShellScrollLocked = computed(() => keyboardVisible.value);
const editScrollTopBinding = computed(() => editProgrammaticScrollTop.value);

const metaFadeProgress = computed(() =>
  resolveJottingProgressWindow({
    progress: readCollapseProgress.value,
    start: 0,
    end: 0.34,
  }),
);
const editMetaFadeProgress = computed(() =>
  resolveJottingProgressWindow({
    progress: editCollapseProgress.value,
    start: 0,
    end: 0.34,
  }),
);

const currentReadDateFontSize = computed(() =>
  interpolateJottingMetric({
    progress: readCollapseProgress.value,
    from: dateExpandedFontSize.value,
    to: dateCollapsedFontSize.value,
  }),
);
const currentEditDateFontSize = computed(() =>
  interpolateJottingMetric({
    progress: editCollapseProgress.value,
    from: dateExpandedFontSize.value,
    to: dateCollapsedFontSize.value,
  }),
);
const currentReadTitleFontSize = computed(() =>
  interpolateJottingMetric({
    progress: readCollapseProgress.value,
    from: titleExpandedFontSize.value,
    to: titleCollapsedFontSize.value,
  }),
);
const currentEditTitleFontSize = computed(() =>
  interpolateJottingMetric({
    progress: editCollapseProgress.value,
    from: titleExpandedFontSize.value,
    to: titleCollapsedFontSize.value,
  }),
);

const collapsedTitleLeft = computed(() =>
  dateCollapsedLeft.value + measuredDateWidth.value + titleGapAfterDate.value,
);
const readCollapsedTitleRightSafe = computed(() => (props.canContinueWrite ? rpxToPx(180) : rpxToPx(120)));
const editCollapsedTitleRightSafe = computed(() => (props.showImageAction ? rpxToPx(220) : rpxToPx(148)));
const expandedDateMaxWidth = computed(() => Math.max(screenWidth.value - rpxToPx(96), dateExpandedFontSize.value));
const collapsedDateMaxWidth = computed(() => Math.max(measuredDateWidth.value + rpxToPx(8), dateCollapsedFontSize.value));
const expandedTitleMaxWidth = computed(() => Math.max(screenWidth.value - rpxToPx(96), titleExpandedFontSize.value));
const readCollapsedTitleMaxWidth = computed(() =>
  Math.max(screenWidth.value - collapsedTitleLeft.value - readCollapsedTitleRightSafe.value, titleCollapsedFontSize.value),
);
const editCollapsedTitleMaxWidth = computed(() =>
  Math.max(screenWidth.value - collapsedTitleLeft.value - editCollapsedTitleRightSafe.value, titleCollapsedFontSize.value),
);

const readSpacerStyle = computed(() => ({
  height: `${spacerHeight.value}px`,
}));
const editSpacerStyle = computed(() => ({
  height: `${spacerHeight.value}px`,
}));

const readOverlayBackgroundStyle = computed(() => ({
  height: `${Math.max(topbarBottom.value + expandedHeaderHeight.value * (1 - readCollapseProgress.value), topbarBottom.value)}px`,
}));
const editOverlayBackgroundStyle = computed(() => ({
  height: `${Math.max(topbarBottom.value + expandedHeaderHeight.value * (1 - editCollapseProgress.value), topbarBottom.value)}px`,
}));

const readPaperStyle = computed(() => ({
  minHeight: `${Math.max(visibleWindowHeight.value - spacerHeight.value, 0)}px`,
}));
const editPaperStyle = computed(() => ({
  minHeight: `${Math.max(visibleWindowHeight.value - spacerHeight.value, 0)}px`,
}));

const editBodyStyle = computed(() => ({
  minHeight: `${Math.max(bodyViewportHeight.value, interactiveLayerHeight.value)}px`,
  paddingBottom: `${bodyBottomPadding.value}px`,
}));

const readDateStyle = computed(() => ({
  top: `${interpolateJottingMetric({
    progress: readCollapseProgress.value,
    from: dateExpandedTop.value,
    to: collapsedDateTop.value,
  })}px`,
  left: `${interpolateJottingMetric({
    progress: readCollapseProgress.value,
    from: dateExpandedLeft.value,
    to: dateCollapsedLeft.value,
  })}px`,
  fontSize: `${currentReadDateFontSize.value}px`,
  lineHeight: `${currentReadDateFontSize.value * 1.14}px`,
  maxWidth: `${interpolateJottingMetric({
    progress: readCollapseProgress.value,
    from: expandedDateMaxWidth.value,
    to: collapsedDateMaxWidth.value,
  })}px`,
}));
const editDateStyle = computed(() => ({
  top: `${interpolateJottingMetric({
    progress: editCollapseProgress.value,
    from: dateExpandedTop.value,
    to: collapsedDateTop.value,
  })}px`,
  left: `${interpolateJottingMetric({
    progress: editCollapseProgress.value,
    from: dateExpandedLeft.value,
    to: dateCollapsedLeft.value,
  })}px`,
  fontSize: `${currentEditDateFontSize.value}px`,
  lineHeight: `${currentEditDateFontSize.value * 1.14}px`,
  maxWidth: `${interpolateJottingMetric({
    progress: editCollapseProgress.value,
    from: expandedDateMaxWidth.value,
    to: collapsedDateMaxWidth.value,
  })}px`,
}));

const readTitleRowStyle = computed(() => ({
  top: `${interpolateJottingMetric({
    progress: readCollapseProgress.value,
    from: titleExpandedTop.value,
    to: collapsedTitleTop.value,
  })}px`,
  left: `${interpolateJottingMetric({
    progress: readCollapseProgress.value,
    from: titleExpandedLeft.value,
    to: collapsedTitleLeft.value,
  })}px`,
  maxWidth: `${interpolateJottingMetric({
    progress: readCollapseProgress.value,
    from: expandedTitleMaxWidth.value,
    to: readCollapsedTitleMaxWidth.value,
  })}px`,
}));
const editTitleRowStyle = computed(() => ({
  top: `${interpolateJottingMetric({
    progress: editCollapseProgress.value,
    from: titleExpandedTop.value,
    to: collapsedTitleTop.value,
  })}px`,
  left: `${interpolateJottingMetric({
    progress: editCollapseProgress.value,
    from: titleExpandedLeft.value,
    to: collapsedTitleLeft.value,
  })}px`,
  maxWidth: `${interpolateJottingMetric({
    progress: editCollapseProgress.value,
    from: expandedTitleMaxWidth.value,
    to: editCollapsedTitleMaxWidth.value,
  })}px`,
}));
const readTitleTextStyle = computed(() => ({
  fontSize: `${currentReadTitleFontSize.value}px`,
  lineHeight: `${currentReadTitleFontSize.value * 1.24}px`,
}));
const editTitleTextStyle = computed(() => ({
  fontSize: `${currentEditTitleFontSize.value}px`,
  lineHeight: `${currentEditTitleFontSize.value * 1.24}px`,
}));

const readMetaStyle = computed(() => ({
  top: `${metaExpandedTop.value}px`,
  left: `${titleExpandedLeft.value}px`,
  right: `${rpxToPx(48)}px`,
  opacity: `${1 - metaFadeProgress.value}`,
  maxHeight: `${interpolateJottingMetric({
    progress: metaFadeProgress.value,
    from: metaExpandedHeight.value,
    to: 0,
  })}px`,
  transform: `translateY(${-rpxToPx(16) * metaFadeProgress.value}px)`,
}));
const editMetaStyle = computed(() => ({
  top: `${metaExpandedTop.value}px`,
  left: `${titleExpandedLeft.value}px`,
  right: `${rpxToPx(48)}px`,
  opacity: `${1 - editMetaFadeProgress.value}`,
  maxHeight: `${interpolateJottingMetric({
    progress: editMetaFadeProgress.value,
    from: metaExpandedHeight.value,
    to: 0,
  })}px`,
  transform: `translateY(${-rpxToPx(16) * editMetaFadeProgress.value}px)`,
}));

function readEventDetail<T>(event: Event): T | undefined {
  return (event as Event & { detail?: T }).detail;
}

function estimateVisibleContentHeight(): number {
  return estimateEditorContentHeight({
    content: props.content,
    availableWidth: editorAvailableWidth.value,
    fontSizePx: props.writingFontSizePx,
    lineHeightPx: props.writingLineHeightPx,
  });
}

function measureReadPaperHeight(): void {
  nextTick(() => {
    const publicInstance = instance?.proxy;
    if (
      props.mode !== "read"
      || !publicInstance
      || typeof uni === "undefined"
      || typeof uni.createSelectorQuery !== "function"
    ) {
      return;
    }

    uni.createSelectorQuery()
      .in(publicInstance)
      .select(".diary-shell-read__paper")
      .boundingClientRect()
      .exec((results: Array<QueryRect | null | undefined>) => {
        const rect = results?.[0];
        measuredReadPaperHeight.value = typeof rect?.height === "number" ? Math.max(rect.height, 0) : 0;
      });
  });
}

function measureEditPaperHeight(): void {
  nextTick(() => {
    const publicInstance = instance?.proxy;
    if (
      props.mode !== "edit"
      || !publicInstance
      || typeof uni === "undefined"
      || typeof uni.createSelectorQuery !== "function"
    ) {
      return;
    }

    uni.createSelectorQuery()
      .in(publicInstance)
      .select(".diary-shell-edit__paper")
      .boundingClientRect()
      .exec((results: Array<QueryRect | null | undefined>) => {
        const rect = results?.[0];
        measuredEditPaperHeight.value = typeof rect?.height === "number" ? Math.max(rect.height, 0) : 0;
      });
  });
}

function measureEditBodyViewport(): void {
  nextTick(() => {
    const publicInstance = instance?.proxy;
    if (
      props.mode !== "edit"
      || !keyboardVisible.value
      || !publicInstance
      || typeof uni === "undefined"
      || typeof uni.createSelectorQuery !== "function"
    ) {
      return;
    }

    uni.createSelectorQuery()
      .in(publicInstance)
      .select(".diary-shell-edit__scroll")
      .boundingClientRect()
      .exec((results: Array<QueryRect | null | undefined>) => {
        const rect = results?.[0];

        if (typeof rect?.height === "number") {
          bodyViewportHeight.value = Math.max(rect.height, 0);
        }

        if (typeof rect?.top === "number") {
          bodyViewportTop.value = rect.top;
        }
      });
  });
}

function scheduleReadMeasurements(): void {
  if (props.mode !== "read") {
    return;
  }

  measureReadPaperHeight();
}

function scheduleEditMeasurements(): void {
  if (props.mode !== "edit") {
    return;
  }

  shellFixedHeight.value = spacerHeight.value;
  measureEditPaperHeight();

  if (keyboardVisible.value) {
    measureEditBodyViewport();
  }
}

function clearEditBodyScrollTimer(): void {
  if (editBodyScrollTimer !== null) {
    clearTimeout(editBodyScrollTimer);
    editBodyScrollTimer = null;
  }
}

function resetReadState(): void {
  readScrollTop.value = 0;
  measuredReadPaperHeight.value = 0;
}

function resetEditState(): void {
  editShellScrollTop.value = 0;
  editUserScrollTop.value = 0;
  editCollapseProgress.value = 0;
  measuredEditPaperHeight.value = 0;
  isProgrammaticEditBodyScroll.value = false;
  editProgrammaticScrollTop.value = undefined;
  resetKeyboardViewportSync();
  scrollWithAnimation.value = false;
  bodyViewportHeight.value = 0;
  bodyViewportTop.value = 0;
}

function onReadScroll(event: Event): void {
  const detail = readEventDetail<ScrollEventPayload>(event);
  readScrollTop.value = Math.max(detail?.scrollTop ?? 0, 0);
}

function onEditShellScroll(event: Event): void {
  const detail = readEventDetail<ScrollEventPayload>(event);
  editShellScrollTop.value = Math.max(detail?.scrollTop ?? 0, 0);

  if (!isProgrammaticEditBodyScroll.value) {
    editProgrammaticScrollTop.value = undefined;
  }

  if (!isEditShellScrollLocked.value) {
    editUserScrollTop.value = editShellScrollTop.value;
    editCollapseProgress.value = resolveJottingCollapseProgress({
      effectiveCollapseScroll: editUserScrollTop.value,
      collapseStart: 0,
      collapseDistance: collapseDistance.value,
    });
  }
}

function handleContinueWriteTap(): void {
  if (props.mode !== "read" || !props.canContinueWrite) {
    return;
  }

  emit("continue-write");
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

  scheduleEditMeasurements();
}

function syncWritingScroll(nextContentHeight = measuredContentHeight.value): void {
  if (deferKeyboardViewportSync(nextContentHeight)) {
    return;
  }

  const preferredCaretLineBottom = pendingTapCaretLineBottom.value ?? caretLineBottom.value;
  const targetScrollTop = resolveCaretAwareScrollTop({
    caretLineBottom: Math.min(Math.max(preferredCaretLineBottom, props.writingLineHeightPx), nextContentHeight),
    viewportHeight: Math.max(bodyViewportHeight.value, interactiveLayerHeight.value),
    minLineGapToKeyboard: minLineGapToKeyboard.value,
  });

  if (Math.abs(targetScrollTop - editShellScrollTop.value) > 1 || !keyboardVisible.value) {
    clearEditBodyScrollTimer();
    isProgrammaticEditBodyScroll.value = true;
    scrollWithAnimation.value = false;
    editProgrammaticScrollTop.value = targetScrollTop;
    editShellScrollTop.value = targetScrollTop;
    editBodyScrollTimer = setTimeout(() => {
      editBodyScrollTimer = null;
      isProgrammaticEditBodyScroll.value = false;
      editProgrammaticScrollTop.value = undefined;
    }, 120);
  }

  pendingTapCaretLineBottom.value = null;
}

function handleTextareaTap(event: Event): void {
  const detail = readEventDetail<{ y?: number }>(event);
  pendingTapCaretLineBottom.value = resolveTapCaretLineBottom({
    tapClientY: detail?.y,
    viewportTop: bodyViewportTop.value,
    currentScrollTop: editShellScrollTop.value,
    lineHeightPx: props.writingLineHeightPx,
  });
}

function requestKeyboardViewportSync(nextContentHeight = measuredContentHeight.value): void {
  queueKeyboardViewportSync(nextContentHeight);
}

function flushPendingKeyboardViewportSync(): number | null {
  return takePendingKeyboardViewportSync();
}

function handleBlankAreaFocus(): void {
  if (props.mode !== "edit") {
    return;
  }

  emit("focus-end-request");
}

function handleTextareaFocus(event: Event): void {
  textareaFocused.value = true;
  const detail = readEventDetail<TextareaFocusPayload>(event);
  const cursor = typeof detail?.cursor === "number" ? detail.cursor : props.cursorPosition;
  localCursorPosition.value = cursor;
  emit("editor-focus", cursor);

  if (keyboardVisible.value) {
    requestKeyboardViewportSync();
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
  resetKeyboardViewportSync();
  releaseCursorLock();
  emit("editor-blur");
}

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

onMounted(() => {
  localCursorPosition.value = props.cursorPosition;
  measuredContentHeight.value = Math.max(estimateVisibleContentHeight(), props.writingLineHeightPx);
  measuredDateWidth.value = estimateJottingTextWidth(props.headlineDate, dateCollapsedFontSize.value);

  if (props.mode === "edit") {
    resetEditState();
    scheduleEditMeasurements();
    return;
  }

  resetReadState();
  scheduleReadMeasurements();
});

onBeforeUnmount(() => {
  clearEditBodyScrollTimer();
});

watch(
  () => props.content,
  (nextContent) => {
    measuredContentHeight.value = Math.max(estimateVisibleContentHeight(), props.writingLineHeightPx);

    if (props.mode !== "edit") {
      scheduleReadMeasurements();
      return;
    }

    if (shouldLockCursorToEnd.value) {
      localCursorPosition.value = nextContent.length;
    }

    scheduleEditMeasurements();
  },
);

watch(
  () => props.cursorPosition,
  (nextCursor) => {
    if (props.mode !== "edit" || shouldLockCursorToEnd.value) {
      return;
    }

    localCursorPosition.value = nextCursor;

    if (keyboardVisible.value && textareaFocused.value) {
      requestKeyboardViewportSync();
    }
  },
);

watch(
  () => [props.attachments.length, props.mode, props.errorMessage],
  () => {
    if (props.mode === "edit") {
      scheduleEditMeasurements();
      return;
    }

    scheduleReadMeasurements();
  },
);

watch(
  () => [keyboardVisible.value, visibleWindowHeight.value],
  () => {
    if (props.mode !== "edit") {
      return;
    }

    nextTick(() => {
      scheduleEditMeasurements();

      if (keyboardVisible.value) {
        requestKeyboardViewportSync();
        return;
      }

      clearEditBodyScrollTimer();
      isProgrammaticEditBodyScroll.value = false;
      resetKeyboardViewportSync();
      scrollWithAnimation.value = false;
      editProgrammaticScrollTop.value = undefined;
    });
  },
);

watch(
  () => [screenWidth.value, props.headlineDate, props.mode],
  () => {
    measuredDateWidth.value = estimateJottingTextWidth(props.headlineDate, dateCollapsedFontSize.value);

    if (props.mode === "edit") {
      scheduleEditMeasurements();
      return;
    }

    scheduleReadMeasurements();
  },
);

watch(
  () => props.mode,
  (nextMode) => {
    clearEditBodyScrollTimer();

    if (nextMode === "read") {
      resetReadState();
      scheduleReadMeasurements();
      return;
    }

    resetEditState();
    scheduleEditMeasurements();
  },
);

watch(readCanScroll, (enabled) => {
  if (enabled || props.mode !== "read") {
    return;
  }

  readScrollTop.value = 0;
});

watch(
  () => props.focusEndRequestKey,
  () => {
    if (props.mode !== "edit") {
      return;
    }

    focusEditorToEnd();

    if (keyboardVisible.value) {
      requestKeyboardViewportSync();
    }
  },
);

watch(bodyViewportHeight, () => {
  const nextContentHeight = flushPendingKeyboardViewportSync();
  if (nextContentHeight === null) {
    return;
  }

  syncWritingScroll(nextContentHeight);
});
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

.diary-shell-read,
.diary-shell-edit {
  position: relative;
  height: 100%;
}

.diary-shell-read__scroll,
.diary-shell-edit__scroll {
  position: relative;
  z-index: 1;
  height: 100%;
}

.diary-shell-read__spacer,
.diary-shell-edit__spacer {
  width: 100%;
}

.diary-shell-read__paper,
.diary-shell-edit__paper {
  margin: 0 32rpx;
  padding: 40rpx 44rpx;
  background: var(--noche-surface);
}

.diary-shell-read__overlay,
.diary-shell-edit__overlay {
  position: absolute;
  inset: 0 0 auto 0;
  z-index: 10;
  pointer-events: none;
}

.diary-shell-read__overlay-bg,
.diary-shell-edit__overlay-bg {
  position: absolute;
  inset: 0 0 auto 0;
  background: var(--noche-bg);
}

.diary-shell-read__topbar,
.diary-shell-edit__topbar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  min-height: 88rpx;
  padding-left: 32rpx;
  padding-right: 32rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  pointer-events: auto;
}

.diary-shell-read__continue-button,
.diary-shell-edit__save-button {
  pointer-events: auto;
}

.diary-shell-edit__topbar-actions {
  display: flex;
  align-items: center;
  gap: 8rpx;
  pointer-events: auto;
}

.diary-shell-edit__topbar-image-button {
  pointer-events: auto;
}

.diary-shell-read__date,
.diary-shell-edit__date,
.diary-shell-read__title-row,
.diary-shell-edit__title-row,
.diary-shell-read__meta,
.diary-shell-edit__meta {
  position: absolute;
}

.diary-shell-read__date,
.diary-shell-edit__date {
  letter-spacing: 0.04em;
  overflow: hidden;
}

.diary-shell-read__title-row,
.diary-shell-edit__title-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
  min-width: 0;
}

.diary-shell-read__title,
.diary-shell-edit__title-display {
  min-width: 0;
  flex: 0 1 auto;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.diary-shell-read__title-icons,
.diary-shell-edit__title-icons {
  flex: 0 0 auto;
}

.diary-shell-read__meta,
.diary-shell-edit__meta {
  overflow: hidden;
  pointer-events: auto;
}

.diary-shell-edit__title-input {
  margin-bottom: 24rpx;
}

.diary-shell-edit__body {
  display: flex;
  flex-direction: column;
}

.diary-shell-edit__editor-field {
  position: relative;
}

.diary-shell-edit__blank-spacer {
  width: 100%;
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

.diary-editor-shell__textarea,
.diary-editor-shell__read-content {
  width: 100%;
  border: none;
  background: transparent;
  padding: 0;
  color: var(--noche-text);
  font-size: 18px;
  line-height: 2.2;
}

.diary-editor-shell__textarea {
  flex: 0 0 auto;
  position: relative;
  z-index: 1;
  transition: height 220ms ease-out;
}

.diary-shell-read__content {
  display: block;
  min-height: 0;
  white-space: pre-wrap;
}

.diary-editor-shell__title-input {
  width: 100%;
  min-height: 56rpx;
  border: none;
  background: transparent;
  padding: 0;
  color: var(--noche-text);
}

.diary-editor-shell__title-placeholder {
  color: var(--noche-muted);
  font-weight: 300;
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

.diary-editor-shell__icon-button {
  width: 88rpx;
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  color: var(--noche-text);
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
  font-size: 24rpx;
  color: var(--noche-muted);
}

.diary-editor-shell__spacer {
  width: 88rpx;
  height: 88rpx;
}

.diary-editor-shell__meta-image-button {
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--noche-muted);
}

.diary-editor-shell__meta-image-icon {
  width: 28rpx;
  height: 28rpx;
  color: currentColor;
}

.diary-editor-shell__notice {
  margin-bottom: 18rpx;
  font-size: 22rpx;
  color: #8a3d3a;
}

.diary-shell-edit__notice {
  margin-top: -4rpx;
}

.diary-shell-read__bottom-pad,
.diary-shell-edit__bottom-pad {
  height: 96rpx;
}

.theme-dark.diary-editor-shell {
  --diary-paper-base: linear-gradient(180deg, rgba(24, 20, 16, 0.985), rgba(18, 14, 11, 0.985));
  --diary-paper-ink: #f0e8d5;
  --diary-paper-ink-soft: #e2d8c0;
  --diary-paper-muted: rgba(196, 181, 152, 0.78);
  --diary-paper-muted-soft: rgba(143, 125, 98, 0.88);
  --diary-paper-line: rgba(240, 232, 213, 0.065);
  --diary-paper-border: rgba(76, 63, 45, 0.62);
  --diary-paper-panel: rgba(34, 28, 21, 0.84);
  --diary-paper-shadow: rgba(0, 0, 0, 0.28);
}

.theme-dark.diary-editor-shell .diary-editor-shell__grain {
  opacity: 0.055;
  background:
    radial-gradient(circle at 18% 10%, rgba(201, 150, 60, 0.08), transparent 18%),
    radial-gradient(circle at 84% 14%, rgba(226, 216, 192, 0.05), transparent 20%),
    linear-gradient(to bottom, rgba(12, 10, 8, 0.24), rgba(12, 10, 8, 0.08));
}

.theme-dark.diary-editor-shell .diary-shell-read__paper,
.theme-dark.diary-editor-shell .diary-shell-edit__paper {
  position: relative;
  overflow: hidden;
  background:
    radial-gradient(circle at 16% 12%, rgba(201, 150, 60, 0.08), transparent 18%),
    radial-gradient(circle at 84% 8%, rgba(240, 232, 213, 0.045), transparent 24%),
    linear-gradient(180deg, rgba(240, 232, 213, 0.025), rgba(240, 232, 213, 0)),
    var(--diary-paper-base);
  box-shadow:
    inset 0 1px 0 rgba(240, 232, 213, 0.04),
    inset 0 0 0 1rpx var(--diary-paper-border),
    0 18rpx 44rpx var(--diary-paper-shadow);
}

.theme-dark.diary-editor-shell .diary-editor-shell__textarea,
.theme-dark.diary-editor-shell .diary-shell-read__content {
  background-image: repeating-linear-gradient(
    to bottom,
    transparent,
    transparent calc(var(--diary-writing-line-height, 40px) - 6px),
    var(--diary-paper-line) calc(var(--diary-writing-line-height, 40px) - 6px),
    var(--diary-paper-line) calc(var(--diary-writing-line-height, 40px) - 4px),
    transparent calc(var(--diary-writing-line-height, 40px) - 4px),
    transparent var(--diary-writing-line-height, 40px)
  );
  background-size: 100% var(--diary-writing-line-height, 40px);
  color: var(--diary-paper-ink);
}

.theme-dark.diary-editor-shell .diary-editor-shell__title-input,
.theme-dark.diary-editor-shell .diary-shell-read__date,
.theme-dark.diary-editor-shell .diary-shell-edit__date,
.theme-dark.diary-editor-shell .diary-shell-read__title,
.theme-dark.diary-editor-shell .diary-shell-edit__title-display,
.theme-dark.diary-editor-shell .diary-editor-shell__icon-button,
.theme-dark.diary-editor-shell .diary-editor-shell__topbar-svg {
  color: var(--diary-paper-ink);
}

.theme-dark.diary-editor-shell .diary-editor-shell__title-placeholder,
.theme-dark.diary-editor-shell .diary-editor-shell__inline-placeholder,
.theme-dark.diary-editor-shell .diary-editor-shell__placeholder,
.theme-dark.diary-editor-shell .diary-editor-shell__saved-hint,
.theme-dark.diary-editor-shell .diary-editor-shell__continue-button,
.theme-dark.diary-editor-shell .diary-editor-shell__meta-image-button {
  color: var(--diary-paper-muted);
}

.theme-dark.diary-editor-shell .diary-editor-shell__attachment-card {
  background: var(--diary-paper-panel);
  box-shadow: inset 0 0 0 1rpx rgba(240, 232, 213, 0.04);
}

.theme-dark.diary-editor-shell .diary-editor-shell__attachment-remove {
  background: rgba(22, 18, 14, 0.9);
}

.theme-dark.diary-editor-shell .diary-editor-shell__attachment-remove-svg {
  color: var(--diary-paper-ink-soft);
}

.theme-dark.diary-editor-shell .diary-editor-shell__notice {
  color: rgba(232, 186, 176, 0.88);
}
</style>
