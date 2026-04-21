<template>
  <view class="mailbox-page" :class="[themeClass, typographyClass]">
    <view class="mailbox-page__topbar">
      <view class="mailbox-page__topbar-inner" :style="topbarInnerStyle">
        <TopbarIconButton @tap="handleGoHome" />
        <text class="mailbox-page__topbar-title">{{ copy.mailbox.title }}</text>
        <TopbarIconButton icon-name="calendar" @tap="handleGoToCalendar" />
      </view>
    </view>

    <view class="mailbox-page__main">
      <view class="mailbox-page__switcher">
        <view class="mailbox-page__tab-group mailbox-page__tab-group--primary">
          <button
            class="mailbox-page__tab-pill mailbox-page__tab-pill--primary"
            :class="{ 'mailbox-page__tab-pill--active': activeTab === 'documentary' }"
            @click="handlePrimaryTabChange('documentary')"
          >
            <text class="mailbox-page__tab-pill-text mailbox-page__tab-pill-text--primary">{{ copy.mailbox.documentary }}</text>
          </button>
          <button
            class="mailbox-page__tab-pill mailbox-page__tab-pill--primary"
            :class="{ 'mailbox-page__tab-pill--active': activeTab === 'distant' }"
            @click="handlePrimaryTabChange('distant')"
          >
            <text class="mailbox-page__tab-pill-text mailbox-page__tab-pill-text--primary">{{ copy.mailbox.distant }}</text>
          </button>
        </view>
      </view>

      <view class="mailbox-page__switcher mailbox-page__switcher--secondary">
        <view class="mailbox-page__tab-group mailbox-page__tab-group--secondary">
          <button
            v-for="option in secondaryOptions"
            :key="option.value"
            class="mailbox-page__tab-pill mailbox-page__tab-pill--secondary"
            :class="{ 'mailbox-page__tab-pill--active': activeSecondaryTab === option.value }"
            @click="activeSecondaryTab = option.value"
          >
            <text class="mailbox-page__tab-pill-text mailbox-page__tab-pill-text--secondary">{{ option.label }}</text>
          </button>
        </view>
      </view>

      <component :is="contentContainerTag" class="mailbox-page__content" :scroll-y="shouldScrollContent">
        <view class="mailbox-page__content-body" :style="contentBodyStyle">
          <view v-if="mailboxStore.isLoading" class="mailbox-page__state">
            <text class="mailbox-page__state-text">{{ copy.mailbox.loading }}</text>
          </view>

          <view v-else-if="mailboxStore.error" class="mailbox-page__state mailbox-page__state--error">
            <text class="mailbox-page__state-text">{{ mailboxStore.error }}</text>
            <button class="mailbox-page__retry" @click="refresh">{{ copy.mailbox.reload }}</button>
          </view>

          <view v-else-if="activeSection.entries.length === 0" class="mailbox-page__state">
            <text class="mailbox-page__state-text">
              {{ activeSection.emptyText }}
            </text>
          </view>

          <view v-else class="mailbox-page__module-list">
            <view class="mailbox-page__module">
              <view class="mailbox-page__module-head">
                <view class="mailbox-page__module-tab">
                  <text class="mailbox-page__module-tab-text">{{ activeSection.title }}</text>
                  <view class="mailbox-page__module-tab-underline"></view>
                </view>
                <text class="mailbox-page__module-count">{{ activeSection.entries.length }}</text>
              </view>

              <view class="mailbox-page__list">
                <view
                v-for="entry in activeSection.entries"
                :key="entry.id"
                class="mailbox-page__entry-shell"
                :class="activeSection.stackClass"
                @click="handleEntryClick(entry)"
                @longpress="handleEntryLongPress(entry)"
              >
                  <view
                    class="mailbox-page__entry-card"
                    :class="activeSection.cardClass"
                  >
                    <view class="mailbox-page__entry-head">
                      <view class="mailbox-page__entry-badge">
                        <view class="mailbox-page__entry-dot"></view>
                        <text class="mailbox-page__entry-type">{{ formatTypeLabel(entry.type) }}</text>
                      </view>
                      <view class="mailbox-page__entry-meta-cluster">
                        <text class="mailbox-page__entry-date">{{ formatDateLabel(entry, activeSection.dateTab) }}</text>
                        <view
                          v-if="hasDiaryPreludeGlyphs(entry)"
                          class="mailbox-page__entry-prelude"
                        >
                          <DiaryPreludeGlyph
                            v-if="entry.diaryPrelude?.weatherCode"
                            class="mailbox-page__entry-prelude-glyph"
                            kind="weather"
                            :code="entry.diaryPrelude.weatherCode"
                          />
                          <DiaryPreludeGlyph
                            v-if="entry.diaryPrelude?.moodCode"
                            class="mailbox-page__entry-prelude-glyph"
                            kind="mood"
                            :code="entry.diaryPrelude.moodCode"
                          />
                        </view>
                      </view>
                    </view>

                    <template v-if="activeSection.renderMode === 'paper'">
                      <text class="mailbox-page__entry-title">{{ entry.title || fallbackEntryTitle(entry.type, settingsStore.locale) }}</text>
                      <text class="mailbox-page__entry-excerpt">{{ formatExcerpt(entry) }}</text>
                      <view class="mailbox-page__entry-foot">
                        <text class="mailbox-page__entry-meta">{{ activeSection.metaLabel }}</text>
                        <AppIcon :name="resolveMailboxMetaIcon(activeSection.metaIcon)" class="mailbox-page__entry-icon" />
                      </view>
                    </template>

                    <template v-else>
                      <view class="mailbox-page__sealed-center">
                        <view class="mailbox-page__sealed-lock">
                          <AppIcon name="lock" class="mailbox-page__sealed-lock-icon" />
                          <text class="mailbox-page__sealed-lock-label">{{ settingsStore.locale === "en-US" ? "Reserved" : "保留中" }}</text>
                        </view>

                        <view class="mailbox-page__sealed-icon-wrap">
                          <AppIcon name="mail" class="mailbox-page__sealed-icon" />
                        </view>

                        <text class="mailbox-page__sealed-title">{{ formatMailboxLockedTitle(entry, settingsStore.locale) }}</text>
                      </view>

                      <view class="mailbox-page__sealed-bottom">
                        <text class="mailbox-page__sealed-copy">{{ formatExcerpt(entry) }}</text>
                        <view class="mailbox-page__sealed-wax">
                          <view class="mailbox-page__sealed-wax-core"></view>
                        </view>
                      </view>
                    </template>
                  </view>
                </view>
              </view>
            </view>
          </view>
        </view>
      </component>
    </view>

    <button class="mailbox-page__fab" :style="fabStyle" @click="handleComposeCurrentSection">
      <AppIcon name="edit-square" class="mailbox-page__fab-icon" />
    </button>

    <PaperConfirmDialog
      :open="isLockedFutureDialogOpen"
      :title="copy.mailbox.lockedTitle"
      :copy="lockedFutureDialogCopy"
      :actions="lockedFutureDialogActions"
      @close="closeLockedFutureDialog"
      @action="handleLockedFutureDialogAction"
    />

    <PaperConfirmDialog
      :open="isDeleteDialogOpen"
      :title="copy.mailbox.deleteTitle"
      :copy="copy.mailbox.deleteCopy"
      :actions="deleteDialogActions"
      @close="closeDeleteDialog"
      @action="handleDeleteDialogAction"
    />
  </view>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import { onShow } from "@dcloudio/uni-app";
