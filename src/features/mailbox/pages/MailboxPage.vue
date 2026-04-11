<template>
  <view class="mailbox-page">
    <view class="mailbox-page__topbar">
      <view class="mailbox-page__topbar-inner">
        <TopbarIconButton @tap="handleGoHome" />
        <text class="mailbox-page__topbar-title">私人信箱</text>
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
            <text class="mailbox-page__tab-pill-text mailbox-page__tab-pill-text--primary">纪实</text>
          </button>
          <button
            class="mailbox-page__tab-pill mailbox-page__tab-pill--primary"
            :class="{ 'mailbox-page__tab-pill--active': activeTab === 'distant' }"
            @click="handlePrimaryTabChange('distant')"
          >
            <text class="mailbox-page__tab-pill-text mailbox-page__tab-pill-text--primary">寄远</text>
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

      <scroll-view scroll-y class="mailbox-page__content">
        <view v-if="mailboxStore.isLoading" class="mailbox-page__state">
          <text class="mailbox-page__state-text">正在整理信箱…</text>
        </view>

        <view v-else-if="mailboxStore.error" class="mailbox-page__state mailbox-page__state--error">
          <text class="mailbox-page__state-text">{{ mailboxStore.error }}</text>
          <button class="mailbox-page__retry" @click="refresh">重新加载</button>
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
                    <text class="mailbox-page__entry-title">{{ entry.title || "未命名" }}</text>
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
                        <text class="mailbox-page__sealed-lock-label">Reserved</text>
                      </view>

                      <view class="mailbox-page__sealed-icon-wrap">
                        <AppIcon name="mail" class="mailbox-page__sealed-icon" />
                      </view>

                      <text class="mailbox-page__sealed-title">{{ formatMailboxLockedTitle(entry) }}</text>
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

        <view class="mailbox-page__footer"></view>
      </scroll-view>
    </view>

    <button class="mailbox-page__fab" @click="handleComposeCurrentSection">
      <AppIcon name="edit-square" class="mailbox-page__fab-icon" />
    </button>

    <PaperConfirmDialog
      :open="isLockedFutureDialogOpen"
      title="尚未开启"
      :copy="lockedFutureDialogCopy"
      :actions="lockedFutureDialogActions"
      @close="closeLockedFutureDialog"
      @action="handleLockedFutureDialogAction"
    />
  </view>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useMailboxStore } from "@/app/store/useMailboxStore";
import { useEntryStore } from "@/app/store/useEntryStore";
import type { Entry, EntryType } from "@/domain/entry/types";
import { ROUTES } from "@/shared/constants/routes";
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
import {
  getDefaultMailboxSecondaryTab,
  getMailboxSecondaryOptions,
  resolveMailboxComposeType,
  type MailboxPrimaryTab,
  type MailboxSecondaryTab,
} from "@/features/mailbox/mailboxView";

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
const activeTab = ref<MailboxPrimaryTab>("documentary");
const activeSecondaryTab = ref<MailboxSecondaryTab>(getDefaultMailboxSecondaryTab("documentary"));
const lockedFutureEntry = ref<Entry | null>(null);
const isLockedFutureDialogOpen = ref(false);

const activeSections = computed<MailboxSection[]>(() => {
  if (activeTab.value === "documentary") {
    return [
      {
        key: "documentary-diary",
        title: "日记",
        emptyText: "这里还没有日记。",
        entries: mailboxStore.documentaryDiaries,
        renderMode: "paper",
        stackClass: "mailbox-page__paper-stack",
        cardClass: "",
        metaLabel: "已经收好",
        metaIcon: "auto_stories",
        dateTab: "past",
      },
      {
        key: "documentary-jotting",
        title: "随笔",
        emptyText: "这里还没有随笔。",
        entries: mailboxStore.documentaryJottings,
        renderMode: "paper",
        stackClass: "mailbox-page__paper-stack",
        cardClass: "",
        metaLabel: "已经收好",
        metaIcon: "edit_note",
        dateTab: "past",
      },
    ];
  }

  return [
    {
      key: "distant-opened",
      title: "已启",
      emptyText: "这里还没有已启的未来信。",
      entries: mailboxStore.distantOpenedFutures,
      renderMode: "paper",
      stackClass: "mailbox-page__paper-stack",
      cardClass: "",
      metaLabel: "已经开启",
      metaIcon: "mark_email_read",
      dateTab: "past",
    },
    {
      key: "distant-pending",
      title: "待启",
      emptyText: "这里还没有待启的未来信。",
      entries: mailboxStore.distantPendingFutures,
      renderMode: "sealed",
      stackClass: "mailbox-page__sealed-stack",
      cardClass: "mailbox-page__entry-card--sealed",
      metaLabel: "尚未开启",
      metaIcon: "lock",
      dateTab: "future",
    },
  ];
});

const secondaryOptions = computed(() => getMailboxSecondaryOptions(activeTab.value));

const activeSection = computed<MailboxSection>(() => {
  const matched = activeSections.value.find((section) =>
    section.key.endsWith(activeSecondaryTab.value),
  );

  return matched ?? activeSections.value[0];
});
const lockedFutureDialogCopy = computed(() =>
  lockedFutureEntry.value?.unlockDate
    ? `这封未来信会在 ${lockedFutureEntry.value.unlockDate} 当天开启。你也可以现在销毁它。`
    : "这封未来信还没有到开启的时候。你也可以现在销毁它。",
);
const lockedFutureDialogActions = computed<PaperConfirmDialogAction[]>(() => ([
  {
    key: "keep",
    title: "知道了",
    tone: "muted",
  },
  {
    key: "destroy",
    title: "现在销毁",
    tone: "danger",
  },
]));

