<template>
  <view class="profile-page" :class="[themeClass, typographyClass]">
    <scroll-view scroll-y class="profile-page__scroll">
      <ProfileHero
        :title="copy.profile.title"
        :display-name="identity.displayName"
        :signature="identity.signature"
        :avatar-uri="identity.avatarUri"
        :cover-uri="identity.coverUri"
        :display-name-fallback="copy.profile.displayNameUnset"
        @go-back="handleGoBack"
        @preview-cover="openCoverViewer"
        @preview-avatar="openAvatarViewer"
        @edit-display-name="openDisplayNameDialog"
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
          :show-all-entry="true"
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

    <ProfileMediaViewer
      :open="isMediaViewerOpen"
      :title="mediaViewerTitle"
      :image-uri="mediaViewerImageUri"
      :replace-label="mediaReplaceLabel"
      :delete-label="mediaDeleteLabel"
      :close-label="copy.home.cancel"
      :show-delete="showMediaDelete"
      @close="closeMediaViewer"
      @replace="handleReplaceMedia"
      @remove="handleRemoveMedia"
    />

    <PaperOptionSheet
      :open="activeSheet !== null"
      :title="sheetTitle"
      :copy="sheetCopy"
      :options="sheetOptions"
      :cancel-text="sheetDismissText"
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
  </view>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import { onShow } from "@dcloudio/uni-app";
import { useSettingsStore, type SettingsState } from "@/app/store/useSettingsStore";
import { getPrefsRepository } from "@/app/store/settingsRepository";
import { ROUTES } from "@/shared/constants/routes";
import { navigateBackOrFallback } from "@/shared/utils/navigation";
import { formatDate } from "@/shared/utils/date";
import { createDateChangeWatcher } from "@/shared/utils/dateChange";
import PaperConfirmDialog, { type PaperConfirmDialogAction } from "@/shared/ui/PaperConfirmDialog.vue";
import PaperInputDialog from "@/shared/ui/PaperInputDialog.vue";
import PaperOptionSheet, { type PaperOptionSheetOption } from "@/shared/ui/PaperOptionSheet.vue";
import ProfileActionList from "@/features/profile/components/ProfileActionList.vue";
import ProfileAlbumViewer from "@/features/profile/components/ProfileAlbumViewer.vue";
import ProfileHero from "@/features/profile/components/ProfileHero.vue";
import ProfileMediaViewer from "@/features/profile/components/ProfileMediaViewer.vue";
import ProfileMemoryAlbum from "@/features/profile/components/ProfileMemoryAlbum.vue";
import ProfileStatsRow from "@/features/profile/components/ProfileStatsRow.vue";
import { useProfileAlbum } from "@/features/profile/composables/useProfileAlbum";
import { useProfileIdentity } from "@/features/profile/composables/useProfileIdentity";
import { useProfileStats } from "@/features/profile/composables/useProfileStats";
import {
  countDisplayNameCharacters,
  formatProfileAppearanceLabel,
  formatProfileBackupLabel,
  formatProfileLocaleLabel,
  PROFILE_APP_VERSION,
  PROFILE_DISPLAY_NAME_MAX,
  PROFILE_HOME_TITLE_MAX,
  PROFILE_PREF_KEYS,
  PROFILE_PREVIEW_LIMIT,
  formatProfileThemeLabel,
  formatProfileWeekStartLabel,
  isHomeTitleWithinLimit,
  type ProfileActionItem,
} from "@/features/profile/profileData";
import {
  DEFAULT_LOCAL_BACKUP_ROOT,
  exportLocalBackup,
  getLocalBackupErrorCode,
  importLocalBackup,
  isLocalBackupAvailable,
  listLocalBackups,
  normalizeLocalBackupRoot,
  restartAppAfterRestore,
  type LocalBackupSummary,
} from "@/features/profile/localBackup";
import { t } from "@/shared/i18n";
import { useThemeClass, useTypographyClass } from "@/shared/theme";