import { useSettingsStore } from "@/app/store/useSettingsStore";
import { useMailboxStore } from "@/app/store/useMailboxStore";
import { useEntryStore } from "@/app/store/useEntryStore";
import type { Entry, EntryType } from "@/domain/entry/types";
import { ROUTES } from "@/shared/constants/routes";
import { formatDate } from "@/shared/utils/date";
import { createDateChangeWatcher } from "@/shared/utils/dateChange";
import { navigateBackOrFallback } from "@/shared/utils/navigation";
import TopbarIconButton from "@/shared/ui/TopbarIconButton.vue";
import AppIcon from "@/shared/ui/AppIcon.vue";
import PaperConfirmDialog, { type PaperConfirmDialogAction } from "@/shared/ui/PaperConfirmDialog.vue";
import DiaryPreludeGlyph from "@/features/editor/components/DiaryPreludeGlyph.vue";
import {
  formatMailboxDateLabel,
  formatMailboxExcerpt,
  formatMailboxLockedTitle,
  formatMailboxTypeLabel,
} from "@/features/mailbox/mailboxDisplay";
import { fallbackEntryTitle } from "@/features/entries/entryDisplay";
import { useEditorKeyboardViewport } from "@/features/editor/composables/useEditorKeyboardViewport";
import { useThemeClass, useTypographyClass } from "@/shared/theme";
import {
  getDefaultMailboxSecondaryTab,
  getMailboxSecondaryOptions,
  resolveMailboxComposeType,
  type MailboxPrimaryTab,
  type MailboxSecondaryTab,
} from "@/features/mailbox/mailboxView";
import { t } from "@/shared/i18n";

