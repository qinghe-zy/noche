<template>
  <view class="jotting-editor-shell" :class="themeClass">
    <template v-if="mode === 'read'">
      <view class="jotting-shell-read">
        <scroll-view
          class="jotting-shell-read__scroll"
          :scroll-y="readCanScroll && !isTransitioningToEdit"
          :scroll-top="readAnimatedScrollTop"
          :scroll-with-animation="readScrollWithAnimation"
          @scroll="onReadScroll"
        >
          <view class="jotting-shell-read__spacer" :style="readSpacerStyle"></view>

          <view class="jotting-shell-read__paper" :style="readPaperStyle" @tap="handleContinueWriteTap">
            <text v-if="readMeta" class="jotting-shell-read__meta">{{ readMeta }}</text>

            <view v-if="attachments.length" class="jotting-shell-read__attachments">
              <view
                v-for="attachment in attachments"
                :key="attachment.id"
                class="jotting-shell-read__attachment-card"
                :class="{ 'jotting-shell-read__attachment-card--focused': focusedAttachmentId === attachment.id }"
                :id="`entry-attachment-${attachment.id}`"
                @tap.stop="$emit('preview-attachment', attachment.id)"
              >
                <image class="jotting-shell-read__attachment-image" :src="attachment.localUri" mode="aspectFill" />
              </view>
            </view>

            <text class="jotting-shell-read__content literary-text" :style="writingTextStyle">{{ content }}</text>
          </view>

          <text class="jotting-shell-read__signature" :style="{ opacity: stampOpacity }">{{ signatureLine }}</text>
          <view class="jotting-shell-read__bottom-pad"></view>
        </scroll-view>

        <view class="jotting-shell-read__overlay">
          <view class="jotting-shell-read__overlay-bg" :style="readOverlayBackgroundStyle"></view>

          <view class="jotting-shell-read__topbar" :style="topbarStyle">
            <TopbarIconButton @tap="$emit('go-back')" />

            <view
              v-if="canContinueWrite"
              class="jotting-editor-shell__continue-button jotting-shell-read__continue-button"
              @tap="handleContinueWriteTap"
            >
              {{ continueWriteLabel }}
            </view>
            <view v-else class="jotting-editor-shell__spacer"></view>
          </view>

          <text class="jotting-shell-read__eyebrow" :style="readEyebrowStyle">{{ eyebrowLabel }}</text>
          <text class="jotting-shell-read__date" :style="readDateStyle">{{ headlineDate }}</text>
          <text v-if="readTitle" class="jotting-shell-read__title" :style="readTitleStyle">{{ readTitle }}</text>
        </view>
      </view>
    </template>

    <template v-else-if="mode === 'edit'">
      <view class="jotting-shell-edit">
        <scroll-view
          class="jotting-shell-edit__scroll"
          :scroll-y="!isEditShellScrollLocked && editCanShellScroll"
          :scroll-top="editScrollTopBinding"
          :scroll-with-animation="scrollWithAnimation"
          @scroll="onEditShellScroll"
        >
          <view class="jotting-shell-edit__spacer" :style="editSpacerStyle"></view>

          <view class="jotting-shell-edit__paper" :style="editPaperStyle">
            <input
              class="jotting-editor-shell__title-input jotting-shell-edit__title-input"
              :style="editTitleInputStyle"
              :value="title"
              :placeholder="titlePlaceholder"
              placeholder-class="jotting-editor-shell__title-placeholder"
              maxlength="40"
              @input="$emit('title-input', $event)"
            />

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
                  class="jotting-editor-shell__attachment-remove"
                  @tap.stop="$emit('remove-attachment', attachment.id)"
                >
                  <AppIcon name="close" class="jotting-editor-shell__attachment-remove-svg" />
                </view>
              </view>
            </view>

            <view class="jotting-shell-edit__body" :style="editBodyStyle">
              <view class="jotting-shell-edit__editor-field">
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
                class="jotting-shell-edit__blank-spacer"
                :style="editStaticBlankSpacerStyle"
                @tap="handleBlankAreaFocus"
              ></view>
            </view>
          </view>

          <text class="jotting-shell-edit__signature" :style="{ opacity: stampOpacity }">{{ signatureLine }}</text>
          <view class="jotting-shell-edit__bottom-pad"></view>
        </scroll-view>

        <view class="jotting-shell-edit__overlay">
          <view class="jotting-shell-edit__overlay-bg" :style="editOverlayBackgroundStyle"></view>

          <view class="jotting-shell-edit__topbar" :style="topbarStyle">
            <TopbarIconButton @tap="$emit('go-back')" />

            <view class="jotting-shell-edit__topbar-actions">
              <view
                v-if="showImageAction"
                class="jotting-editor-shell__meta-image-button jotting-shell-edit__topbar-image-button"
                @tap="$emit('pick-images')"
              >
                <AppIcon name="image" class="jotting-editor-shell__meta-image-icon" />
              </view>

              <view class="jotting-editor-shell__icon-button jotting-shell-edit__save-button" @tap="$emit('formal-save')">
                <AppIcon name="check" class="jotting-editor-shell__icon-svg" />
              </view>
            </view>
          </view>

          <text class="jotting-shell-edit__eyebrow" :style="editEyebrowStyle">{{ eyebrowLabel }}</text>
          <text class="jotting-shell-edit__date" :style="editDateStyle">{{ headlineDate }}</text>
          <text
            v-if="title"
            class="jotting-shell-edit__title-display"
            :style="editTitleDisplayStyle"
          >
            {{ title }}
          </text>
        </view>
      </view>
    </template>
  </view>
