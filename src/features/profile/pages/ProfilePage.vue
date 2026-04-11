<template>
  <view class="profile-page">
    <scroll-view scroll-y class="profile-page__scroll">
      <ProfileHero
        title="我的角落"
        :display-name="identity.displayName"
        :signature="identity.signature"
        :avatar-uri="identity.avatarUri"
        :cover-uri="identity.coverUri"
        @go-back="handleGoBack"
        @edit-avatar="activeSheet = 'avatar-actions'"
        @edit-profile="activeSheet = 'profile-actions'"
      />

      <view class="profile-page__content">
        <view v-if="pageError" class="profile-page__banner">
          <text class="profile-page__banner-text">{{ pageError }}</text>
        </view>

        <ProfileStatsRow :stats="stats" :is-loading="statsLoading" />

        <ProfileMemoryAlbum
          :items="visibleItems"
          :is-loading="albumLoading"
          :has-any-record="stats.recordedDays > 0"
          :show-all-entry="hasMore"
          @open-item="openViewer"
          @open-all="handleOpenAllAlbum"
        />

        <view class="profile-page__menu">
          <ProfileActionList :items="actionItems" @select="handleSelectAction" />
        </view>

        <view class="profile-page__footer">
          <text class="profile-page__footer-text">岁月安好 · 纸短情长</text>
        </view>
      </view>
    </scroll-view>

    <ProfileAlbumViewer
      :open="isViewerOpen"
      :item="currentViewerItem"
      :current-index="viewerIndex"
      :total="visibleItems.length"
      :can-prev="viewerIndex > 0"
      :can-next="viewerIndex < visibleItems.length - 1"
      @close="closeViewer"
      @prev="showPrevious"
      @next="showNext"
      @jump="jumpToCurrentEntry"
    />

    <PaperOptionSheet
      :open="activeSheet !== null"
      :title="sheetTitle"
      :copy="sheetCopy"
      :options="sheetOptions"
      cancel-text="取消"
      @close="closeSheet"
      @select="handleSheetSelect"
    />

    <PaperInputDialog
      :open="inputDialogOpen"
      :title="inputDialogTitle"
      :copy="inputDialogCopy"
      :value="inputDialogValue"
      :placeholder="inputDialogPlaceholder"
      :maxlength="inputDialogMaxlength"
      @close="closeInputDialog"
      @confirm="handleConfirmInputDialog"
    />

    <PaperConfirmDialog
      :open="infoDialogOpen"
      :title="infoDialogTitle"
      :copy="infoDialogCopy"
      :actions="infoDialogActions"
      @close="closeInfoDialog"
      @action="closeInfoDialog"
    />
  </view>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { onShow } from "@dcloudio/uni-app";
import { useAppStore } from "@/app/store/useAppStore";
import { useSettingsStore } from "@/app/store/useSettingsStore";
import { ROUTES } from "@/shared/constants/routes";
import { navigateBackOrFallback } from "@/shared/utils/navigation";
import PaperConfirmDialog, { type PaperConfirmDialogAction } from "@/shared/ui/PaperConfirmDialog.vue";
import PaperInputDialog from "@/shared/ui/PaperInputDialog.vue";
import PaperOptionSheet, { type PaperOptionSheetOption } from "@/shared/ui/PaperOptionSheet.vue";
import ProfileActionList from "@/features/profile/components/ProfileActionList.vue";
import ProfileAlbumViewer from "@/features/profile/components/ProfileAlbumViewer.vue";
import ProfileHero from "@/features/profile/components/ProfileHero.vue";
import ProfileMemoryAlbum from "@/features/profile/components/ProfileMemoryAlbum.vue";
import ProfileStatsRow from "@/features/profile/components/ProfileStatsRow.vue";
import { useProfileAlbum } from "@/features/profile/composables/useProfileAlbum";
import { useProfileIdentity } from "@/features/profile/composables/useProfileIdentity";
import { useProfileStats } from "@/features/profile/composables/useProfileStats";
import {
  formatProfileAppearanceLabel,
  formatProfileBackupLabel,
  formatProfileLocaleLabel,
  PROFILE_APP_VERSION,
  PROFILE_PREVIEW_LIMIT,
  formatProfileThemeLabel,
  formatProfileWeekStartLabel,
  type ProfileActionItem,
} from "@/features/profile/profileData";

