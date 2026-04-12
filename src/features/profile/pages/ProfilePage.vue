<template>
  <PageScaffold
    class="profile-page"
    :title="copy.profile.title"
    :show-left="true"
    :topbar-translucent="true"
    :topbar-bordered="false"
    :max-width="'760px'"
    scrollable
    @left-tap="handleGoBack"
  >
    <ProfileHero
      :display-name="identity.displayName"
      :signature="identity.signature"
      :avatar-uri="identity.avatarUri"
      :cover-uri="identity.coverUri"
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
        <text class="profile-page__footer-text">{{ footerText }}</text>
      </view>
    </view>

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
      :cancel-text="copy.home.cancel"
      @close="closeSheet"
      @select="handleSheetSelect"
    />

    <PaperInputDialog
      :open="inputDialogOpen"
      :title="inputDialogTitle"
      :copy="inputDialogCopy"
      :value="inputDialogValue"
      :placeholder="inputDialogPlaceholder"
      :confirm-text="inputDialogConfirmText"
      :cancel-text="inputDialogCancelText"
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
      @action="handleInfoDialogAction"
    />
  </PageScaffold>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import { onShow } from "@dcloudio/uni-app";
import { useSettingsStore } from "@/app/store/useSettingsStore";
import { getPrefsRepository } from "@/app/store/settingsRepository";
import { ROUTES } from "@/shared/constants/routes";
import { navigateBackOrFallback } from "@/shared/utils/navigation";
import { formatDate } from "@/shared/utils/date";
import { createDateChangeWatcher } from "@/shared/utils/dateChange";
import PageScaffold from "@/shared/ui/PageScaffold.vue";
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
  PROFILE_PREF_KEYS,
  PROFILE_PREVIEW_LIMIT,
  formatProfileThemeLabel,
  formatProfileWeekStartLabel,
  type ProfileActionItem,
} from "@/features/profile/profileData";
import {
  exportLocalBackup,
  importLocalBackup,
  isLocalBackupAvailable,
  listLocalBackups,
  restartAppAfterRestore,
  type LocalBackupSummary,
} from "@/features/profile/localBackup";
import { t } from "@/shared/i18n";

const settingsStore = useSettingsStore();
const copy = computed(() => t(settingsStore.locale));
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
type LocaleOption = "zh-CN" | "en-US";
type ActiveSheet =
  | null
  | "appearance-root"
  | "appearance-theme"
  | "appearance-week"
  | "appearance-locale"
  | "backup-root"
  | "backup-restore"
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
const infoDialogActions = ref<PaperConfirmDialogAction[]>([
  {
    key: "close",
    title: copy.value.common.close,
    tone: "muted",
  },
]);
const infoDialogHandler = ref<((actionKey: string) => void) | null>(null);
const availableBackups = ref<LocalBackupSummary[]>([]);
const pendingRestoreBackup = ref<LocalBackupSummary | null>(null);
const footerText = computed(() => copy.value.profile.footerText);
const inputDialogConfirmText = computed(() => copy.value.common.save);
const inputDialogCancelText = computed(() => copy.value.home.cancel);
const dateChangeWatcher = createDateChangeWatcher({
  getDateKey: () => formatDate(new Date(), "YYYY-MM-DD"),
  onDateChange: async () => {
    await Promise.all([
      refreshStats(),
      refreshAlbum(),
    ]);
  },
});