function isSealedFuture(entry: Entry): boolean {
  return entry.type === "future" && entry.status === "sealed";
}

function formatDateLabel(entry: Entry, tab: "past" | "future"): string {
  return formatMailboxDateLabel(entry, tab);
}

function formatTypeLabel(type: EntryType): string {
  return formatMailboxTypeLabel(type);
}

function formatExcerpt(entry: Entry): string {
  return formatMailboxExcerpt(entry);
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

onMounted(() => {
  void refresh();
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
    title: "已销毁",
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
  min-height: 100vh;
  background-color: #f7f4ef;
  color: #31332e;
  font-family: "Noto Serif SC", "Source Han Serif SC", serif;
  position: relative;
  overflow-x: hidden;
}

.mailbox-page__topbar {
  position: sticky;
  top: 0;
  width: 100%;
  background: rgba(247, 244, 239, 0.96);
  z-index: 20;
}

.mailbox-page__topbar-inner {
  width: 100%;
  max-width: 640px;
  margin: 0 auto;
  padding: 28rpx 32rpx 24rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.mailbox-page__topbar-title {
  font-size: 30rpx;
  font-weight: 300;
  letter-spacing: 0.25em;
  color: #31332e;
  padding-left: 0.25em;
}

.mailbox-page__main {
  width: 100%;
  max-width: 640px;
  margin: 0 auto;
  padding: 4px 24px 88px;
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
  border: 1px solid #ddd4c8;
  background: #f4eee6;
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
  min-height: calc(100vh - 180px);
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
  font-family: "Inter", sans-serif;
  color: #8f857b;
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
  background: #fff9f2;
  border: 1px solid rgba(221, 212, 200, 0.92);
}

.mailbox-page__tab-pill--active .mailbox-page__tab-pill-text {
  color: #6b6259;
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
  color: rgba(99, 95, 85, 0.8);
}

.mailbox-page__state--error .mailbox-page__state-text {
  color: #9f403d;
}

.mailbox-page__retry {
  min-height: 40px;
  padding: 0 18px;
  border: 1px solid rgba(177, 179, 171, 0.42);
  background: rgba(255, 255, 255, 0.85);
  font-size: 14px;
  color: #31332e;
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
  font-family: "Inter", sans-serif;
  font-size: 10px;
  letter-spacing: 0.18em;
  color: rgba(121, 124, 117, 0.74);
  padding-left: 0.18em;
}

.mailbox-page__module-tab {
  position: relative;
  padding: 0 0 8px;
}

.mailbox-page__module-tab-text {
  font-family: "Inter", sans-serif;
  font-size: 11px;
  letter-spacing: 0.3em;
  color: #31332e;
  font-weight: 600;
  padding-left: 0.3em;
}

.mailbox-page__module-tab-underline {
  position: absolute;
  left: 50%;
  bottom: 0;
  width: 14px;
  height: 1px;
  transform: translateX(-50%);
  background: rgba(138, 129, 120, 0.8);
}

.mailbox-page__module-empty {
  padding: 20px 0 8px;
}

.mailbox-page__module-empty-text {
  font-size: 13px;
  line-height: 1.7;
  color: rgba(99, 95, 85, 0.72);
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
  background: #fbf8f3;
  border: 1px solid #ddd4c8;
  padding: 24px 22px;
  border-radius: 18px;
}

.mailbox-page__entry-card--sealed {
  background: #f3ede6;
  border-color: #ddd4c8;
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
  background: rgba(177, 179, 171, 0.7);
}

.mailbox-page__entry-type,
.mailbox-page__entry-date,
.mailbox-page__entry-meta,
.mailbox-page__sealed-lock-label,
.mailbox-page__footer-text {
  font-family: "Inter", sans-serif;
  font-size: 9px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: rgba(121, 124, 117, 0.72);
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
  color: rgba(121, 124, 117, 0.76);
}

.mailbox-page__entry-prelude-glyph {
  width: 14px;
  height: 14px;
}

.mailbox-page__entry-title {
  display: block;
  font-size: 22px;
  line-height: 1.5;
  color: #31332e;
  margin-bottom: 12px;
}

.mailbox-page__entry-excerpt {
  display: block;
  font-size: 13px;
  line-height: 1.9;
  color: rgba(99, 95, 85, 0.82);
}

.mailbox-page__entry-foot {
  margin-top: 18px;
  padding-top: 14px;
  border-top: 1px solid rgba(221, 212, 200, 0.8);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.mailbox-page__entry-icon {
  width: 16px;
  height: 16px;
  color: rgba(177, 179, 171, 0.62);
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
  font-size: 15px;
  font-weight: 400;
  letter-spacing: 0.12em;
  color: rgba(87, 83, 73, 0.92);
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
  font-size: 12px;
  line-height: 1.6;
  text-align: center;
  color: rgba(99, 95, 85, 0.68);
}

.mailbox-page__sealed-wax {
  width: 14px;
  height: 14px;
  border-radius: 9999px;
  background: rgba(138, 129, 120, 0.12);
  border: 1px solid rgba(138, 129, 120, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
}

.mailbox-page__sealed-wax-core {
  width: 5px;
  height: 5px;
  border-radius: 9999px;
  background: rgba(138, 129, 120, 0.28);
}

.mailbox-page__footer {
  height: 20px;
}

.mailbox-page__fab {
  position: fixed;
  right: 24px;
  bottom: 28px;
  width: 56px;
  height: 56px;
  border: none;
  border-radius: 18px;
  background: #8a8178;
  color: #fff9f2;
  box-shadow: 0 8px 18px rgba(49, 51, 46, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.mailbox-page__fab-icon {
  width: 22px;
  height: 22px;
}
</style>