const appStore = useAppStore();
const settingsStore = useSettingsStore();
const {
  identity,
  error: identityError,
  refresh: refreshIdentity,
  setDisplayName,
  setSignature,
  setAvatarUri,
} = useProfileIdentity();
const { stats, isLoading: statsLoading, error: statsError, refresh: refreshStats } = useProfileStats();
const {
  visibleItems,
  hasMore,
  isLoading: albumLoading,
  error: albumError,
  isViewerOpen,
  viewerIndex,
  currentViewerItem,
  refresh: refreshAlbum,
  openViewer,
  closeViewer,
  showPrevious,
  showNext,
  jumpToCurrentEntry,
} = useProfileAlbum(PROFILE_PREVIEW_LIMIT);

type ThemeOption = "system" | "light" | "dark";
type LocaleOption = "zh-CN" | "en-US" | "ja-JP";
type ActiveSheet =
  | null
  | "appearance-root"
  | "appearance-theme"
  | "appearance-week"
  | "appearance-locale"
  | "avatar-actions"
  | "profile-actions";
type InputDialogKind = null | "display-name" | "signature";

interface ChooseImageFileLike {
  path?: string;
}

interface ChooseImageResult {
  tempFilePaths?: string[];
  tempFiles?: Array<File | ChooseImageFileLike>;
}

const activeSheet = ref<ActiveSheet>(null);
const inputDialogOpen = ref(false);
const inputDialogKind = ref<InputDialogKind>(null);
const inputDialogTitle = ref("");
const inputDialogCopy = ref("");
const inputDialogPlaceholder = ref("");
const inputDialogValue = ref("");
const inputDialogMaxlength = ref(60);
const infoDialogOpen = ref(false);
const infoDialogTitle = ref("");
const infoDialogCopy = ref("");
const infoDialogActions = computed<PaperConfirmDialogAction[]>(() => ([
  {
    key: "close",
    title: "知道了",
    tone: "muted",
  },
]));

const actionItems = computed<ProfileActionItem[]>(() => [
  {
    key: "appearance-settings",
    title: "外观设置",
    note: "主题、语言和每周起始日，都放在这里慢慢调顺。",
    value: formatProfileAppearanceLabel(
      settingsStore.theme,
      settingsStore.locale,
      settingsStore.weekStartsOn,
    ),
  },
  {
    key: "privacy-lock",
    title: "隐私锁",
    note: "离开前台时，用一层雾面遮住纸页。",
    value: settingsStore.privacyLockEnabled ? "已开启" : "未开启",
  },
  {
    key: "local-backup",
    title: "本地备份",
    note: "只认本地设备，不接云端。",
    value: formatProfileBackupLabel(identity.value.lastBackupAt),
  },
  {
    key: "about",
    title: "关于",
    note: "一间本地优先、离线可写的私人角落。",
    value: `v${PROFILE_APP_VERSION}`,
  },
]);

const pageError = computed(() => identityError.value ?? statsError.value ?? albumError.value);

const sheetTitle = computed(() => {
  switch (activeSheet.value) {
    case "appearance-root":
      return "外观设置";
    case "appearance-theme":
      return "主题";
    case "appearance-week":
      return "每周起始日";
    case "appearance-locale":
      return "语言";
    case "avatar-actions":
      return "头像";
    case "profile-actions":
      return "资料";
    default:
      return "";
  }
});

const sheetCopy = computed(() => {
  switch (activeSheet.value) {
    case "appearance-root":
      return "把这间角落调到自己最舒服的阅读节奏。";
    case "avatar-actions":
      return "头像和名字都会留在本机。";
    case "profile-actions":
      return "把这间角落改成你自己的名字。";
    default:
      return "";
  }
});

