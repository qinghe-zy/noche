<template>
  <PageScaffold
    class="mailbox-page"
    :title="copy.mailbox.title"
    :show-left="true"
    left-icon="back"
    :reserve-right="false"
    :topbar-bordered="true"
    :max-width="'720px'"
    @left-tap="handleGoHome"
  >
    <template #right>
      <TopbarIconButton icon-name="calendar" @tap="handleGoToCalendar" />
    </template>

    <view class="mailbox-page__main noche-mobile-main">
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

      <scroll-view scroll-y class="mailbox-page__content noche-mobile-scroll">
        <view class="mailbox-page__content-fill noche-mobile-scroll-fill">
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
      </scroll-view>
    </view>

    <button class="mailbox-page__fab" @click="handleComposeCurrentSection">
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
  </PageScaffold>
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
import TopbarIconButton from "@/shared/ui/TopbarIconButton.vue";
import AppIcon from "@/shared/ui/AppIcon.vue";
import PageScaffold from "@/shared/ui/PageScaffold.vue";
import PaperConfirmDialog, { type PaperConfirmDialogAction } from "@/shared/ui/PaperConfirmDialog.vue";
import DiaryPreludeGlyph from "@/features/editor/components/DiaryPreludeGlyph.vue";
import {
  formatMailboxDateLabel,
  formatMailboxExcerpt,
  formatMailboxLockedTitle,
  formatMailboxTypeLabel,
} from "@/features/mailbox/mailboxDisplay";
import { fallbackEntryTitle } from "@/features/entries/entryDisplay";
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
  uni.reLaunch({ url: `/${ROUTES.home}` });
}

function handleGoToCalendar() {
  uni.navigateTo({ url: `/${ROUTES.calendar}` });
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
  background: var(--noche-bg);
  color: var(--noche-text);
  font-family: "Noto Serif SC", "Source Han Serif SC", serif;
  position: relative;
}

.mailbox-page__main {
  width: 100%;
  min-height: var(--noche-content-min-height);
  padding: 12rpx var(--noche-page-padding-x) 0;
  display: flex;
  flex-direction: column;
  gap: 14rpx;
}

.mailbox-page__switcher {
  display: flex;
  justify-content: center;
}

.mailbox-page__switcher--secondary {
  margin-bottom: 2rpx;
}

.mailbox-page__tab-group {
  width: 100%;
  display: inline-flex;
  align-items: center;
  gap: 8rpx;
  padding: 8rpx;
  border-radius: 24rpx;
  border: 1px solid var(--noche-border);
  background: color-mix(in srgb, var(--noche-surface) 96%, transparent);
}

.mailbox-page__tab-group--primary {
  max-width: 520rpx;
  min-height: 88rpx;
}

.mailbox-page__tab-group--secondary {
  max-width: 420rpx;
  min-height: 76rpx;
  border-radius: 9999rpx;
}

.mailbox-page__content {
  padding-bottom: var(--noche-page-bottom-padding);
}

.mailbox-page__content-fill {
  gap: 0;
}

.mailbox-page__tab-pill {
  border: none;
  border-radius: 9999rpx;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mailbox-page__tab-pill--primary {
  flex: 1;
  min-height: 72rpx;
  padding: 0 24rpx;
  border-radius: 18rpx;
}

.mailbox-page__tab-pill--secondary {
  flex: 1;
  min-height: 60rpx;
  padding: 0 18rpx;
}

.mailbox-page__tab-pill-text {
  font-family: "Inter", sans-serif;
  color: var(--noche-muted);
}

.mailbox-page__tab-pill-text--primary {
  font-size: 24rpx;
  letter-spacing: 0.12em;
  padding-left: 0.12em;
}

.mailbox-page__tab-pill-text--secondary {
  font-size: 20rpx;
  letter-spacing: 0.08em;
  padding-left: 0.08em;
}

.mailbox-page__tab-pill--active {
  background: var(--noche-panel);
  border: 1px solid var(--noche-border);
}

.mailbox-page__tab-pill--active .mailbox-page__tab-pill-text {
  color: var(--noche-text);
  font-weight: 600;
}

.mailbox-page__state {
  min-height: var(--noche-empty-state-min-height);
  padding: 72rpx 28rpx 28rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 18rpx;
  text-align: center;
}

.mailbox-page__state-text {
  font-size: 26rpx;
  line-height: 1.8;
  color: var(--noche-ink-soft);
}

.mailbox-page__state--error .mailbox-page__state-text {
  color: var(--noche-danger);
}

.mailbox-page__retry {
  min-height: 72rpx;
  padding: 0 28rpx;
  border: 1px solid var(--noche-border);
  background: var(--noche-panel);
  font-size: 24rpx;
  color: var(--noche-text);
}

.mailbox-page__module-list {
  display: flex;
  flex-direction: column;
  gap: 22rpx;
}

.mailbox-page__module {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  padding-top: 4rpx;
}

.mailbox-page__module-head {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
  position: relative;
}

.mailbox-page__module-count {
  position: absolute;
  right: 4rpx;
  font-family: "Inter", sans-serif;
  font-size: 18rpx;
  letter-spacing: 0.18em;
  color: var(--noche-ink-subtle);
  padding-left: 0.18em;
}

.mailbox-page__module-tab {
  position: relative;
  padding: 0 0 10rpx;
}

.mailbox-page__module-tab-text {
  font-family: "Inter", sans-serif;
  font-size: 20rpx;
  letter-spacing: 0.28em;
  color: var(--noche-text);
  font-weight: 600;
  padding-left: 0.28em;
}

.mailbox-page__module-tab-underline {
  position: absolute;
  left: 50%;
  bottom: 0;
  width: 18px;
  height: 1px;
  transform: translateX(-50%);
  background: var(--noche-muted);
}

.mailbox-page__list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
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
  background: var(--noche-surface);
  border: 1px solid var(--noche-border);
  padding: 26rpx 24rpx;
  border-radius: 24rpx;
}