interface MailboxSection {
  key: string;
  title: string;
  emptyText: string;
  entries: Entry[];
  renderMode: "paper" | "sealed";
  stackClass: string;
  cardClass: string;
  metaLabel: string;
  metaIcon: string;
  dateTab: "past" | "future";
}

const mailboxStore = useMailboxStore();
const settingsStore = useSettingsStore();
const themeClass = useThemeClass();
const typographyClass = useTypographyClass();
const { statusBarHeight, safeAreaBottom, topbarBottomSpacing, rpxToPx } = useEditorKeyboardViewport();
const copy = computed(() => t(settingsStore.locale));
const defaultMailboxLabels = {
  documentary: "纪实",
  distant: "寄远",
  diary: "日记",
  jotting: "随笔",
  opened: "已启",
  pending: "待启",
} as const;
const activeTab = ref<MailboxPrimaryTab>("documentary");
const activeSecondaryTab = ref<MailboxSecondaryTab>(getDefaultMailboxSecondaryTab("documentary"));
const lockedFutureEntry = ref<Entry | null>(null);
const isLockedFutureDialogOpen = ref(false);
const pendingDeleteEntry = ref<Entry | null>(null);
const isDeleteDialogOpen = ref(false);
const dateChangeWatcher = createDateChangeWatcher({
  getDateKey: () => formatDate(new Date(), "YYYY-MM-DD"),
  onDateChange: async () => {
    await refresh();
  },
});

const activeSections = computed<MailboxSection[]>(() => {
  if (activeTab.value === "documentary") {
    return [
      {
        key: "documentary-diary",
        title: copy.value.mailbox.diary || defaultMailboxLabels.diary,
        emptyText: settingsStore.locale === "en-US" ? "No diary page is stored here yet." : "这里还没有日记。",
        entries: mailboxStore.documentaryDiaries,
        renderMode: "paper",
        stackClass: "mailbox-page__paper-stack",
        cardClass: "",
        metaLabel: settingsStore.locale === "en-US" ? "Filed away" : "已经收好",
        metaIcon: "auto_stories",
        dateTab: "past",
      },
      {
        key: "documentary-jotting",
        title: copy.value.mailbox.jotting || defaultMailboxLabels.jotting,
        emptyText: settingsStore.locale === "en-US" ? "No jotting is stored here yet." : "这里还没有随笔。",
        entries: mailboxStore.documentaryJottings,
        renderMode: "paper",
        stackClass: "mailbox-page__paper-stack",
        cardClass: "",
        metaLabel: settingsStore.locale === "en-US" ? "Filed away" : "已经收好",
        metaIcon: "edit_note",
        dateTab: "past",
      },
    ];
  }

  return [
    {
      key: "distant-opened",
      title: copy.value.mailbox.opened || defaultMailboxLabels.opened,
      emptyText: settingsStore.locale === "en-US" ? "No opened To Future page is stored here yet." : "这里还没有已启的致未来。",
      entries: mailboxStore.distantOpenedFutures,
      renderMode: "paper",
      stackClass: "mailbox-page__paper-stack",
      cardClass: "",
      metaLabel: settingsStore.locale === "en-US" ? "Opened now" : "已经开启",
      metaIcon: "mark_email_read",
      dateTab: "past",
    },
    {
      key: "distant-pending",
      title: copy.value.mailbox.pending || defaultMailboxLabels.pending,
      emptyText: settingsStore.locale === "en-US" ? "No pending To Future page is stored here yet." : "这里还没有待启的致未来。",
      entries: mailboxStore.distantPendingFutures,
      renderMode: "sealed",
      stackClass: "mailbox-page__sealed-stack",
      cardClass: "mailbox-page__entry-card--sealed",
      metaLabel: settingsStore.locale === "en-US" ? "Not opened yet" : "尚未开启",
      metaIcon: "lock",
      dateTab: "future",
    },
  ];
});