const sheetOptions = computed<PaperOptionSheetOption[]>(() => {
  switch (activeSheet.value) {
    case "appearance-root":
      return [
        {
          key: "theme",
          title: `主题：${formatProfileThemeLabel(settingsStore.theme)}`,
          trailingIcon: "chevron-right",
        },
        {
          key: "week",
          title: `每周起始日：${formatProfileWeekStartLabel(settingsStore.weekStartsOn)}`,
          trailingIcon: "chevron-right",
        },
        {
          key: "locale",
          title: `语言：${formatProfileLocaleLabel(settingsStore.locale)}`,
          trailingIcon: "chevron-right",
        },
      ];
    case "appearance-theme":
      return [
        { key: "system", title: "跟随系统", trailingIcon: settingsStore.theme === "system" ? "check" : undefined },
        { key: "light", title: "浅色", trailingIcon: settingsStore.theme === "light" ? "check" : undefined },
        { key: "dark", title: "深色", trailingIcon: settingsStore.theme === "dark" ? "check" : undefined },
      ];
    case "appearance-week":
      return [
        { key: "0", title: "周日开始", trailingIcon: settingsStore.weekStartsOn === 0 ? "check" : undefined },
        { key: "1", title: "周一开始", trailingIcon: settingsStore.weekStartsOn === 1 ? "check" : undefined },
      ];
    case "appearance-locale":
      return [
        { key: "zh-CN", title: "简体中文", trailingIcon: settingsStore.locale === "zh-CN" ? "check" : undefined },
        { key: "en-US", title: "English", trailingIcon: settingsStore.locale === "en-US" ? "check" : undefined },
        { key: "ja-JP", title: "日本語", trailingIcon: settingsStore.locale === "ja-JP" ? "check" : undefined },
      ];
    case "avatar-actions":
      return identity.value.avatarUri
        ? [
            { key: "pick-avatar", title: "从本机换一张" },
            { key: "clear-avatar", title: "恢复默认头像", tone: "danger" },
          ]
        : [
            { key: "pick-avatar", title: "从本机选头像" },
          ];
    case "profile-actions":
      return [
        { key: "edit-name", title: "修改昵称", trailingIcon: "chevron-right" },
        { key: "edit-signature", title: "修改签名", trailingIcon: "chevron-right" },
      ];
    default:
      return [];
  }
});

async function refreshPage(): Promise<void> {
  await settingsStore.hydrate();
  await Promise.all([
    refreshIdentity(),
    refreshStats(),
    refreshAlbum(),
  ]);
}

function handleGoBack(): void {
  navigateBackOrFallback({
    fallbackUrl: `/${ROUTES.home}`,
  });
}

function closeSheet(): void {
  activeSheet.value = null;
}

function openInputDialog(
  kind: InputDialogKind,
  title: string,
  copy: string,
  placeholder: string,
  value: string,
  maxlength: number,
): void {
  inputDialogKind.value = kind;
  inputDialogTitle.value = title;
  inputDialogCopy.value = copy;
  inputDialogPlaceholder.value = placeholder;
  inputDialogValue.value = value;
  inputDialogMaxlength.value = maxlength;
  inputDialogOpen.value = true;
}

function closeInputDialog(): void {
  inputDialogOpen.value = false;
  inputDialogKind.value = null;
  inputDialogTitle.value = "";
  inputDialogCopy.value = "";
  inputDialogPlaceholder.value = "";
  inputDialogValue.value = "";
}

function openInfoDialog(title: string, copy: string): void {
  infoDialogTitle.value = title;
  infoDialogCopy.value = copy;
  infoDialogOpen.value = true;
}

function closeInfoDialog(): void {
  infoDialogOpen.value = false;
  infoDialogTitle.value = "";
  infoDialogCopy.value = "";
}

function chooseSingleImage(): Promise<ChooseImageResult | null> {
  return new Promise((resolve) => {
    uni.chooseImage({
      count: 1,
      sizeType: ["compressed", "original"],
      sourceType: ["album", "camera"],
      success: (result) => resolve(result as ChooseImageResult),
      fail: () => resolve(null),
    });
  });
}

function saveFile(tempFilePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    uni.saveFile({
      tempFilePath,
      success: (result) => resolve((result as { savedFilePath: string }).savedFilePath),
      fail: reject,
    });
  });
}

function isBrowserFile(value: unknown): value is File {
  return typeof File !== "undefined" && value instanceof File;
}

function toDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }

      reject(new Error("Failed to read avatar file."));
    };
    reader.onerror = () => reject(new Error("Failed to read avatar file."));
    reader.readAsDataURL(file);
  });
}

async function persistAvatarUri(
  tempFilePath: string,
  tempFile: File | ChooseImageFileLike | undefined,
): Promise<string> {
  if (typeof uni !== "undefined" && typeof uni.saveFile === "function") {
    try {
      return await saveFile(tempFilePath);
    } catch {
      // H5 and some runtimes do not support saveFile; fall back to local data.
    }
  }

  if (isBrowserFile(tempFile)) {
    return toDataUrl(tempFile);
  }

  return tempFilePath;
}

