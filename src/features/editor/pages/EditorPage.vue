<template>
  <view class="editor-page" :class="`editor-page--${entryType}`">
    <view class="editor-page__glow"></view>

    <view class="editor-page__hero">
      <view class="editor-page__eyebrow">
        <text class="editor-page__eyebrow-label">{{ pageMeta.eyebrow }}</text>
        <text class="editor-page__eyebrow-date">{{ heroDate }}</text>
      </view>

      <text class="editor-page__title">{{ pageMeta.title }}</text>
      <text class="editor-page__subtitle">{{ pageMeta.subtitle }}</text>
    </view>

    <view v-if="errorMessage" class="editor-page__banner editor-page__banner--error">
      <text>{{ errorMessage }}</text>
    </view>

    <view v-else-if="draftStatusText" class="editor-page__banner">
      <text>{{ draftStatusText }}</text>
    </view>

    <view v-if="mode === 'edit'" class="editor-page__sheet">
      <view class="editor-page__sheet-header">
        <view>
          <text class="editor-page__section-label">Draft Slot</text>
          <text class="editor-page__section-value">{{ activeSlotLabel }}</text>
        </view>

        <button class="editor-page__ghost-button" @click="handleDiscardDraft">
          Reset Draft
        </button>
      </view>

      <view class="editor-page__field-group">
        <text class="editor-page__field-label">Title</text>
        <input
          class="editor-page__input"
          :value="title"
          maxlength="80"
          placeholder="Give this page a line to lean on"
          placeholder-class="editor-page__placeholder"
          @input="handleTitleInput"
        />
      </view>

      <view v-if="entryType === 'future'" class="editor-page__field-group">
        <text class="editor-page__field-label">Unlock Date</text>
        <input
          class="editor-page__input"
          :value="unlockDate"
          type="date"
          @input="handleUnlockDateInput"
        />
        <text class="editor-page__hint">Future letters must unlock no earlier than tomorrow.</text>
      </view>

      <view class="editor-page__field-group editor-page__field-group--content">
        <view class="editor-page__content-head">
          <text class="editor-page__field-label">Content</text>
          <text class="editor-page__counter">{{ contentLength }} chars</text>
        </view>
        <textarea
          class="editor-page__textarea"
          :value="content"
          auto-height
          maxlength="-1"
          placeholder="Write the part that should stay."
          placeholder-class="editor-page__placeholder"
          @input="handleContentInput"
        />
      </view>

      <view class="editor-page__actions">
        <button
          class="editor-page__primary-button"
          :disabled="!canSaveEntry || draftStore.isLoading || entryStore.isLoading"
          @click="handleFormalSave"
        >
          {{ pageMeta.saveLabel }}
        </button>
        <button
          class="editor-page__secondary-button"
          :disabled="draftStore.isLoading"
          @click="handleManualSave"
        >
          Save Draft
        </button>
      </view>
    </view>

    <view v-else-if="savedEntry" class="editor-page__sheet editor-page__sheet--read">
      <view class="editor-page__read-header">
        <text class="editor-page__section-label">Saved Entry</text>
        <text class="editor-page__saved-stamp">{{ savedStamp }}</text>
      </view>

      <text class="editor-page__read-title">{{ savedEntry.title || pageMeta.fallbackTitle }}</text>
      <text class="editor-page__read-meta">{{ readMeta }}</text>
      <text class="editor-page__read-content">{{ savedEntry.content }}</text>

      <view class="editor-page__actions">
        <button class="editor-page__primary-button" @click="handleStartAnother">
          Start Another
        </button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { onLoad, onUnload } from "@dcloudio/uni-app";
import { useDraftStore } from "@/app/store/useDraftStore";
import { useEntryStore } from "@/app/store/useEntryStore";
import type { Entry, EntryType } from "@/domain/entry/types";
import { lockRecordDate } from "@/domain/time/rules";
import { formatDate, tomorrowDate } from "@/shared/utils/date";

type EditorMode = "edit" | "read";

const PAGE_META: Record<
  EntryType,
  {
    eyebrow: string;
    title: string;
    subtitle: string;
    saveLabel: string;
    fallbackTitle: string;
  }