</template>

<script setup lang="ts">
import { computed, getCurrentInstance, nextTick, onBeforeUnmount, onMounted, ref, toRefs, watch } from "vue";
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
import { useThemeClass } from "@/shared/theme";
import AppIcon from "@/shared/ui/AppIcon.vue";
import TopbarIconButton from "@/shared/ui/TopbarIconButton.vue";

type EditorMode = "edit" | "read";
type QueryRect = { height?: number | null; top?: number | null; width?: number | null };
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
const writingScrollTop = ref(0);
const scrollWithAnimation = ref(false);
const bodyViewportHeight = ref(0);
const bodyViewportTop = ref(0);
const pendingTapCaretLineBottom = ref<number | null>(null);

const readScrollTop = ref(0);
const readScrollWithAnimation = ref(false);
const readAnimatedScrollTop = ref(0);
const measuredPaperHeight = ref(0);
const measuredDateWidth = ref(0);
const isTransitioningToEdit = ref(false);

const editShellScrollTop = ref(0);
const editUserScrollTop = ref(0);
const editCollapseProgress = ref(0);
const measuredEditPaperHeight = ref(0);
const isProgrammaticEditBodyScroll = ref(false);
const editProgrammaticScrollTop = ref<number | undefined>(undefined);

let continueWriteTimer: ReturnType<typeof setTimeout> | null = null;
let editBodyScrollTimer: ReturnType<typeof setTimeout> | null = null;

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
  resolveInteractiveLayerHeight(visibleWindowHeight.value, shellFixedHeight.value, 260),
);

const editorAvailableWidth = computed(() =>
  Math.max(screenWidth.value - rpxToPx(152), props.writingFontSizePx * 6),
);

const bodyBottomPadding = computed(() =>
  rpxToPx(88) + (keyboardVisible.value ? minLineGapToKeyboard.value : restoreAfterKeyboardHide.value),
);