async function handleSheetSelect(key: string): Promise<void> {
  switch (activeSheet.value) {
    case "appearance-root":
      if (key === "theme") {
        activeSheet.value = "appearance-theme";
        return;
      }

      if (key === "week") {
        activeSheet.value = "appearance-week";
        return;
      }

      activeSheet.value = "appearance-locale";
      return;
    case "appearance-theme":
      settingsStore.setTheme(key as ThemeOption);
      closeSheet();
      return;
    case "appearance-week":
      settingsStore.setWeekStartsOn(key === "0" ? 0 : 1);
      closeSheet();
      return;
    case "appearance-locale":
      settingsStore.setLocale(key as LocaleOption);
      closeSheet();
      return;
    case "avatar-actions":
      if (key === "clear-avatar") {
        await setAvatarUri(null);
        closeSheet();
        return;
      }

      closeSheet();
      {
        const result = await chooseSingleImage();
        const tempFilePath = result?.tempFilePaths?.[0];

        if (!tempFilePath) {
          return;
        }

        const avatarUri = await persistAvatarUri(tempFilePath, result?.tempFiles?.[0]);
        await setAvatarUri(avatarUri);
      }
      return;
    case "profile-actions":
      closeSheet();

      if (key === "edit-name") {
        openInputDialog(
          "display-name",
          "修改昵称",
          "给这间角落起个名字。",
          "给这间角落起个名字",
          identity.value.displayName,
          20,
        );
        return;
      }

      openInputDialog(
        "signature",
        "修改签名",
        "写一句留给自己的话。",
        "写一句留给自己的话",
        identity.value.signature,
        40,
      );
      return;
    default:
      return;
  }
}

async function handleConfirmInputDialog(value: string): Promise<void> {
  if (inputDialogKind.value === "display-name") {
    await setDisplayName(value);
  } else if (inputDialogKind.value === "signature") {
    await setSignature(value);
  }

  closeInputDialog();
}

function handleOpenAllAlbum(): void {
  uni.navigateTo({
    url: `/${ROUTES.profileAlbum}`,
  });
}

async function handleSelectAction(actionKey: ProfileActionItem["key"]): Promise<void> {
  if (actionKey === "appearance-settings") {
    activeSheet.value = "appearance-root";
    return;
  }

  if (actionKey === "privacy-lock") {
    const nextEnabled = !settingsStore.privacyLockEnabled;
    settingsStore.setPrivacyLockEnabled(nextEnabled);

    if (!nextEnabled) {
      appStore.unlockPrivacy();
    }
    return;
  }

  if (actionKey === "local-backup") {
    openInfoDialog(
      "本地备份",
      identity.value.lastBackupAt
        ? `最近一次备份：${formatProfileBackupLabel(identity.value.lastBackupAt)}。\n当前版本先保留本地入口，下一轮再接真正的导出链路。`
        : "当前还没有本地备份记录。入口已经留好，后续会接入真正的本地导出链路。",
    );
    return;
  }

  openInfoDialog(
    "关于 noche",
    `版本 v${PROFILE_APP_VERSION}\nAndroid / local-first / 离线可写。\n这间角落只依赖本地数据，不接账号，也不接云同步。`,
  );
}

onMounted(() => {
  void refreshPage();
});

onShow(() => {
  void refreshPage();
});
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  background: #fbf9f5;
  color: #31332e;
  font-family: "Noto Serif SC", "Source Han Serif SC", serif;
}

.profile-page__scroll {
  min-height: 100vh;
}

.profile-page__content {
  padding: 12rpx 24rpx 88rpx;
  display: flex;
  flex-direction: column;
  gap: 32rpx;
}

.profile-page__banner {
  padding: 16rpx 18rpx;
  border-radius: 18rpx;
  background: rgba(159, 64, 61, 0.07);
}

.profile-page__banner-text {
  font-size: 22rpx;
  line-height: 1.7;
  color: #8a3d3a;
}

.profile-page__footer {
  padding-top: 16rpx;
  display: flex;
  justify-content: center;
}

.profile-page__footer-text {
  font-size: 18rpx;
  line-height: 1.6;
  color: rgba(138, 129, 120, 0.58);
  letter-spacing: 0.28em;
  padding-left: 0.28em;
}
</style>