> = {
  diary: {
    eyebrow: "Today",
    title: "Write while the day is still warm",
    subtitle: "One dated page, one locked slot, one honest record.",
    saveLabel: "Save Today",
    fallbackTitle: "Today",
  },
  jotting: {
    eyebrow: "Jotting",
    title: "Catch the thought before it dries out",
    subtitle: "Small notes are still real notes.",
    saveLabel: "Save Jotting",
    fallbackTitle: "Quick Jotting",
  },
  future: {
    eyebrow: "Future",
    title: "Seal a note for a later self",
    subtitle: "Choose when it should return and let it wait there.",
    saveLabel: "Seal Letter",
    fallbackTitle: "Future Letter",
  },
};

const draftStore = useDraftStore();
const entryStore = useEntryStore();

const entryType = ref<EntryType>("diary");
const recordDate = ref(lockRecordDate());
const mode = ref<EditorMode>("edit");
const title = ref("");
const content = ref("");
const unlockDate = ref("");
const savedEntry = ref<Entry | null>(null);
const isHydrating = ref(false);

let saveTimer: ReturnType<typeof setTimeout> | null = null;

const pageMeta = computed(() => PAGE_META[entryType.value]);
const heroDate = computed(() =>
  entryType.value === "future" && unlockDate.value
    ? `Unlock ${unlockDate.value}`
    : formatDate(recordDate.value, "MMM DD, YYYY"),
);
const contentLength = computed(() => content.value.trim().length);
const activeSlotLabel = computed(() => draftStore.activeDraft?.slotKey ?? "Not opened");
const canSaveEntry = computed(() => {
  const hasBody = title.value.trim().length > 0 || content.value.trim().length > 0;
  const hasFutureDate = entryType.value !== "future" || Boolean(unlockDate.value);
  return hasBody && hasFutureDate;
});
const draftStatusText = computed(() => {
  if (mode.value !== "edit") {
    return "Entry saved. This page is now in read mode.";
  }

  if (draftStore.isLoading) {
    return "Persisting draft...";
  }

  if (draftStore.activeDraft?.lastBackgroundSavedAt) {
    return `Draft saved at ${formatDate(draftStore.activeDraft.lastBackgroundSavedAt, "HH:mm")}`;
  }

  return "Draft opened. Start writing.";
});
const errorMessage = computed(() => draftStore.error ?? entryStore.error);
const savedStamp = computed(() =>
  savedEntry.value?.savedAt ? formatDate(savedEntry.value.savedAt, "MMM DD, YYYY HH:mm") : "",
);
const readMeta = computed(() => {
  if (!savedEntry.value) {
    return "";
  }

  if (savedEntry.value.type === "future" && savedEntry.value.unlockDate) {
    return `Unlocks on ${savedEntry.value.unlockDate}`;
  }

  return `Recorded on ${savedEntry.value.recordDate}`;
});

function extractInputValue(event: Event | { detail?: { value?: string } }): string {
  const detailValue =
    "detail" in event && typeof event.detail?.value === "string" ? event.detail.value : undefined;

  if (typeof detailValue === "string") {
    return detailValue;
  }

  const target = (event as { target?: HTMLInputElement | HTMLTextAreaElement | null }).target;
  return target?.value ?? "";
}

function normalizeEntryType(rawType?: string): EntryType {
  if (rawType === "jotting" || rawType === "future") {
    return rawType;
  }

  return "diary";
}

function syncFormFromDraft(): void {
  const draft = draftStore.activeDraft;
  if (!draft) {
    return;
  }

  title.value = draft.title;
  content.value = draft.content;
  recordDate.value = draft.recordDate ?? lockRecordDate();
  unlockDate.value = draft.type === "future" ? draft.unlockDate ?? tomorrowDate() : "";
}

async function openCurrentDraft(): Promise<void> {
  isHydrating.value = true;

  try {
    const draft = await draftStore.openDraft({
      type: entryType.value,
      recordDate: entryType.value === "diary" ? recordDate.value : undefined,
    });

    mode.value = "edit";
    savedEntry.value = null;
    syncFormFromDraft();

    if (draft.type === "future" && !draft.unlockDate) {
      await draftStore.saveActiveDraft({ unlockDate: unlockDate.value });
    }
  } finally {
    isHydrating.value = false;
  }
}

async function persistDraftNow(): Promise<void> {
  if (!draftStore.activeDraft) {
    return;
  }

  await draftStore.saveActiveDraft({
    title: title.value,
    content: content.value,
    unlockDate: entryType.value === "future" ? unlockDate.value : null,
  });
}

