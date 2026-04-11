<template>
  <view class="profile-page">
    <view class="profile-page__topbar">
      <TopbarIconButton @tap="handleGoBack" />
      <text class="profile-page__title">我的角落</text>
      <view class="profile-page__topbar-spacer"></view>
    </view>

    <scroll-view scroll-y class="profile-page__scroll">
      <view class="profile-page__content">
        <view class="profile-page__portrait">
          <ProfileHero
            :display-name="identity.displayName"
            :signature="identity.signature"
            :avatar-uri="identity.avatarUri"
            :cover-uri="identity.coverUri"
          />
        </view>

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
  </view>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import { onShow } from "@dcloudio/uni-app";
import { useAppStore } from "@/app/store/useAppStore";
import { useSettingsStore } from "@/app/store/useSettingsStore";
import { ROUTES } from "@/shared/constants/routes";
import { navigateBackOrFallback } from "@/shared/utils/navigation";
import TopbarIconButton from "@/shared/ui/TopbarIconButton.vue";
import ProfileActionList from "@/features/profile/components/ProfileActionList.vue";
import ProfileAlbumViewer from "@/features/profile/components/ProfileAlbumViewer.vue";
import ProfileHero from "@/features/profile/components/ProfileHero.vue";
import ProfileMemoryAlbum from "@/features/profile/components/ProfileMemoryAlbum.vue";
import ProfileStatsRow from "@/features/profile/components/ProfileStatsRow.vue";
import { useProfileAlbum } from "@/features/profile/composables/useProfileAlbum";
import { useProfileIdentity } from "@/features/profile/composables/useProfileIdentity";
import { useProfileStats } from "@/features/profile/composables/useProfileStats";
import {
  formatProfileBackupLabel,
  PROFILE_APP_VERSION,
  PROFILE_PREVIEW_LIMIT,
  type ProfileActionItem,
} from "@/features/profile/profileData";

const appStore = useAppStore();
const settingsStore = useSettingsStore();
const { identity, error: identityError, refresh: refreshIdentity } = useProfileIdentity();
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

const actionItems = computed<ProfileActionItem[]>(() => [
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

function handleOpenAllAlbum(): void {
  uni.navigateTo({
    url: `/${ROUTES.profileAlbum}`,
  });
}

function handleSelectAction(actionKey: ProfileActionItem["key"]): void {
  if (actionKey === "privacy-lock") {
    const nextEnabled = !settingsStore.privacyLockEnabled;
    settingsStore.setPrivacyLockEnabled(nextEnabled);

    if (!nextEnabled) {
      appStore.unlockPrivacy();
    }

    uni.showToast({
      title: nextEnabled ? "隐私锁已开启" : "隐私锁已关闭",
      icon: "none",
    });
    return;
  }

  if (actionKey === "local-backup") {
    uni.showModal({
      title: "本地备份",
      content: identity.value.lastBackupAt
        ? `最近一次备份：${formatProfileBackupLabel(identity.value.lastBackupAt)}。\n当前版本先保留本地入口，下一轮再接真正的导出链路。`
        : "当前还没有本地备份记录。入口已经留好，后续会接入真正的本地导出链路。",
      showCancel: false,
      confirmText: "知道了",
    });
    return;
  }

  uni.showModal({
    title: "关于 noche",
    content: `版本 v${PROFILE_APP_VERSION}\nAndroid / local-first / 离线可写。\n这间角落只依赖本地数据，不接账号，也不接云同步。`,
    showCancel: false,
    confirmText: "收好",
  });
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
  background:
    radial-gradient(circle at top, rgba(233, 226, 213, 0.34), transparent 28%),
    #f8f5ef;
  color: #31332e;
}

.profile-page__topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
  padding: 28rpx 32rpx 18rpx;
}

.profile-page__title {
  font-size: 30rpx;
  line-height: 1.4;
  color: #31332e;
  letter-spacing: 0.24em;
  padding-left: 0.24em;
}

.profile-page__topbar-spacer {
  width: 72rpx;
  height: 72rpx;
}

.profile-page__scroll {
  min-height: calc(100vh - 118rpx);
}

.profile-page__content {
  max-width: 720rpx;
  margin: 0 auto;
  padding: 6rpx 30rpx 88rpx;
  display: flex;
  flex-direction: column;
  gap: 44rpx;
}

.profile-page__banner {
  padding: 20rpx 24rpx;
  border-radius: 24rpx;
  background: rgba(159, 64, 61, 0.08);
}

.profile-page__banner-text {
  font-size: 22rpx;
  line-height: 1.7;
  color: #8a3d3a;
}

.profile-page__footer {
  padding-top: 30rpx;
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