const secondaryOptions = computed(() => getMailboxSecondaryOptions(activeTab.value, settingsStore.locale));

const activeSection = computed<MailboxSection>(() => {
  const matched = activeSections.value.find((section) =>
    section.key.endsWith(activeSecondaryTab.value),
  );

  return matched ?? activeSections.value[0];
});
const topbarInnerStyle = computed(() => ({
  paddingTop: `${statusBarHeight.value + rpxToPx(32)}px`,
  paddingLeft: `${rpxToPx(32)}px`,
  paddingRight: `${rpxToPx(32)}px`,
  paddingBottom: `${topbarBottomSpacing.value}px`,
}));
const fabStyle = computed(() => ({
  bottom: `${safeAreaBottom.value + rpxToPx(24)}px`,
}));
const contentBodyStyle = computed(() => ({
  paddingBottom: shouldScrollContent.value ? `${safeAreaBottom.value + rpxToPx(144)}px` : "0px",
}));
const shouldScrollContent = computed(() => activeSection.value.entries.length > 1);
const contentContainerTag = computed(() => (shouldScrollContent.value ? "scroll-view" : "view"));
const lockedFutureDialogCopy = computed(() =>
  settingsStore.locale === "en-US"
    ? (lockedFutureEntry.value?.unlockDate
      ? `This note opens on ${lockedFutureEntry.value.unlockDate}. You can also destroy it now.`
      : "This note is not ready to open yet. You can also destroy it now.")
    : (lockedFutureEntry.value?.unlockDate
      ? `这封信会在 ${lockedFutureEntry.value.unlockDate} 当天开启。你也可以现在销毁它。`
      : "这封信还没有到开启的时候。你也可以现在销毁它。"),
);
const lockedFutureDialogActions = computed<PaperConfirmDialogAction[]>(() => ([
  {
    key: "keep",
    title: copy.value.mailbox.lockedKeep,
    tone: "muted",
  },
  {
    key: "destroy",
    title: copy.value.mailbox.lockedDestroy,
    tone: "danger",
  },
]));
const deleteDialogActions = computed<PaperConfirmDialogAction[]>(() => ([
  {
    key: "keep",
    title: copy.value.mailbox.deleteKeep,
    tone: "muted",
  },
  {
    key: "delete",
    title: copy.value.mailbox.deleteConfirm,
    tone: "danger",
  },
]));

function isSealedFuture(entry: Entry): boolean {
  return entry.type === "future" && entry.status === "sealed";
}

function formatDateLabel(entry: Entry, tab: "past" | "future"): string {
  return formatMailboxDateLabel(entry, tab, settingsStore.locale);
}

function formatTypeLabel(type: EntryType): string {
  return formatMailboxTypeLabel(type, settingsStore.locale);
}

function formatExcerpt(entry: Entry): string {
  return formatMailboxExcerpt(entry, settingsStore.locale);
}