function queueDraftSave(): void {
  if (isHydrating.value || mode.value !== "edit") {
    return;
  }

  if (saveTimer) {
    clearTimeout(saveTimer);
  }

  saveTimer = setTimeout(() => {
    void persistDraftNow();
    saveTimer = null;
  }, 180);
}

function handleTitleInput(event: Event | { detail?: { value?: string } }): void {
  title.value = extractInputValue(event);
  queueDraftSave();
}

function handleContentInput(event: Event | { detail?: { value?: string } }): void {
  content.value = extractInputValue(event);
  queueDraftSave();
}

function handleUnlockDateInput(event: Event | { detail?: { value?: string } }): void {
  unlockDate.value = extractInputValue(event);
  queueDraftSave();
}

async function handleManualSave(): Promise<void> {
  try {
    await persistDraftNow();
    uni.showToast({
      title: "Draft saved",
      icon: "none",
    });
  } catch (error) {
    uni.showToast({
      title: error instanceof Error ? error.message : "Failed to save draft",
      icon: "none",
    });
  }
}

async function handleDiscardDraft(): Promise<void> {
  const slotKey = draftStore.activeDraft?.slotKey;
  if (!slotKey) {
    return;
  }

  await draftStore.removeDraft(slotKey);
  title.value = "";
  content.value = "";
  unlockDate.value = entryType.value === "future" ? tomorrowDate() : "";
  await openCurrentDraft();
}

async function handleFormalSave(): Promise<void> {
  if (!canSaveEntry.value) {
    uni.showToast({
      title: "Write something first",
      icon: "none",
    });
    return;
  }

  try {
    if (saveTimer) {
      clearTimeout(saveTimer);
      saveTimer = null;
    }

    await persistDraftNow();
    const entry = await draftStore.saveActiveDraftAsEntry();

    if (!entry) {
      throw new Error(draftStore.error ?? "Failed to save entry");
    }

    savedEntry.value = entry;
    mode.value = "read";

    uni.showToast({
      title: "Entry saved",
      icon: "none",
    });
  } catch (error) {
    uni.showToast({
      title: error instanceof Error ? error.message : "Failed to save entry",
      icon: "none",
    });
  }
}

async function handleStartAnother(): Promise<void> {
  title.value = "";
  content.value = "";
  unlockDate.value = entryType.value === "future" ? tomorrowDate() : "";
  await openCurrentDraft();
}

onLoad((query) => {
  entryType.value = normalizeEntryType(typeof query?.type === "string" ? query.type : undefined);
  recordDate.value = lockRecordDate();
  unlockDate.value = entryType.value === "future" ? tomorrowDate() : "";
  uni.setNavigationBarTitle({
    title: PAGE_META[entryType.value].eyebrow,
  });
  void openCurrentDraft();
});

onUnload(() => {
  if (saveTimer) {
    clearTimeout(saveTimer);
    saveTimer = null;
  }
});
</script>