const bodyStageStyle = computed(() => ({
  minHeight: `${Math.max(bodyViewportHeight.value, interactiveLayerHeight.value)}px`,
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

const expandedEyebrowTop = computed(() => topbarBottom.value + rpxToPx(48));
const expandedEyebrowHeight = computed(() => rpxToPx(30));
const dateExpandedLeft = computed(() => rpxToPx(76));
const titleExpandedLeft = computed(() => rpxToPx(76));
const dateExpandedFontSize = computed(() => rpxToPx(60));
const dateCollapsedFontSize = computed(() => rpxToPx(26));
const titleCollapsedFontSize = computed(() => rpxToPx(26));
const editTitleInputFontSize = computed(() => rpxToPx(48));
const editCollapsedTitleFontSize = computed(() => rpxToPx(26));
const titleGapAfterDate = computed(() => rpxToPx(12));
const dateExpandedTopBase = computed(() => expandedEyebrowTop.value + expandedEyebrowHeight.value);
const dateExpandedLineHeight = computed(() => dateExpandedFontSize.value * 1.14);
const titleExpandedTopBase = computed(() => dateExpandedTopBase.value + dateExpandedLineHeight.value + rpxToPx(20));
const titleExpandedLineHeight = computed(() => editTitleInputFontSize.value * 1.25);
const titleCollapsedLineHeight = computed(() => titleCollapsedFontSize.value * 1.24);
const collapsedTopbarTextLineHeight = computed(() => dateCollapsedFontSize.value * 1.14);
const collapsedTopbarTextTop = computed(() => topbarTop.value + (topbarHeight.value - collapsedTopbarTextLineHeight.value) / 2);
const collapsedTopbarTargetTop = computed(() => collapsedTopbarTextTop.value + expandedEyebrowHeight.value);
const dateCollapsedLeft = computed(() => rpxToPx(132));
const expandedTitleMaxHeight = computed(() =>
  Math.max(visibleWindowHeight.value, titleExpandedLineHeight.value * 2),
);
const expandedMetaHeight = computed(() => titleExpandedTopBase.value + titleExpandedLineHeight.value - topbarBottom.value);
const editExpandedMetaHeight = computed(() => titleExpandedTopBase.value + titleExpandedLineHeight.value - topbarBottom.value);
const spacerHeight = computed(() => topbarBottom.value + expandedMetaHeight.value);
const editSpacerHeight = computed(() => topbarBottom.value + editExpandedMetaHeight.value);
const collapseDistance = computed(() => Math.max(expandedMetaHeight.value, 1));
const editCollapseDistance = computed(() => Math.max(editExpandedMetaHeight.value, 1));

const collapseProgress = computed(() =>
  resolveJottingCollapseProgress({
    effectiveCollapseScroll: readScrollTop.value,
    collapseStart: 0,
    collapseDistance: collapseDistance.value,
  }),
);

const readCanScroll = computed(() =>
  measuredPaperHeight.value > Math.max(visibleWindowHeight.value - spacerHeight.value, 0),
);

const editCanShellScroll = computed(() =>
  measuredEditPaperHeight.value > Math.max(visibleWindowHeight.value - editSpacerHeight.value, 0),
);

const isEditShellScrollLocked = computed(() => keyboardVisible.value);
const editScrollTopBinding = computed(() => editProgrammaticScrollTop.value);

const eyebrowFadeProgress = computed(() =>
  resolveJottingProgressWindow({
    progress: collapseProgress.value,
    start: 0,
    end: 0.3,
  }),
);
const editEyebrowFadeProgress = computed(() =>
  resolveJottingProgressWindow({
    progress: editCollapseProgress.value,
    start: 0,
    end: 0.3,
  }),
);
const eyebrowHeightProgress = computed(() =>
  resolveJottingProgressWindow({
    progress: collapseProgress.value,
    start: 0,
    end: 0.2,
  }),
);
const editEyebrowHeightProgress = computed(() =>
  resolveJottingProgressWindow({
    progress: editCollapseProgress.value,
    start: 0,
    end: 0.2,
  }),
);
const titleHeightProgress = computed(() =>
  resolveJottingProgressWindow({
    progress: collapseProgress.value,
    start: 0.5,
    end: 0.8,
  }),
);
const titleEllipsisProgress = computed(() =>
  resolveJottingProgressWindow({
    progress: collapseProgress.value,
    start: 0.8,
    end: 1,
  }),
);
const editTitleDisplayProgress = computed(() =>
  resolveJottingProgressWindow({
    progress: editCollapseProgress.value,
    start: 0.45,
    end: 0.7,
  }),
);
const paperFlattenProgress = computed(() =>
  resolveJottingProgressWindow({
    progress: collapseProgress.value,
    start: 0.65,
    end: 1,
  }),
);
const editPaperFlattenProgress = computed(() =>
  resolveJottingProgressWindow({
    progress: editCollapseProgress.value,
    start: 0.65,
    end: 1,
  }),
);

const eyebrowReleasedHeight = computed(() =>
  interpolateJottingMetric({
    progress: eyebrowHeightProgress.value,
    from: 0,
    to: expandedEyebrowHeight.value,
  }),
);

const editEyebrowReleasedHeight = computed(() =>
  interpolateJottingMetric({
    progress: editEyebrowHeightProgress.value,
    from: 0,
    to: expandedEyebrowHeight.value,
  }),
);

const currentDateFontSize = computed(() =>
  interpolateJottingMetric({
    progress: collapseProgress.value,
    from: dateExpandedFontSize.value,
    to: dateCollapsedFontSize.value,
  }),
);

const currentTitleFontSize = computed(() =>
  interpolateJottingMetric({
    progress: collapseProgress.value,
    from: rpxToPx(40),
    to: titleCollapsedFontSize.value,
  }),
);

const currentEditDateFontSize = computed(() =>
  interpolateJottingMetric({
    progress: editCollapseProgress.value,
    from: dateExpandedFontSize.value,
    to: dateCollapsedFontSize.value,
  }),
);

const collapsedTitleLeft = computed(() =>
  dateCollapsedLeft.value + measuredDateWidth.value + titleGapAfterDate.value,
);

const collapsedTitleRightSafe = computed(() => (props.canContinueWrite ? rpxToPx(180) : rpxToPx(120)));
const editCollapsedTitleRightSafe = computed(() => (props.showImageAction ? rpxToPx(220) : rpxToPx(148)));
const expandedDateMaxWidth = computed(() => Math.max(screenWidth.value - rpxToPx(152), dateExpandedFontSize.value));
const collapsedDateMaxWidth = computed(() => Math.max(measuredDateWidth.value + rpxToPx(8), dateCollapsedFontSize.value));
const expandedTitleMaxWidth = computed(() => Math.max(screenWidth.value - rpxToPx(152), rpxToPx(40)));
const collapsedTitleMaxWidth = computed(() =>
  Math.max(screenWidth.value - collapsedTitleLeft.value - collapsedTitleRightSafe.value, titleCollapsedFontSize.value),
);
const editCollapsedTitleMaxWidth = computed(() =>
  Math.max(screenWidth.value - collapsedTitleLeft.value - editCollapsedTitleRightSafe.value, editCollapsedTitleFontSize.value),
);
const editExpandedTitleMaxWidth = computed(() =>
  Math.max(screenWidth.value - rpxToPx(152), editTitleInputFontSize.value),
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
const editBodyStaticStyle = computed(() => ({
  minHeight: `${Math.max(visibleWindowHeight.value - editSpacerHeight.value - rpxToPx(64), renderWritingHeight.value)}px`,
  paddingBottom: `${rpxToPx(88)}px`,
}));

const editBodyStyle = computed(() => ({
  minHeight: `${Math.max(renderWritingHeight.value + bodyBottomPadding.value, visibleWindowHeight.value - editSpacerHeight.value - rpxToPx(64))}px`,
  paddingBottom: `${bodyBottomPadding.value}px`,
}));

const readSpacerStyle = computed(() => ({
  height: `${spacerHeight.value}px`,
}));

const editSpacerStyle = computed(() => ({
  height: `${keyboardVisible.value
    ? Math.max(topbarBottom.value + editExpandedMetaHeight.value * (1 - editCollapseProgress.value), topbarBottom.value)
    : editSpacerHeight.value}px`,
}));

const readOverlayBackgroundStyle = computed(() => ({
  height: `${Math.max(topbarBottom.value + expandedMetaHeight.value * (1 - collapseProgress.value), topbarBottom.value)}px`,
}));

const editOverlayBackgroundStyle = computed(() => ({
  height: `${Math.max(topbarBottom.value + editExpandedMetaHeight.value * (1 - editCollapseProgress.value), topbarBottom.value)}px`,
}));

const readEyebrowStyle = computed(() => ({
  top: `${expandedEyebrowTop.value}px`,
  left: `${dateExpandedLeft.value}px`,
  fontSize: `${rpxToPx(18)}px`,
  opacity: 1 - eyebrowFadeProgress.value,
}));

const editEyebrowStyle = computed(() => ({
  top: `${expandedEyebrowTop.value}px`,
  left: `${dateExpandedLeft.value}px`,
  fontSize: `${rpxToPx(18)}px`,
  opacity: 1 - editEyebrowFadeProgress.value,
}));

const readDateStyle = computed(() => ({
  top: `${interpolateJottingMetric({
    progress: collapseProgress.value,
    from: dateExpandedTopBase.value,
    to: collapsedTopbarTargetTop.value,
  }) - eyebrowReleasedHeight.value}px`,
  left: `${interpolateJottingMetric({
    progress: collapseProgress.value,
    from: dateExpandedLeft.value,
    to: dateCollapsedLeft.value,
  })}px`,
  fontSize: `${currentDateFontSize.value}px`,
  lineHeight: `${currentDateFontSize.value * 1.14}px`,
  maxWidth: `${interpolateJottingMetric({
    progress: collapseProgress.value,
    from: expandedDateMaxWidth.value,
    to: collapsedDateMaxWidth.value,
  })}px`,
}));

const editDateStyle = computed(() => ({
  top: `${interpolateJottingMetric({
    progress: editCollapseProgress.value,
    from: dateExpandedTopBase.value,
    to: collapsedTopbarTargetTop.value,
  }) - editEyebrowReleasedHeight.value}px`,
  left: `${interpolateJottingMetric({
    progress: editCollapseProgress.value,
    from: dateExpandedLeft.value,
    to: dateCollapsedLeft.value,
  })}px`,
  fontSize: `${currentEditDateFontSize.value}px`,
  lineHeight: `${currentEditDateFontSize.value * 1.14}px`,
  maxWidth: `${expandedDateMaxWidth.value}px`,
}));

const readTitleStyle = computed(() => {
  const singleLine = titleEllipsisProgress.value > 0;

  return {
    top: `${interpolateJottingMetric({
      progress: collapseProgress.value,
      from: titleExpandedTopBase.value,
      to: collapsedTopbarTargetTop.value,
    }) - eyebrowReleasedHeight.value}px`,
    left: `${interpolateJottingMetric({
      progress: collapseProgress.value,
      from: titleExpandedLeft.value,
      to: collapsedTitleLeft.value,
    })}px`,
    fontSize: `${currentTitleFontSize.value}px`,
    lineHeight: `${interpolateJottingMetric({
      progress: collapseProgress.value,
      from: titleExpandedLineHeight.value,
      to: titleCollapsedLineHeight.value,
    })}px`,
    maxWidth: `${interpolateJottingMetric({
      progress: collapseProgress.value,
      from: expandedTitleMaxWidth.value,
      to: collapsedTitleMaxWidth.value,
    })}px`,
    maxHeight: `${interpolateJottingMetric({
      progress: titleHeightProgress.value,
      from: expandedTitleMaxHeight.value,
      to: titleCollapsedLineHeight.value,
    })}px`,
    whiteSpace: singleLine ? "nowrap" : "normal",
    textOverflow: singleLine ? "ellipsis" : "clip",
  };
});

const editTitleInputStyle = computed(() => ({
  fontSize: `${editTitleInputFontSize.value}px`,
  lineHeight: `${titleExpandedLineHeight.value}px`,
  opacity: `${1 - editTitleDisplayProgress.value}`,
}));

const editTitleDisplayStyle = computed(() => ({
    top: `${interpolateJottingMetric({
      progress: editCollapseProgress.value,
      from: titleExpandedTopBase.value,
      to: collapsedTopbarTargetTop.value,
    }) - editEyebrowReleasedHeight.value}px`,
  left: `${interpolateJottingMetric({
    progress: editCollapseProgress.value,
    from: titleExpandedLeft.value,
    to: collapsedTitleLeft.value,
  })}px`,
  fontSize: `${interpolateJottingMetric({
    progress: editCollapseProgress.value,
    from: editTitleInputFontSize.value,
    to: editCollapsedTitleFontSize.value,
  })}px`,
  lineHeight: `${interpolateJottingMetric({
    progress: editCollapseProgress.value,
    from: titleExpandedLineHeight.value,
    to: titleCollapsedLineHeight.value,
  })}px`,
    maxWidth: `${interpolateJottingMetric({
      progress: editCollapseProgress.value,
      from: editExpandedTitleMaxWidth.value,
      to: editCollapsedTitleMaxWidth.value,
    })}px`,
  opacity: `${editTitleDisplayProgress.value}`,
  whiteSpace: editCollapseProgress.value >= 0.8 ? "nowrap" : "normal",
  textOverflow: editCollapseProgress.value >= 0.8 ? "ellipsis" : "clip",
}));

function resolvePaperStyle(progress: number): Record<string, string> {
  const topRadius = interpolateJottingMetric({
    progress,
    from: rpxToPx(28),
    to: 0,
  });
  const shadowOpacity = interpolateJottingMetric({
    progress,
    from: 0.06,
    to: 0,
  });

  return {
    borderTopLeftRadius: `${topRadius}px`,
    borderTopRightRadius: `${topRadius}px`,
    borderBottomLeftRadius: `${rpxToPx(28)}px`,
    borderBottomRightRadius: `${rpxToPx(28)}px`,
    boxShadow: `0 ${rpxToPx(8)}px ${rpxToPx(48)}px rgba(49, 51, 46, ${shadowOpacity})`,
  };
}

const readPaperStyle = computed(() => resolvePaperStyle(paperFlattenProgress.value));
const editPaperStyle = computed(() => resolvePaperStyle(editPaperFlattenProgress.value));

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

function measurePaperHeight(): void {
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
      .select(".jotting-shell-read__paper")
      .boundingClientRect()
      .exec((results: Array<QueryRect | null | undefined>) => {
        const rect = results?.[0];
        measuredPaperHeight.value = typeof rect?.height === "number" ? Math.max(rect.height, 0) : 0;
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
      .select(".jotting-shell-edit__paper")
      .boundingClientRect()
      .exec((results: Array<QueryRect | null | undefined>) => {
        const rect = results?.[0];
        measuredEditPaperHeight.value = typeof rect?.height === "number" ? Math.max(rect.height, 0) : 0;
      });
  });
}

function measureCollapsedDateWidth(): void {
  nextTick(() => {
    const publicInstance = instance?.proxy;
    if (!publicInstance || typeof uni === "undefined" || typeof uni.createSelectorQuery !== "function") {
      return;
    }

    const selector = props.mode === "edit"
      ? ".jotting-shell-edit__date"
      : ".jotting-shell-read__date";

    uni.createSelectorQuery()
      .in(publicInstance)
      .select(selector)
      .boundingClientRect()
      .exec((results: Array<QueryRect | null | undefined>) => {
        const rect = results?.[0];
        const activeFontSize = props.mode === "edit" ? currentEditDateFontSize.value : currentDateFontSize.value;

        if (typeof rect?.width !== "number" || rect.width <= 0 || activeFontSize <= 0) {
          return;
        }

        measuredDateWidth.value = Math.max(
          rect.width * (dateCollapsedFontSize.value / activeFontSize),
          0,
        );
      });
  });
}

function measureHeights(): void {
  nextTick(() => {
    const publicInstance = instance?.proxy;
    if (!publicInstance || typeof uni === "undefined" || typeof uni.createSelectorQuery !== "function") {
      return;
    }

    uni.createSelectorQuery()
      .in(publicInstance)
      .select(".jotting-editor-shell__fixed-layer")
      .boundingClientRect()
      .select(".jotting-editor-shell__body")
      .boundingClientRect()
      .exec((results: Array<QueryRect | null | undefined>) => {
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
      .select(".jotting-shell-edit__scroll")
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

function resetReadState(): void {
  readScrollTop.value = 0;
  readScrollWithAnimation.value = false;
  readAnimatedScrollTop.value = 0;
  measuredPaperHeight.value = 0;
  measuredDateWidth.value = estimateJottingTextWidth(props.headlineDate, dateCollapsedFontSize.value);
  isTransitioningToEdit.value = false;
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
  measuredDateWidth.value = estimateJottingTextWidth(props.headlineDate, dateCollapsedFontSize.value);
}

function scheduleReadMeasurements(): void {
  if (props.mode !== "read") {
    return;
  }

  measurePaperHeight();
  measureCollapsedDateWidth();
}

function scheduleEditMeasurements(): void {
  if (props.mode !== "edit") {
    return;
  }

  shellFixedHeight.value = editSpacerHeight.value;
  measureEditPaperHeight();
  if (keyboardVisible.value) {
    measureEditBodyViewport();
  }
  measureCollapsedDateWidth();
}

function clearContinueWriteTimer(): void {
  if (continueWriteTimer !== null) {
    clearTimeout(continueWriteTimer);
    continueWriteTimer = null;
  }
}

function clearEditBodyScrollTimer(): void {
  if (editBodyScrollTimer !== null) {
    clearTimeout(editBodyScrollTimer);
    editBodyScrollTimer = null;
  }
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
      collapseDistance: editCollapseDistance.value,
    });
  }
}

function handleContinueWriteTap(): void {
  if (props.mode !== "read" || !props.canContinueWrite || isTransitioningToEdit.value) {
    return;
  }

  if (collapseProgress.value <= 0.05) {
    emit("continue-write");
    return;
  }

  clearContinueWriteTimer();
  isTransitioningToEdit.value = true;
  readScrollWithAnimation.value = true;
  readAnimatedScrollTop.value = Math.max(readScrollTop.value, 1);

  nextTick(() => {
    readAnimatedScrollTop.value = 0;
  });

  continueWriteTimer = setTimeout(() => {
    continueWriteTimer = null;
    isTransitioningToEdit.value = false;
    readScrollWithAnimation.value = false;
    readScrollTop.value = 0;
    emit("continue-write");
  }, 250);
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

  if (props.mode === "read") {
    measurePaperHeight();
    return;
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
    viewportHeight: Math.max(bodyViewportHeight.value, props.writingLineHeightPx * 4),
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

function handleBlankAreaFocus(): void {
  if (props.mode !== "edit") {
    return;
  }

  emit("focus-end-request");
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

  if (props.mode === "edit") {
    resetEditState();
    scheduleEditMeasurements();
    return;
  }

  resetReadState();
  scheduleReadMeasurements();
});

onBeforeUnmount(() => {
  clearContinueWriteTimer();
  clearEditBodyScrollTimer();
});

watch(
  () => props.content,
  (nextContent) => {
    measuredContentHeight.value = Math.max(estimateVisibleContentHeight(), props.writingLineHeightPx);

    if (props.mode !== "edit") {
      measurePaperHeight();
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
  () => [props.attachments.length, props.mode],
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
    clearContinueWriteTimer();
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
  readScrollWithAnimation.value = false;
  readAnimatedScrollTop.value = 0;
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
.jotting-editor-shell,
.jotting-editor-shell * {
  box-sizing: border-box;
}

.jotting-editor-shell {
  height: 100vh;
  --jotting-heading-font: var(--font-heading);
  --jotting-body-font: var(--font-body);
  background:
    radial-gradient(circle at top left, var(--page-atmosphere-primary, transparent), transparent 28%),
    radial-gradient(circle at top right, var(--page-atmosphere-secondary, transparent), transparent 24%),
    var(--app-bg, var(--noche-bg));
  color: var(--text-primary, var(--noche-text));
  font-family: var(--jotting-body-font);
  overflow: hidden;
  position: relative;
}

.jotting-shell-read,
.jotting-shell-edit {
  position: relative;
  height: 100%;
}

.jotting-shell-read__scroll,
.jotting-shell-edit__scroll {
  position: relative;
  z-index: 1;
  height: 100%;
}

.jotting-shell-read__spacer,
.jotting-shell-edit__spacer {
  width: 100%;
}

.jotting-shell-read__paper,
.jotting-shell-edit__paper {
  margin: 0 32rpx;
  padding: 40rpx 44rpx;
  background: var(--surface-primary, var(--noche-surface));
  border: 1px solid var(--border-subtle, var(--noche-border));
  box-shadow: var(--shadow-ring, 0 0 0 1px rgba(221, 212, 200, 0.72));
}

.jotting-shell-read__meta {
  display: block;
  margin-bottom: 24rpx;
  font-family: var(--jotting-body-font);
  font-size: 20rpx;
  color: var(--text-secondary, var(--noche-muted));
}

.jotting-shell-read__attachments,
.jotting-editor-shell__attachments {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16rpx;
  margin-bottom: 24rpx;
}

.jotting-shell-read__attachment-card,
.jotting-editor-shell__attachment-card {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  overflow: hidden;
  border-radius: 20rpx;
  background: var(--surface-secondary, var(--noche-panel));
  border: 1px solid var(--border-subtle, var(--noche-border));
}

.jotting-shell-read__attachment-card--focused,
.jotting-editor-shell__attachment-card--focused {
  box-shadow: var(--shadow-ring, 0 0 0 1px rgba(221, 212, 200, 0.72));
}

.jotting-shell-read__attachment-image,
.jotting-editor-shell__attachment-image {
  width: 100%;
  height: 100%;
}

.jotting-shell-read__content {
  display: block;
  width: 100%;
  min-height: 0;
  white-space: pre-wrap;
}

.jotting-shell-read__signature,
.jotting-shell-edit__signature {
  display: block;
  margin: 24rpx 40rpx 0;
  text-align: right;
  font-size: 20rpx;
  color: var(--text-secondary, var(--noche-muted));
  font-style: italic;
}

.jotting-shell-read__bottom-pad,
.jotting-shell-edit__bottom-pad {
  height: 96rpx;
}

.jotting-shell-read__overlay,
.jotting-shell-edit__overlay {
  position: absolute;
  inset: 0 0 auto 0;
  z-index: 10;
  pointer-events: none;
}

.jotting-shell-read__overlay-bg,
.jotting-shell-edit__overlay-bg {
  position: absolute;
  inset: 0 0 auto 0;
  background: var(--app-bg, var(--noche-bg));
}

.jotting-shell-read__topbar,
.jotting-shell-edit__topbar {
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

.jotting-shell-read__continue-button,
.jotting-shell-edit__save-button {
  pointer-events: auto;
}

.jotting-shell-edit__topbar-actions {
  display: flex;
  align-items: center;
  gap: 8rpx;
  pointer-events: auto;
}

.jotting-shell-edit__topbar-image-button {
  pointer-events: auto;
}

.jotting-shell-read__eyebrow,
.jotting-shell-read__date,
.jotting-shell-read__title,
.jotting-shell-edit__eyebrow,
.jotting-shell-edit__date,
.jotting-shell-edit__title-display {
  position: absolute;
  overflow: hidden;
}

.jotting-shell-read__eyebrow,
.jotting-shell-edit__eyebrow {
  font-family: var(--jotting-body-font);
  letter-spacing: 0.26em;
  text-transform: uppercase;
  color: var(--text-secondary, var(--noche-muted));
}

.jotting-shell-read__date,
.jotting-shell-edit__date {
  font-family: var(--jotting-heading-font);
  letter-spacing: 0.04em;
}

.jotting-shell-read__title,
.jotting-shell-edit__title-display {
  font-family: var(--jotting-heading-font);
  word-break: break-word;
}

.jotting-shell-edit__title-input {
  margin-bottom: 24rpx;
}

.jotting-shell-edit__body,
.jotting-shell-edit__body-static {
  display: flex;
  flex-direction: column;
}

.jotting-shell-edit__editor-field {
  position: relative;
}

.jotting-shell-edit__blank-spacer {
  width: 100%;
}

.jotting-editor-shell__body {
  min-height: 0;
}

.jotting-editor-shell__body-stage {
  min-height: 100%;
  display: flex;
  flex-direction: column;
}

.jotting-editor-shell__editor-field {
  flex: 1 0 auto;
  min-height: 100%;
  display: flex;
  position: relative;
}

.jotting-editor-shell__textarea,
.jotting-shell-read__content {
  width: 100%;
  border: none;
  background: transparent;
  padding: 0;
  color: var(--text-primary, var(--noche-text));
  font-family: var(--jotting-body-font);
  font-size: 18px;
  line-height: 2;
}

.jotting-editor-shell__textarea {
  flex: 0 0 auto;
  min-height: 100%;
  position: relative;
  z-index: 1;
}

.jotting-editor-shell__blank-spacer {
  width: 100%;
  flex: 1 0 auto;
}

.jotting-editor-shell__icon-button {
  width: 88rpx;
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--button-topbar-text, var(--text-secondary, var(--noche-muted)));
  background: var(--button-topbar-bg, transparent);
  border: 1px solid var(--button-topbar-border, transparent);
  border-radius: var(--button-pill-radius, 999rpx);
  box-shadow: var(--button-topbar-shadow, none);
}

.jotting-editor-shell__icon-svg {
  width: 44rpx;
  height: 44rpx;
  color: currentColor;
}

.jotting-editor-shell__continue-button {
  min-height: 56rpx;
  font-size: 24rpx;
  color: var(--button-pill-text, var(--text-primary, var(--noche-text)));
  background: var(--button-pill-bg);
  border: 1px solid var(--button-pill-border, transparent);
  border-radius: var(--button-pill-radius, 999rpx);
  box-shadow: var(--button-pill-shadow, none);
  padding: 0 22rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.jotting-editor-shell__spacer {
  width: 88rpx;
  height: 88rpx;
}

.jotting-editor-shell__meta-image-button {
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--button-topbar-text, var(--text-secondary, var(--noche-muted)));
  background: var(--button-topbar-bg, transparent);
  border: 1px solid var(--button-topbar-border, transparent);
  border-radius: var(--button-pill-radius, 999rpx);
  box-shadow: var(--button-topbar-shadow, none);
}

.jotting-editor-shell__meta-image-icon {
  width: 28rpx;
  height: 28rpx;
  color: currentColor;
}

.jotting-editor-shell__title-input {
  width: 100%;
  min-height: 56rpx;
  border: none;
  background: transparent;
  padding: 0;
  color: var(--text-primary, var(--noche-text));
  font-family: var(--jotting-heading-font);
}

.jotting-editor-shell__title-placeholder {
  color: var(--text-secondary, var(--noche-muted));
  font-weight: 300;
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
  background: var(--surface-primary, var(--noche-surface));
}

.jotting-editor-shell__attachment-remove-svg {
  width: 28rpx;
  height: 28rpx;
  color: var(--text-primary, var(--noche-text));
}

.jotting-editor-shell__placeholder {
  color: var(--text-secondary, var(--noche-muted));
  font-weight: 300;
}

.jotting-editor-shell__inline-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  color: var(--text-secondary, var(--noche-muted));
  font-size: var(--jotting-writing-font-size, 18px);
  line-height: var(--jotting-writing-line-height, 36px);
  pointer-events: none;
}
</style>