function resolveBackupErrorMessage(error: unknown): string {
  if (!isLocalBackupAvailable()) {
    return copy.value.profile.backupUnavailable;
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return copy.value.profile.exportFailed;
}

function buildExportSuccessCopy(exportPath: string): string {
  if (settingsStore.locale === "en-US") {
    return `Saved to:\n${exportPath}\n\nNext time, open Local Backup -> Restore from backup, then choose this folder from the backup list.`;
  }

  return `已保存到：\n${exportPath}\n\n下次需要恢复时，进入「本地备份」->「从本地备份恢复」，再从列表里选择这一份备份。`;
}

function buildRestoreConfirmCopy(backupPath: string): string {
  if (settingsStore.locale === "en-US") {
    return `${copy.value.profile.restoreConfirmCopy}\n\nBackup location:\n${backupPath}\n\nPlease make sure this is the backup you want to restore.`;
  }

  return `${copy.value.profile.restoreConfirmCopy}\n\n备份位置：\n${backupPath}\n\n请确认这就是你要恢复的那一份。`;
}

function buildRestoreSuccessCopy(backupPath: string): string {
  if (settingsStore.locale === "en-US") {
    return `Restored from:\n${backupPath}\n\nThe app will restart now. Re-open it and check whether your pages, images, and settings are back.`;
  }

  return `已从以下备份恢复：\n${backupPath}\n\n应用即将自动重启。重启后请回到应用里检查记录、图片和设置是否都已恢复。`;
}

const actionItems = computed<ProfileActionItem[]>(() => [
  {
    key: "appearance-settings",
    title: copy.value.profile.appearance,
    note: settingsStore.locale === "en-US"
      ? copy.value.profile.appearanceCopy
      : copy.value.profile.appearanceCopy,
    value: formatProfileAppearanceLabel(
      settingsStore.theme,
      settingsStore.locale,
      settingsStore.weekStartsOn,
    ),
  },
  {
    key: "local-backup",
    title: copy.value.profile.backup,
    note: copy.value.profile.backupLocalOnlyCopy,
    value: formatProfileBackupLabel(identity.value.lastBackupAt, settingsStore.locale),
  },
  {
    key: "about",
    title: copy.value.profile.about,
    note: copy.value.profile.aboutPreviewCopy,
    value: `v${PROFILE_APP_VERSION}`,
  },
]);

const pageError = computed(() => identityError.value ?? statsError.value ?? albumError.value);

const sheetTitle = computed(() => {
  switch (activeSheet.value) {
    case "appearance-root":
      return copy.value.profile.appearanceTitle;
    case "appearance-theme":
      return copy.value.profile.themeTitle;
    case "appearance-week":
      return copy.value.profile.weekTitle;
    case "appearance-locale":
      return copy.value.profile.localeTitle;
    case "backup-root":
      return copy.value.profile.backupRootTitle;
    case "backup-restore":
      return copy.value.profile.restoreTitle;
    case "avatar-actions":
      return copy.value.profile.avatarSheetTitle;
    case "profile-actions":
      return copy.value.profile.profileSheetTitle;
    default:
      return "";
  }
});

const sheetCopy = computed(() => {
  switch (activeSheet.value) {
    case "appearance-root":
      return copy.value.profile.appearanceCopy;
    case "backup-root":
      return copy.value.profile.backupRootCopy;
    case "backup-restore":
      return copy.value.profile.restoreCopy;
    case "avatar-actions":
      return copy.value.profile.avatarSheetCopy;
    case "profile-actions":
      return copy.value.profile.profileSheetCopy;
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
          title: `${copy.value.profile.themeTitle}：${formatProfileThemeLabel(settingsStore.theme, settingsStore.locale)}`,
          trailingIcon: "chevron-right",
        },
        {
          key: "week",
          title: `${copy.value.profile.weekTitle}：${formatProfileWeekStartLabel(settingsStore.weekStartsOn, settingsStore.locale)}`,
          trailingIcon: "chevron-right",
        },
        {
          key: "locale",
          title: `${copy.value.profile.localeTitle}：${formatProfileLocaleLabel(settingsStore.locale)}`,
          trailingIcon: "chevron-right",
        },
      ];
    case "appearance-theme":
      return [
        { key: "system", title: copy.value.settings.followSystem, trailingIcon: settingsStore.theme === "system" ? "check" : undefined },
        { key: "light", title: copy.value.settings.light, trailingIcon: settingsStore.theme === "light" ? "check" : undefined },
        { key: "dark", title: copy.value.settings.dark, trailingIcon: settingsStore.theme === "dark" ? "check" : undefined },
      ];
    case "appearance-week":
      return [
        { key: "0", title: copy.value.settings.weekStartsSunday, trailingIcon: settingsStore.weekStartsOn === 0 ? "check" : undefined },
        { key: "1", title: copy.value.settings.weekStartsMonday, trailingIcon: settingsStore.weekStartsOn === 1 ? "check" : undefined },
      ];
    case "appearance-locale":
      return [
        { key: "zh-CN", title: copy.value.settings.chinese, trailingIcon: settingsStore.locale === "zh-CN" ? "check" : undefined },
        { key: "en-US", title: copy.value.settings.english, trailingIcon: settingsStore.locale === "en-US" ? "check" : undefined },
      ];
    case "backup-root":
      return [
        {
          key: "export-backup",
          title: copy.value.profile.exportBackup,
          copy: copy.value.profile.exportBackupCopy,
        },
        {
          key: "restore-backup",
          title: copy.value.profile.restoreBackup,
          copy: copy.value.profile.restoreBackupCopy,
        },
      ];
    case "backup-restore":
      return availableBackups.value.map((backup) => ({
        key: backup.backupId,
        title: backup.createdAt.replace("T", " ").slice(0, 19),
        copy: backup.absolutePath,
      }));
    case "avatar-actions":
      return identity.value.avatarUri
        ? [
            { key: "pick-avatar", title: copy.value.profile.avatarReplace },
            { key: "clear-avatar", title: copy.value.profile.avatarReset, tone: "danger" },
          ]
        : [
            { key: "pick-avatar", title: copy.value.profile.avatarPick },
          ];
    case "profile-actions":
      return [
        { key: "edit-name", title: copy.value.profile.editName, trailingIcon: "chevron-right" },
        { key: "edit-signature", title: copy.value.profile.editSignature, trailingIcon: "chevron-right" },
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
  copyText: string,
  placeholder: string,
  value: string,
  maxlength: number,
): void {
  inputDialogKind.value = kind;
  inputDialogTitle.value = title;
  inputDialogCopy.value = copyText;
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

function openInfoDialog(title: string, copyText: string): void {
  infoDialogTitle.value = title;
  infoDialogCopy.value = copyText;
  infoDialogActions.value = [
    {
      key: "close",
      title: copy.value.common.close,
      tone: "muted",
    },
  ];
  infoDialogHandler.value = null;
  infoDialogOpen.value = true;
}

function closeInfoDialog(): void {
  infoDialogOpen.value = false;
  infoDialogTitle.value = "";
  infoDialogCopy.value = "";
  infoDialogHandler.value = null;
  pendingRestoreBackup.value = null;
}

function openConfirmDialog(
  title: string,
  copyText: string,
  actions: PaperConfirmDialogAction[],
  handler: (actionKey: string) => void,
): void {
  infoDialogTitle.value = title;
  infoDialogCopy.value = copyText;
  infoDialogActions.value = actions;
  infoDialogHandler.value = handler;
  infoDialogOpen.value = true;
}

function handleInfoDialogAction(actionKey: string): void {
  if (infoDialogHandler.value) {
    infoDialogHandler.value(actionKey);
    return;
  }

  closeInfoDialog();
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
      activeSheet.value = "appearance-root";
      return;
    case "appearance-week":
      settingsStore.setWeekStartsOn(key === "0" ? 0 : 1);
      activeSheet.value = "appearance-root";
      return;
    case "appearance-locale":
      settingsStore.setLocale(key as LocaleOption);
      activeSheet.value = "appearance-root";
      return;
    case "backup-root":
      closeSheet();
      if (key === "export-backup") {
        if (!isLocalBackupAvailable()) {
          openInfoDialog(copy.value.profile.exportFailed, copy.value.profile.backupUnavailable);
          return;
        }
        try {
          const result = await exportLocalBackup();
          await getPrefsRepository().set({
            key: PROFILE_PREF_KEYS.lastBackupAt,
            value: result.createdAt,
          });
          await refreshIdentity();
          openInfoDialog(copy.value.profile.exportSuccess, buildExportSuccessCopy(result.absolutePath));
        } catch (error) {
          openInfoDialog(copy.value.profile.exportFailed, resolveBackupErrorMessage(error));
        }
        return;
      }

      if (!isLocalBackupAvailable()) {
        openInfoDialog(copy.value.profile.backupRootTitle, copy.value.profile.backupUnavailable);
        return;
      }

      availableBackups.value = await listLocalBackups();
      if (availableBackups.value.length === 0) {
        openInfoDialog(copy.value.profile.backupRootTitle, copy.value.profile.noBackupYet);
        return;
      }
      activeSheet.value = "backup-restore";
      return;
    case "backup-restore":
      pendingRestoreBackup.value = availableBackups.value.find((backup) => backup.backupId === key) ?? null;
      closeSheet();
      if (!pendingRestoreBackup.value) {
        return;
      }
      openConfirmDialog(
        copy.value.profile.restoreConfirmTitle,
        buildRestoreConfirmCopy(pendingRestoreBackup.value.absolutePath),
        [
          {
            key: "cancel",
            title: copy.value.home.cancel,
            tone: "muted",
          },
          {
            key: "confirm",
            title: copy.value.profile.restoreConfirmAction,
            tone: "danger",
          },
        ],
        async (actionKey) => {
          if (actionKey !== "confirm" || !pendingRestoreBackup.value) {
            closeInfoDialog();
            return;
          }

          try {
            await importLocalBackup(pendingRestoreBackup.value.backupId);
            openInfoDialog(copy.value.profile.restoreSuccess, buildRestoreSuccessCopy(pendingRestoreBackup.value.absolutePath));
            setTimeout(() => {
              restartAppAfterRestore();
            }, 300);
          } catch {
            openInfoDialog(copy.value.profile.restoreFailed, copy.value.profile.restoreFailed);
          }
        },
      );
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
          copy.value.profile.editNameTitle,
          copy.value.profile.editNameCopy,
          copy.value.profile.editNamePlaceholder,
          identity.value.displayName,
          20,
        );
        return;
      }

      openInputDialog(
        "signature",
        copy.value.profile.editSignatureTitle,
        copy.value.profile.editSignatureCopy,
        copy.value.profile.editSignaturePlaceholder,
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

  if (actionKey === "local-backup") {
    activeSheet.value = "backup-root";
    return;
  }

  openInfoDialog(
    copy.value.profile.aboutTitle,
    copy.value.profile.aboutCopy.replace("{version}", PROFILE_APP_VERSION),
  );
}

onMounted(() => {
  void refreshPage();
  dateChangeWatcher.start();
});

onShow(() => {
  void refreshPage();
  dateChangeWatcher.sync();
});

onUnmounted(() => {
  dateChangeWatcher.stop();
});
</script>

<style scoped>
.profile-page {
  background: var(--noche-bg);
  color: var(--noche-text);
  font-family: "Noto Serif SC", "Source Han Serif SC", serif;
}

.profile-page__content {
  padding: 16rpx var(--noche-page-padding-x) var(--noche-page-bottom-padding);
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.profile-page__banner {
  padding: 18rpx 20rpx;
  border-radius: 22rpx;
  background: var(--noche-danger-soft);
}

.profile-page__banner-text {
  font-size: 22rpx;
  line-height: 1.72;
  color: var(--noche-danger);
}

.profile-page__menu {
  display: flex;
  flex-direction: column;
}

.profile-page__footer {
  padding-top: 8rpx;
  display: flex;
  justify-content: center;
}

.profile-page__footer-text {
  font-size: 18rpx;
  line-height: 1.6;
  color: var(--noche-muted);
  letter-spacing: 0.24em;
  padding-left: 0.24em;
}
</style>