function resolveMailboxMetaIcon(icon: string): "stories" | "edit-note" | "mail-read" | "mail" {
  if (icon === "edit_note") {
    return "edit-note";
  }

  if (icon === "mark_email_read") {
    return "mail-read";
  }

  return icon === "mail" ? "mail" : "stories";
}

function hasDiaryPreludeGlyphs(entry: Entry): boolean {
  return entry.type === "diary" && Boolean(entry.diaryPrelude?.weatherCode || entry.diaryPrelude?.moodCode);
}

async function refresh() {
  await mailboxStore.refreshMailbox();
}

function handleGoHome() {
  navigateBackOrFallback({
    fallbackUrl: `/${ROUTES.home}`,
  });
}

function handleGoToCalendar() {
  uni.navigateTo({ url: `/${ROUTES.calendar}` });
}

function handleOpenJotting() {
  uni.navigateTo({ url: `/${ROUTES.editor}?type=jotting` });
}

function handlePrimaryTabChange(nextTab: MailboxPrimaryTab): void {
  activeTab.value = nextTab;
  activeSecondaryTab.value = getDefaultMailboxSecondaryTab(nextTab);
}

function handleComposeCurrentSection(): void {
  const composeType = resolveMailboxComposeType(activeSecondaryTab.value);
  uni.navigateTo({ url: `/${ROUTES.editor}?type=${composeType}` });
}

function handleEntryClick(entry: Entry) {
  if (isSealedFuture(entry)) {
    void handleLockedFuture(entry);
    return;
  }

  uni.navigateTo({
    url: `/${ROUTES.editor}?mode=read&entryId=${entry.id}`,
  });
}

function handleEntryLongPress(entry: Entry): void {
  pendingDeleteEntry.value = entry;
  isDeleteDialogOpen.value = true;
}

onMounted(() => {
  void refresh();
  dateChangeWatcher.start();
});

onShow(() => {
  void refresh();
  dateChangeWatcher.sync();
});

onUnmounted(() => {
  dateChangeWatcher.stop();
});

function closeLockedFutureDialog(): void {
  isLockedFutureDialogOpen.value = false;
  lockedFutureEntry.value = null;
}

function closeDeleteDialog(): void {
  isDeleteDialogOpen.value = false;
  pendingDeleteEntry.value = null;
}

async function handleLockedFutureDialogAction(actionKey: string): Promise<void> {
  const entry = lockedFutureEntry.value;
  closeLockedFutureDialog();

  if (actionKey !== "destroy" || !entry) {
    return;
  }

  await mailboxStore.fetchEntryById(entry.id);
  const entryStore = useEntryStore();
  await entryStore.destroyEntry(entry.id);
  await refresh();

  uni.showToast({
    title: copy.value.mailbox.destroyedToast,
    icon: "none",
  });
}

async function handleDeleteDialogAction(actionKey: string): Promise<void> {
  const entry = pendingDeleteEntry.value;
  closeDeleteDialog();

  if (actionKey !== "delete" || !entry) {
    return;
  }

  const entryStore = useEntryStore();
  await entryStore.destroyEntry(entry.id);
  await refresh();

  uni.showToast({
    title: copy.value.mailbox.destroyedToast,
    icon: "none",
  });
}

async function handleLockedFuture(entry: Entry): Promise<void> {
  lockedFutureEntry.value = entry;
  isLockedFutureDialogOpen.value = true;
}
</script>

<style scoped>
.mailbox-page,
.mailbox-page * {
  box-sizing: border-box;
}

.mailbox-page {
  height: 100vh;
  background:
    radial-gradient(circle at top left, var(--page-atmosphere-primary, transparent), transparent 26%),
    radial-gradient(circle at top right, var(--page-atmosphere-secondary, transparent), transparent 24%),
    var(--app-bg, var(--noche-bg));
  color: var(--text-primary, var(--noche-text));
  font-family: var(--font-body, inherit);
  position: relative;
  overflow: hidden;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  --mailbox-font-body: var(--font-body);
}