.mailbox-page__entry-card--sealed {
  background: var(--noche-panel);
  border-color: var(--noche-border);
}

.mailbox-page__entry-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16rpx;
  margin-bottom: 16rpx;
}

.mailbox-page__entry-meta-cluster {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.mailbox-page__entry-badge {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.mailbox-page__entry-dot {
  width: 4px;
  height: 4px;
  background: var(--noche-ink-subtle);
}

.mailbox-page__entry-type,
.mailbox-page__entry-date,
.mailbox-page__entry-meta,
.mailbox-page__sealed-lock-label {
  font-family: "Inter", sans-serif;
  font-size: 18rpx;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--noche-ink-subtle);
}

.mailbox-page__entry-type,
.mailbox-page__sealed-lock-label {
  padding-left: 0.18em;
}

.mailbox-page__entry-prelude {
  display: flex;
  align-items: center;
  gap: 6rpx;
  color: var(--noche-ink-subtle);
}

.mailbox-page__entry-prelude-glyph {
  width: 14px;
  height: 14px;
}

.mailbox-page__entry-title {
  display: block;
  font-size: 34rpx;
  line-height: 1.4;
  color: var(--noche-text);
  margin-bottom: 12rpx;
}

.mailbox-page__entry-excerpt {
  display: block;
  font-size: 22rpx;
  line-height: 1.82;
  color: var(--noche-ink-soft);
}

.mailbox-page__entry-foot {
  margin-top: 18rpx;
  padding-top: 12rpx;
  border-top: 1px solid var(--noche-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.mailbox-page__entry-icon {
  width: 18px;
  height: 18px;
  color: var(--noche-ink-ghost);
}

.mailbox-page__sealed-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 0 14rpx;
}

.mailbox-page__sealed-lock {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 6rpx;
  opacity: 0.6;
  margin-bottom: 16rpx;
}

.mailbox-page__sealed-lock-icon {
  width: 12px;
  height: 12px;
}

.mailbox-page__sealed-icon-wrap {
  margin-bottom: 12rpx;
  opacity: 0.24;
}

.mailbox-page__sealed-icon {
  width: 28px;
  height: 28px;
}

.mailbox-page__sealed-title {
  font-size: 28rpx;
  font-weight: 400;
  letter-spacing: 0.12em;
  color: var(--noche-ink-strong);
  padding-left: 0.12em;
  text-align: center;
}

.mailbox-page__sealed-bottom {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10rpx;
}

.mailbox-page__sealed-copy {
  font-size: 22rpx;
  line-height: 1.72;
  text-align: center;
  color: var(--noche-ink-faint);
}

.mailbox-page__sealed-wax {
  width: 16px;
  height: 16px;
  border-radius: 9999px;
  background: color-mix(in srgb, var(--noche-accent) 14%, transparent);
  border: 1px solid color-mix(in srgb, var(--noche-accent) 28%, transparent);
  display: flex;
  align-items: center;
  justify-content: center;
}

.mailbox-page__sealed-wax-core {
  width: 6px;
  height: 6px;
  border-radius: 9999px;
  background: color-mix(in srgb, var(--noche-accent) 36%, transparent);
}

.mailbox-page__fab {
  position: absolute;
  right: calc(var(--noche-page-padding-x) + 2px);
  bottom: var(--noche-fab-bottom);
  width: 112rpx;
  height: 112rpx;
  border: none;
  border-radius: 26rpx;
  background: var(--noche-text);
  color: var(--noche-bg);
  box-shadow: 0 10px 24px rgba(var(--noche-paper-shadow-rgb), 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 18;
}

.mailbox-page__fab-icon {
  width: 24px;
  height: 24px;
}
</style>