const settingsStore = useSettingsStore();
const themeClass = useThemeClass();
const typographyClass = useTypographyClass();
const copy = computed(() => t(settingsStore.locale));
const {
  identity,
  error: identityError,
  refresh: refreshIdentity,
  setDisplayName,
  setSignature,
  setAvatarUri,
  setCoverUri,
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
type BackupFlow = "export-default" | "export-custom" | "restore-default" | "restore-custom";
type ActiveSheet =
  | null
  | "appearance-root"
  | "appearance-theme"
  | "appearance-writing"
  | "appearance-home-title"
  | "appearance-album-count"
  | "appearance-future-lines"
  | "appearance-week"
  | "appearance-locale"
  | "backup-root"
  | "backup-restore"
  | "avatar-actions";
type InputDialogKind = null | "display-name" | "signature" | "backup-folder" | "home-title";
type MediaViewerKind = null | "cover" | "avatar";

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
const activeBackupRoot = ref(DEFAULT_LOCAL_BACKUP_ROOT);
const customBackupRoot = ref(DEFAULT_LOCAL_BACKUP_ROOT);
const pendingBackupFlow = ref<BackupFlow | null>(null);
const mediaViewerKind = ref<MediaViewerKind>(null);
const isMediaViewerOpen = ref(false);
const footerText = computed(() => copy.value.profile.footerText);
const inputDialogConfirmText = computed(() => copy.value.common.save);
const inputDialogCancelText = computed(() => copy.value.home.cancel);
const sheetDismissText = computed(() =>
  activeSheet.value?.startsWith("appearance-") ? copy.value.common.apply : copy.value.home.cancel,
);
const dateChangeWatcher = createDateChangeWatcher({
  getDateKey: () => formatDate(new Date(), "YYYY-MM-DD"),
  onDateChange: async () => {
    await Promise.all([
      refreshStats(),
      refreshAlbum(),
    ]);
  },
});

function resolveBackupErrorMessage(error: unknown, mode: "export" | "restore" = "export"): string {
  if (!isLocalBackupAvailable()) {
    return copy.value.profile.backupUnavailable;
  }

  const backupErrorCode = getLocalBackupErrorCode(error);
  if (backupErrorCode === "backup_root_invalid") {
    return copy.value.profile.backupFolderInvalid;
  }

  if (backupErrorCode === "backup_root_unwritable") {
    return copy.value.profile.backupRootUnwritable;
  }

  if (backupErrorCode === "backup_database_unavailable") {
    return copy.value.profile.backupDatabaseUnavailable;
  }

  if (backupErrorCode === "backup_manifest_invalid" || backupErrorCode === "backup_bundle_missing") {
    return copy.value.profile.backupManifestInvalid;
  }

  if (backupErrorCode === "backup_restore_failed") {
    return copy.value.profile.backupRestoreFailedDetail;
  }

  const message = readErrorMessage(error);
  if (/Backup root must stay inside _documents or _downloads\./u.test(message)) {
    return copy.value.profile.backupFolderInvalid;
  }

  return mode === "restore" ? copy.value.profile.restoreFailed : copy.value.profile.exportFailed;
}

function readErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "";
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

const mediaViewerTitle = computed(() =>
  mediaViewerKind.value === "cover" ? copy.value.profile.coverSheetTitle : copy.value.profile.avatarSheetTitle,
);
const mediaViewerImageUri = computed(() =>
  mediaViewerKind.value === "cover" ? identity.value.coverUri : identity.value.avatarUri,
);
const mediaReplaceLabel = computed(() =>
  mediaViewerKind.value === "cover" ? copy.value.profile.coverPick : copy.value.profile.avatarReplace,
);
const mediaDeleteLabel = computed(() =>
  mediaViewerKind.value === "cover" ? copy.value.profile.coverDelete : copy.value.profile.avatarReset,
);
const showMediaDelete = computed(() =>
  mediaViewerKind.value === "cover"
    ? Boolean(identity.value.coverUri)
    : Boolean(identity.value.avatarUri),
);

const pageError = computed(() => identityError.value ?? statsError.value ?? albumError.value);

const sheetTitle = computed(() => {
  switch (activeSheet.value) {
    case "appearance-root":
      return copy.value.profile.appearanceTitle;
    case "appearance-theme":
      return copy.value.profile.themeTitle;
    case "appearance-writing":
      return copy.value.profile.appearanceTitle;
    case "appearance-home-title":
      return copy.value.profile.homeTitleTitle;
    case "appearance-album-count":
      return copy.value.profile.appearanceTitle;
    case "appearance-future-lines":
      return copy.value.profile.appearanceTitle;
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
    default:
      return "";
  }
});

const sheetCopy = computed(() => {
  switch (activeSheet.value) {
    case "appearance-root":
      return copy.value.profile.appearanceCopy;
    case "appearance-home-title":
      return copy.value.profile.homeTitleCopy;
    case "backup-root":
      return copy.value.profile.backupRootCopy;
    case "backup-restore":
      return `${copy.value.profile.restoreCopy}\n\n${activeBackupRoot.value}`;
    case "avatar-actions":
      return copy.value.profile.avatarSheetCopy;
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
          key: "cover",
          title: copy.value.profile.coverSheetTitle,
          trailingIcon: "chevron-right",
        },
        {
          key: "writing",
          title: `${copy.value.profile.writingSettingsTitle}：${resolveWritingPresetLabel(settingsStore.writingPreset)}`,
          trailingIcon: "chevron-right",
        },
        {
          key: "home-title",
          title: `${copy.value.profile.homeTitleTitle}：${resolveHomeTitleModeLabel()}`,
          trailingIcon: "chevron-right",
        },
        {
          key: "album-display-count",
          title: `${copy.value.profile.albumDisplayCountTitle}：${resolveAlbumDisplayCountLabel(settingsStore.albumDisplayCount)}`,
          trailingIcon: "chevron-right",
        },
        {
          key: "future-lines",
          title: settingsStore.futureLetterPaperLinesEnabled ? copy.value.settings.futureLinesOn : copy.value.settings.futureLinesOff,
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
    case "appearance-writing":
      return [
        { key: "small", title: copy.value.settings.writingPresetSmall, copy: settingsStore.locale === "en-US" ? "Quiet, tighter lines" : "更轻一点的字号和行距", trailingIcon: settingsStore.writingPreset === "small" ? "check" : undefined },
        { key: "medium", title: copy.value.settings.writingPresetMedium, copy: settingsStore.locale === "en-US" ? "Default reading rhythm" : "默认书写节奏", trailingIcon: settingsStore.writingPreset === "medium" ? "check" : undefined },
        { key: "large", title: copy.value.settings.writingPresetLarge, copy: settingsStore.locale === "en-US" ? "Larger type and looser lines" : "更大的字和更松的行距", trailingIcon: settingsStore.writingPreset === "large" ? "check" : undefined },
      ];
    case "appearance-home-title":
      return [
        {
          key: "random",
          title: copy.value.settings.homeTitleRandom,
          copy: settingsStore.locale === "en-US"
            ? "Rotate quietly with the day"
            : "跟着日期安静轮换",
          trailingIcon: settingsStore.homeTitleMode === "random" ? "check" : undefined,
        },
        {
          key: "custom",
          title: copy.value.settings.homeTitleCustom,
          copy: settingsStore.homeCustomTitle || copy.value.profile.homeTitlePlaceholder,
          trailingIcon: settingsStore.homeTitleMode === "custom" ? "check" : undefined,
        },
      ];
    case "appearance-album-count":
      return [
        { key: "12", title: copy.value.profile.albumDisplayCountSmall, trailingIcon: settingsStore.albumDisplayCount === 12 ? "check" : undefined },
        { key: "24", title: copy.value.profile.albumDisplayCountMedium, trailingIcon: settingsStore.albumDisplayCount === 24 ? "check" : undefined },
        { key: "0", title: copy.value.profile.albumDisplayCountAll, trailingIcon: settingsStore.albumDisplayCount === 0 ? "check" : undefined },
      ];
    case "appearance-future-lines":
      return [
        { key: "1", title: copy.value.settings.futureLinesOn, trailingIcon: settingsStore.futureLetterPaperLinesEnabled ? "check" : undefined },
        { key: "0", title: copy.value.settings.futureLinesOff, trailingIcon: !settingsStore.futureLetterPaperLinesEnabled ? "check" : undefined },
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
          key: "export-default",
          title: copy.value.profile.exportBackupDefault,
          copy: `${copy.value.profile.exportBackupDefaultCopy}\n${DEFAULT_LOCAL_BACKUP_ROOT}`,
        },
        {
          key: "export-custom",
          title: copy.value.profile.exportBackupCustom,
          copy: `${copy.value.profile.exportBackupCustomCopy}\n${customBackupRoot.value}`,
        },
        {
          key: "restore-default",
          title: copy.value.profile.restoreBackupDefault,
          copy: `${copy.value.profile.restoreBackupDefaultCopy}\n${DEFAULT_LOCAL_BACKUP_ROOT}`,
        },
        {
          key: "restore-custom",
          title: copy.value.profile.restoreBackupCustom,
          copy: `${copy.value.profile.restoreBackupCustomCopy}\n${customBackupRoot.value}`,
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
    default:
      return [];
  }
});

function resolveWritingPresetLabel(preset: SettingsState["writingPreset"]): string {
  if (preset === "small") {
    return copy.value.settings.writingPresetSmall;
  }

  if (preset === "large") {
    return copy.value.settings.writingPresetLarge;
  }

  return copy.value.settings.writingPresetMedium;
}

function resolveAlbumDisplayCountLabel(count: SettingsState["albumDisplayCount"]): string {
  if (count === 12) {
    return copy.value.profile.albumDisplayCountSmall;
  }

  if (count === 0) {
    return copy.value.profile.albumDisplayCountAll;
  }

  return copy.value.profile.albumDisplayCountMedium;
}

function resolveHomeTitleModeLabel(): string {
  if (settingsStore.homeTitleMode === "custom" && settingsStore.homeCustomTitle) {
    return `${copy.value.settings.homeTitleCustom} · ${settingsStore.homeCustomTitle}`;
  }

  return copy.value.settings.homeTitleRandom;
}

async function refreshPage(): Promise<void> {
  await settingsStore.hydrate();
  await Promise.all([
    loadCustomBackupRoot(),
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

function openDisplayNameDialog(): void {
  openInputDialog(
    "display-name",
    copy.value.profile.profileSheetTitle,
    copy.value.profile.editNameCopy,
    copy.value.profile.editNamePlaceholder,
    identity.value.displayName,
    24,
  );
}

function openCoverViewer(): void {
  mediaViewerKind.value = "cover";
  isMediaViewerOpen.value = true;
}

function openAvatarViewer(): void {
  if (!identity.value.avatarUri) {
    activeSheet.value = "avatar-actions";
    return;
  }

  mediaViewerKind.value = "avatar";
  isMediaViewerOpen.value = true;
}

function closeMediaViewer(): void {
  isMediaViewerOpen.value = false;
  mediaViewerKind.value = null;
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
  if (inputDialogKind.value === "backup-folder") {
    pendingBackupFlow.value = null;
  }

  inputDialogOpen.value = false;
  inputDialogKind.value = null;
  inputDialogTitle.value = "";
  inputDialogCopy.value = "";
  inputDialogPlaceholder.value = "";
  inputDialogValue.value = "";
}

async function loadCustomBackupRoot(): Promise<void> {
  const savedRoot = await getPrefsRepository().get(PROFILE_PREF_KEYS.backupRoot);

  try {
    customBackupRoot.value = normalizeLocalBackupRoot(savedRoot?.value);
  } catch {
    customBackupRoot.value = DEFAULT_LOCAL_BACKUP_ROOT;
  }
}

async function persistCustomBackupRoot(root: string): Promise<void> {
  customBackupRoot.value = root;
  await getPrefsRepository().set({
    key: PROFILE_PREF_KEYS.backupRoot,
    value: root,
  });
}

function openBackupFolderDialog(flow: BackupFlow): void {
  pendingBackupFlow.value = flow;
  openInputDialog(
    "backup-folder",
    copy.value.profile.backupFolderTitle,
    copy.value.profile.backupFolderCopy,
    copy.value.profile.backupFolderPlaceholder,
    customBackupRoot.value === DEFAULT_LOCAL_BACKUP_ROOT ? copy.value.profile.backupFolderPlaceholder : customBackupRoot.value,
    80,
  );
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

async function persistLocalMediaUri(
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

async function chooseAndPersistProfileMedia(kind: "avatar" | "cover"): Promise<void> {
  const result = await chooseSingleImage();
  const tempFilePath = result?.tempFilePaths?.[0];

  if (!tempFilePath) {
    return;
  }

  const mediaUri = await persistLocalMediaUri(tempFilePath, result?.tempFiles?.[0]);

  if (kind === "cover") {
    await setCoverUri(mediaUri);
    return;
  }

  await setAvatarUri(mediaUri);
}

async function runBackupExport(backupRoot: string): Promise<void> {
  if (!isLocalBackupAvailable()) {
    openInfoDialog(copy.value.profile.exportFailed, copy.value.profile.backupUnavailable);
    return;
  }

  try {
    const result = await exportLocalBackup({ backupRoot });
    await getPrefsRepository().set({
      key: PROFILE_PREF_KEYS.lastBackupAt,
      value: result.createdAt,
    });
    await refreshIdentity();
    const skippedCopy = result.skippedAssetCount
      ? `\n\n${copy.value.profile.exportSkippedAssetsCopy.replace("{count}", String(result.skippedAssetCount))}`
      : "";
    openInfoDialog(copy.value.profile.exportSuccess, `${result.absolutePath}${skippedCopy}`);
  } catch (error) {
    openInfoDialog(copy.value.profile.exportFailed, resolveBackupErrorMessage(error, "export"));
  }
}

async function openRestoreBackups(backupRoot: string): Promise<void> {
  if (!isLocalBackupAvailable()) {
    openInfoDialog(copy.value.profile.backupRootTitle, copy.value.profile.backupUnavailable);
    return;
  }

  try {
    activeBackupRoot.value = backupRoot;
    availableBackups.value = await listLocalBackups({ backupRoot });
    if (availableBackups.value.length === 0) {
      openInfoDialog(copy.value.profile.backupRootTitle, `${copy.value.profile.noBackupYet}\n\n${backupRoot}`);
      return;
    }

    activeSheet.value = "backup-restore";
  } catch (error) {
    openInfoDialog(copy.value.profile.restoreFailed, resolveBackupErrorMessage(error, "restore"));
  }
}

async function handleSheetSelect(key: string): Promise<void> {
  switch (activeSheet.value) {
    case "appearance-root":
      if (key === "theme") {
        activeSheet.value = "appearance-theme";
        return;
      }

      if (key === "cover") {
        closeSheet();
        openCoverViewer();
        return;
      }

      if (key === "writing") {
        activeSheet.value = "appearance-writing";
        return;
      }

      if (key === "home-title") {
        activeSheet.value = "appearance-home-title";
        return;
      }

      if (key === "album-display-count") {
        activeSheet.value = "appearance-album-count";
        return;
      }

      if (key === "future-lines") {
        activeSheet.value = "appearance-future-lines";
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
    case "appearance-writing":
      settingsStore.setWritingPreset(key as SettingsState["writingPreset"]);
      activeSheet.value = "appearance-root";
      return;
    case "appearance-home-title":
      if (key === "random") {
        settingsStore.setHomeTitleMode("random");
        activeSheet.value = "appearance-root";
        return;
      }

      closeSheet();
      openInputDialog(
        "home-title",
        copy.value.profile.homeTitleTitle,
        copy.value.profile.homeTitleCopy,
        copy.value.profile.homeTitlePlaceholder,
        settingsStore.homeCustomTitle,
        PROFILE_HOME_TITLE_MAX,
      );
      return;
    case "appearance-album-count":
      settingsStore.setAlbumDisplayCount(key === "12" ? 12 : key === "24" ? 24 : 0);
      activeSheet.value = "appearance-root";
      return;
    case "appearance-future-lines":
      settingsStore.setFutureLetterPaperLinesEnabled(key === "1");
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
      if (key === "export-default") {
        await runBackupExport(DEFAULT_LOCAL_BACKUP_ROOT);
        return;
      }

      if (key === "export-custom") {
        openBackupFolderDialog("export-custom");
        return;
      }

      if (key === "restore-default") {
        await openRestoreBackups(DEFAULT_LOCAL_BACKUP_ROOT);
        return;
      }

      openBackupFolderDialog("restore-custom");
      return;
    case "backup-restore":
      pendingRestoreBackup.value = availableBackups.value.find((backup) => backup.backupId === key) ?? null;
      closeSheet();
      if (!pendingRestoreBackup.value) {
        return;
      }
      openConfirmDialog(
        copy.value.profile.restoreConfirmTitle,
        `${copy.value.profile.restoreConfirmCopy}\n\n${pendingRestoreBackup.value.absolutePath}`,
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
            await importLocalBackup(pendingRestoreBackup.value.backupId, {
              backupRoot: activeBackupRoot.value,
            });
            openInfoDialog(copy.value.profile.restoreSuccess, pendingRestoreBackup.value.absolutePath);
            setTimeout(() => {
              restartAppAfterRestore();
            }, 300);
          } catch (error) {
            openInfoDialog(copy.value.profile.restoreFailed, resolveBackupErrorMessage(error, "restore"));
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
      await chooseAndPersistProfileMedia("avatar");
      return;
    default:
      return;
  }
}

async function handleConfirmInputDialog(value: string): Promise<void> {
  if (inputDialogKind.value === "backup-folder") {
    let normalizedRoot: string;

    try {
      normalizedRoot = normalizeLocalBackupRoot(value);
    } catch {
      inputDialogCopy.value = copy.value.profile.backupFolderInvalid;
      inputDialogValue.value = value;
      return;
    }

    const pendingFlow = pendingBackupFlow.value;
    await persistCustomBackupRoot(normalizedRoot);
    closeInputDialog();

    if (pendingFlow === "export-custom") {
      await runBackupExport(normalizedRoot);
      return;
    }

    if (pendingFlow === "restore-custom") {
      await openRestoreBackups(normalizedRoot);
    }

    return;
  }

  if (inputDialogKind.value === "display-name") {
    if (countDisplayNameCharacters(value) > PROFILE_DISPLAY_NAME_MAX) {
      inputDialogCopy.value = copy.value.profile.displayNameTooLong;
      inputDialogValue.value = value;
      return;
    }

    await setDisplayName(value);
  } else if (inputDialogKind.value === "signature") {
    await setSignature(value);
  } else if (inputDialogKind.value === "home-title") {
    if (!isHomeTitleWithinLimit(value)) {
      inputDialogCopy.value = copy.value.profile.homeTitleTooLong;
      inputDialogValue.value = value;
      return;
    }

    settingsStore.setHomeCustomTitle(value);
    activeSheet.value = "appearance-root";
  }

  closeInputDialog();
}

async function handleReplaceMedia(): Promise<void> {
  const kind = mediaViewerKind.value;
  closeMediaViewer();

  if (!kind) {
    return;
  }

  await chooseAndPersistProfileMedia(kind);
}

function handleRemoveMedia(): void {
  const kind = mediaViewerKind.value;
  closeMediaViewer();

  if (kind === "cover") {
    openConfirmDialog(
      copy.value.profile.coverDeleteConfirmTitle,
      copy.value.profile.coverDeleteConfirmCopy,
      [
        {
          key: "cancel",
          title: copy.value.home.cancel,
          tone: "muted",
        },
        {
          key: "confirm",
          title: copy.value.profile.coverDelete,
          tone: "danger",
        },
      ],
      async (actionKey) => {
        if (actionKey !== "confirm") {
          closeInfoDialog();
          return;
        }

        await setCoverUri(null);
        closeInfoDialog();
      },
    );
    return;
  }

  openConfirmDialog(
    copy.value.profile.avatarDeleteConfirmTitle,
    copy.value.profile.avatarDeleteConfirmCopy,
    [
      {
        key: "cancel",
        title: copy.value.home.cancel,
        tone: "muted",
      },
      {
        key: "confirm",
        title: copy.value.profile.avatarReset,
        tone: "danger",
      },
    ],
    async (actionKey) => {
      if (actionKey !== "confirm") {
        closeInfoDialog();
        return;
      }

      await setAvatarUri(null);
      closeInfoDialog();
    },
  );
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
  min-height: 100vh;
  background: var(--noche-bg);
  color: var(--noche-text);
  font-family: "Noto Serif SC", "Source Han Serif SC", serif;
  --profile-soft-text: rgba(74, 70, 64, 0.88);
  --profile-soft-meta: rgba(92, 87, 79, 0.8);
  --profile-soft-hint: rgba(110, 104, 96, 0.72);
}

.theme-dark.profile-page {
  --profile-soft-text: rgba(241, 237, 230, 0.92);
  --profile-soft-meta: rgba(224, 218, 208, 0.82);
  --profile-soft-hint: rgba(224, 218, 208, 0.72);
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
  color: var(--profile-soft-meta);
  letter-spacing: 0.28em;
  padding-left: 0.28em;
}

.type-scale-small .profile-page__banner-text { font-size: 21rpx; }
.type-scale-large .profile-page__banner-text { font-size: 24rpx; }
.type-scale-small .profile-page__footer-text { font-size: 17rpx; }
.type-scale-large .profile-page__footer-text { font-size: 19rpx; }
</style>