<style scoped>
.editor-page {
  min-height: 100vh;
  padding: 56rpx 32rpx 72rpx;
  background:
    radial-gradient(circle at top right, rgba(177, 141, 255, 0.16), transparent 34%),
    radial-gradient(circle at top left, rgba(238, 190, 145, 0.22), transparent 28%),
    linear-gradient(180deg, #f8f4ef 0%, #f4efe8 100%);
  position: relative;
  overflow: hidden;
}

.editor-page--jotting {
  background:
    radial-gradient(circle at top right, rgba(124, 184, 255, 0.18), transparent 34%),
    radial-gradient(circle at top left, rgba(240, 206, 150, 0.2), transparent 28%),
    linear-gradient(180deg, #f6f5f0 0%, #edf0e9 100%);
}

.editor-page--future {
  background:
    radial-gradient(circle at top right, rgba(255, 189, 120, 0.18), transparent 34%),
    radial-gradient(circle at top left, rgba(122, 116, 255, 0.18), transparent 28%),
    linear-gradient(180deg, #f7f0ea 0%, #efe8e1 100%);
}

.editor-page__glow {
  position: absolute;
  width: 420rpx;
  height: 420rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.55);
  filter: blur(56rpx);
  top: -80rpx;
  right: -120rpx;
}

.editor-page__hero,
.editor-page__banner,
.editor-page__sheet {
  position: relative;
  z-index: 1;
}

.editor-page__hero {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
  margin-bottom: 28rpx;
}

.editor-page__eyebrow {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16rpx;
}

.editor-page__eyebrow-label,
.editor-page__eyebrow-date,
.editor-page__section-label,
.editor-page__counter,
.editor-page__hint,
.editor-page__read-meta {
  font-size: 22rpx;
  letter-spacing: 4rpx;
  text-transform: uppercase;
  color: rgba(34, 34, 34, 0.58);
}

.editor-page__title {
  font-size: 62rpx;
  line-height: 1.08;
  font-weight: 600;
  color: #1d1d1d;
}

.editor-page__subtitle {
  font-size: 28rpx;
  line-height: 1.6;
  color: rgba(34, 34, 34, 0.68);
  max-width: 620rpx;
}

.editor-page__banner {
  margin-bottom: 24rpx;
  padding: 18rpx 22rpx;
  border-radius: 22rpx;
  background: rgba(255, 255, 255, 0.62);
  border: 1rpx solid rgba(34, 34, 34, 0.06);
  color: rgba(34, 34, 34, 0.72);
  font-size: 24rpx;
}

.editor-page__banner--error {
  background: rgba(136, 49, 49, 0.08);
  color: #7d3535;
}

.editor-page__sheet {
  padding: 32rpx 28rpx 28rpx;
  border-radius: 32rpx;
  background: rgba(255, 255, 255, 0.78);
  border: 1rpx solid rgba(34, 34, 34, 0.06);
  box-shadow: 0 24rpx 60rpx rgba(31, 22, 13, 0.08);
  backdrop-filter: blur(16rpx);
}

.editor-page__sheet--read {
  gap: 20rpx;
}

.editor-page__sheet-header,
.editor-page__content-head,
.editor-page__read-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20rpx;
}

.editor-page__section-value,
.editor-page__saved-stamp {
  display: block;
  margin-top: 8rpx;
  font-size: 28rpx;
  color: #1f1f1f;
}

.editor-page__field-group {
  display: flex;
  flex-direction: column;
  gap: 14rpx;
  margin-top: 28rpx;
}

.editor-page__field-group--content {
  margin-top: 34rpx;
}

.editor-page__field-label {
  font-size: 24rpx;
  font-weight: 600;
  color: #2b2b2b;
}

.editor-page__input,
.editor-page__textarea {
  width: 100%;
  box-sizing: border-box;
  border-radius: 24rpx;
  background: rgba(250, 246, 241, 0.95);
  border: 1rpx solid rgba(34, 34, 34, 0.08);
  color: #1f1f1f;
}

.editor-page__input {
  min-height: 92rpx;
  padding: 0 24rpx;
  font-size: 28rpx;
}

.editor-page__textarea {
  min-height: 420rpx;
  padding: 26rpx 24rpx;
  font-size: 30rpx;
  line-height: 1.75;
}

.editor-page__placeholder {
  color: rgba(34, 34, 34, 0.3);
}

.editor-page__actions {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  margin-top: 34rpx;
}

.editor-page__primary-button,
.editor-page__secondary-button,
.editor-page__ghost-button {
  border: none;
  border-radius: 999rpx;
  font-size: 28rpx;
  line-height: 1;
}

.editor-page__primary-button {
  min-height: 92rpx;
  background: #1f1f1f;
  color: #faf7f2;
}

.editor-page__primary-button[disabled] {
  opacity: 0.45;
}

.editor-page__secondary-button {
  min-height: 88rpx;
  background: rgba(255, 255, 255, 0.74);
  color: #1f1f1f;
  border: 1rpx solid rgba(34, 34, 34, 0.08);
}

.editor-page__ghost-button {
  min-width: 180rpx;
  min-height: 72rpx;
  padding: 0 24rpx;
  background: rgba(255, 255, 255, 0.56);
  color: rgba(34, 34, 34, 0.76);
  border: 1rpx solid rgba(34, 34, 34, 0.06);
}

.editor-page__read-title {
  display: block;
  margin-top: 22rpx;
  font-size: 42rpx;
  line-height: 1.2;
  color: #1d1d1d;
  font-weight: 600;
}

.editor-page__read-content {
  display: block;
  margin-top: 26rpx;
  white-space: pre-wrap;
  font-size: 30rpx;
  line-height: 1.78;
  color: rgba(34, 34, 34, 0.86);
}
</style>