.mailbox-page__topbar {
  position: sticky;
  top: 0;
  width: 100%;
  background: var(--surface-primary, var(--noche-surface));
  z-index: 20;
}

.mailbox-page__topbar-inner {
  width: 100%;
  max-width: 640px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.mailbox-page__topbar-title {
  font-size: 30rpx;
  font-weight: 300;
  letter-spacing: 0.25em;
  color: var(--text-primary, var(--noche-text));
  padding-left: 0.25em;
  font-family: var(--font-heading, inherit);
}

.mailbox-page__main {
  flex: 1;
  min-height: 0;
  width: 100%;
  max-width: 640px;
  margin: 0 auto;
  padding: 4px 24px 0;
  display: flex;
  flex-direction: column;
}

.mailbox-page__switcher {
  display: flex;
  justify-content: center;
  margin-bottom: 15px;
}

.mailbox-page__switcher--secondary {
  margin-bottom: 22px;
}

.mailbox-page__tab-group {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px;
  border-radius: 18px;
  border: 1px solid var(--border-subtle, var(--noche-border));
  background: var(--surface-primary, var(--noche-surface));
}

.mailbox-page__tab-group--primary {
  width: 312px;
  min-height: 46px;
}

.mailbox-page__tab-group--secondary {
  width: 232px;
  min-height: 38px;
  border-radius: 9999px;
}

.mailbox-page__content {
  flex: 1;
  min-height: 0;
}

.mailbox-page__content-body {
  min-height: 100%;
}

.mailbox-page__tab-pill {
  border: none;
  border-radius: 9999px;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mailbox-page__tab-pill--primary {
  flex: 1;
  min-height: 38px;
  padding: 0 18px;
  border-radius: 14px;
}

.mailbox-page__tab-pill--secondary {
  flex: 1;
  min-height: 30px;
  padding: 0 12px;
}

.mailbox-page__tab-pill-text {
  font-family: var(--font-body, inherit);
  color: var(--text-secondary, var(--noche-muted));
}

.mailbox-page__tab-pill-text--primary {
  font-size: 14px;
  letter-spacing: 0.14em;
  padding-left: 0.14em;
}

.mailbox-page__tab-pill-text--secondary {
  font-size: 12px;
  letter-spacing: 0.08em;
  padding-left: 0.08em;
}

.mailbox-page__tab-pill--active {
  background: var(--button-pill-bg, var(--button-secondary-bg, var(--noche-panel)));
  border: 1px solid var(--button-pill-border, var(--button-secondary-border, var(--noche-border)));
  box-shadow: var(--button-pill-shadow, var(--button-secondary-shadow, none));
}


.mailbox-page__tab-pill--active .mailbox-page__tab-pill-text {
  color: var(--button-pill-text, var(--text-primary, var(--noche-text)));
  font-weight: 600;
}

.mailbox-page__state {
  padding: 120px 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.mailbox-page__state-text {
  font-size: 15px;
  line-height: 1.8;
  text-align: center;
  color: var(--text-secondary, var(--noche-muted));
}

.mailbox-page__state--error .mailbox-page__state-text {
  color: var(--button-danger-text, #9f403d);
}

.mailbox-page__retry {
  min-height: 40px;
  padding: 0 18px;
  border: 1px solid var(--button-pill-border, var(--button-secondary-border, var(--noche-border)));
  background: var(--button-pill-bg, var(--button-secondary-bg, var(--noche-panel)));
  font-size: 14px;
  color: var(--button-pill-text, var(--button-secondary-text, var(--noche-text)));
  border-radius: var(--button-pill-radius, 999px);
  box-shadow: var(--button-pill-shadow, var(--button-secondary-shadow, none));
}

.mailbox-page__module-list {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.mailbox-page__module {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding-top: 4px;
}

.mailbox-page__module-head {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  position: relative;
}

.mailbox-page__module-count {
  position: absolute;
  right: 0;
  font-family: var(--font-body, inherit);
  font-size: 10px;
  letter-spacing: 0.18em;
  color: var(--text-tertiary, var(--noche-muted));
  padding-left: 0.18em;
}

.mailbox-page__module-tab {
  position: relative;
  padding: 0 0 8px;
}

.mailbox-page__module-tab-text {
  font-family: var(--font-body, inherit);
  font-size: 11px;
  letter-spacing: 0.3em;
  color: var(--text-primary, var(--noche-text));
  font-weight: 500;
  padding-left: 0.3em;
}

.mailbox-page__module-tab-underline {
  position: absolute;
  left: 50%;
  bottom: 0;
  width: 14px;
  height: 1px;
  transform: translateX(-50%);
  background: var(--border-prominent, var(--noche-muted));
}

.mailbox-page__module-empty {
  padding: 20px 0 8px;
}

.mailbox-page__module-empty-text {
  font-family: var(--font-body, inherit);
  font-size: 13px;
  line-height: 1.7;
  color: var(--text-secondary, var(--noche-muted));
}

.mailbox-page__list {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.mailbox-page__entry-shell {
  position: relative;
}

.mailbox-page__paper-stack::before,
.mailbox-page__paper-stack::after,
.mailbox-page__sealed-stack::before,
.mailbox-page__sealed-stack::after {
  display: none;
}

.mailbox-page__entry-card {
  background: var(--surface-primary, var(--noche-surface));
  border: 1px solid var(--border-subtle, var(--noche-border));
  padding: 24px 22px;
  border-radius: 18px;
}

.mailbox-page__entry-card--sealed {
  background: var(--surface-secondary, var(--noche-panel));
  border-color: var(--border-subtle, var(--noche-border));
}

.mailbox-page__entry-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 16px;
}

.mailbox-page__entry-meta-cluster {
  display: flex;
  align-items: center;
  gap: 10px;
}

.mailbox-page__entry-badge {
  display: flex;
  align-items: center;
  gap: 8px;
}

.mailbox-page__entry-dot {
  width: 4px;
  height: 4px;
  background: var(--text-tertiary, rgba(177, 179, 171, 0.7));
}

.mailbox-page__entry-type,
.mailbox-page__entry-date,
.mailbox-page__entry-meta,
.mailbox-page__sealed-lock-label,
.mailbox-page__footer-text {
  font-family: var(--font-body, inherit);
  font-size: 9px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--text-tertiary, var(--noche-muted));
}

.mailbox-page__entry-type,
.mailbox-page__sealed-lock-label,
.mailbox-page__footer-text {
  padding-left: 0.18em;
}

.mailbox-page__entry-prelude {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--text-tertiary, var(--noche-muted));
}

.mailbox-page__entry-prelude-glyph {
  width: 14px;
  height: 14px;
}

.mailbox-page__entry-title {
  display: block;
  font-size: 22px;
  line-height: 1.5;
  color: var(--text-primary, var(--noche-text));
  margin-bottom: 12px;
  font-family: var(--font-heading);
}

.mailbox-page__entry-excerpt {
  display: block;
  font-size: 13px;
  line-height: 1.9;
  color: var(--text-secondary, var(--noche-text));
}

.mailbox-page__entry-foot {
  margin-top: 18px;
  padding-top: 14px;
  border-top: 1px solid var(--border-prominent, var(--border-subtle, var(--noche-border)));
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.mailbox-page__entry-icon {
  width: 16px;
  height: 16px;
  color: var(--text-tertiary, var(--noche-muted));
}

.mailbox-page__sealed-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2px 0 14px;
}

.mailbox-page__sealed-lock {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 6px;
  opacity: 0.6;
  margin-bottom: 18px;
}

.mailbox-page__sealed-lock-icon {
  width: 12px;
  height: 12px;
}

.mailbox-page__sealed-icon-wrap {
  margin-bottom: 14px;
  opacity: 0.24;
}

.mailbox-page__sealed-icon {
  width: 24px;
  height: 24px;
}

.mailbox-page__sealed-title {
  font-family: var(--font-body, inherit);
  font-size: 15px;
  font-weight: 500;
  letter-spacing: 0.12em;
  color: var(--text-primary, var(--noche-text));
  padding-left: 0.12em;
  text-align: center;
}

.mailbox-page__sealed-bottom {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
}

.mailbox-page__sealed-copy {
  font-family: var(--font-body, inherit);
  font-size: 12px;
  line-height: 1.6;
  text-align: center;
  color: var(--text-secondary, var(--noche-muted));
}

.mailbox-page__sealed-wax {
  width: 14px;
  height: 14px;
  border-radius: 9999px;
  background: var(--button-chip-bg, var(--surface-secondary, rgba(138, 129, 120, 0.12)));
  border: 1px solid var(--button-chip-border, var(--border-subtle, rgba(138, 129, 120, 0.2)));
  display: flex;
  align-items: center;
  justify-content: center;
}

.mailbox-page__sealed-wax-core {
  width: 5px;
  height: 5px;
  border-radius: 9999px;
  background: var(--button-chip-text, var(--border-prominent, rgba(138, 129, 120, 0.28)));
}

.mailbox-page__fab {
  width: 56px;
  height: 56px;
  border: 1px solid var(--button-fab-border, var(--button-primary-border, transparent));
  border-radius: var(--button-radius, 18px);
  background: var(--button-fab-bg, var(--button-primary-bg, var(--noche-text)));
  color: var(--button-fab-text, var(--button-primary-text, var(--noche-bg)));
  box-shadow: var(--button-fab-shadow, var(--button-primary-shadow, 0 8px 18px rgba(49, 51, 46, 0.1)));
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 30;
}

.mailbox-page__fab-icon {
  width: 22px;
  height: 22px;
}

.type-scale-small .mailbox-page__topbar-title { font-size: 28rpx; }
.type-scale-large .mailbox-page__topbar-title { font-size: 32rpx; }
.type-scale-small .mailbox-page__tab-pill-text--primary,
.type-scale-small .mailbox-page__retry { font-size: 13px; }
.type-scale-large .mailbox-page__tab-pill-text--primary,
.type-scale-large .mailbox-page__retry { font-size: 15px; }
.type-scale-small .mailbox-page__tab-pill-text--secondary,
.type-scale-small .mailbox-page__sealed-copy { font-size: 11px; }
.type-scale-large .mailbox-page__tab-pill-text--secondary,
.type-scale-large .mailbox-page__sealed-copy { font-size: 13px; }
.type-scale-small .mailbox-page__state-text,
.type-scale-small .mailbox-page__sealed-title { font-size: 14px; }
.type-scale-large .mailbox-page__state-text,
.type-scale-large .mailbox-page__sealed-title { font-size: 16px; }
.type-scale-small .mailbox-page__module-count { font-size: 9px; }
.type-scale-large .mailbox-page__module-count { font-size: 11px; }
.type-scale-small .mailbox-page__module-tab-text { font-size: 10px; }
.type-scale-large .mailbox-page__module-tab-text { font-size: 12px; }
.type-scale-small .mailbox-page__entry-type,
.type-scale-small .mailbox-page__entry-date,
.type-scale-small .mailbox-page__entry-meta,
.type-scale-small .mailbox-page__sealed-lock-label,
.type-scale-small .mailbox-page__footer-text { font-size: 8px; }
.type-scale-large .mailbox-page__entry-type,
.type-scale-large .mailbox-page__entry-date,
.type-scale-large .mailbox-page__entry-meta,
.type-scale-large .mailbox-page__sealed-lock-label,
.type-scale-large .mailbox-page__footer-text { font-size: 10px; }
.type-scale-small .mailbox-page__entry-title { font-size: 21px; }
.type-scale-large .mailbox-page__entry-title { font-size: 24px; }
.type-scale-small .mailbox-page__entry-excerpt { font-size: 12px; }
.type-scale-large .mailbox-page__entry-excerpt { font-size: 14px; }
</style>
