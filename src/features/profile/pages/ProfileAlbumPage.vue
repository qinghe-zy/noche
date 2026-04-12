<template>
  <view class="profile-album-page">
    <view class="profile-album-page__topbar">
      <TopbarIconButton @tap="handleGoBack" />
      <text class="profile-album-page__title">{{ copy.profile.albumTitle }}</text>
      <view class="profile-album-page__spacer"></view>
    </view>

    <scroll-view scroll-y class="profile-album-page__scroll">
      <view class="profile-album-page__content">
        <ProfileMemoryAlbum
          :title="copy.profile.albumAll"
          :subtitle="copy.profile.albumSubtitle"
          :items="visibleItems"
          :is-loading="isLoading"
          :has-any-record="visibleItems.length > 0"
          @open-item="openViewer"
        />
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
import { useSettingsStore } from "@/app/store/useSettingsStore";
import { ROUTES } from "@/shared/constants/routes";
import { navigateBackOrFallback } from "@/shared/utils/navigation";
import TopbarIconButton from "@/shared/ui/TopbarIconButton.vue";
import ProfileAlbumViewer from "@/features/profile/components/ProfileAlbumViewer.vue";
import ProfileMemoryAlbum from "@/features/profile/components/ProfileMemoryAlbum.vue";
import { useProfileAlbum } from "@/features/profile/composables/useProfileAlbum";
import { t } from "@/shared/i18n";

const {
  visibleItems,
  isLoading,
  isViewerOpen,
  viewerIndex,
  currentViewerItem,
  refresh,
  openViewer,
  closeViewer,
  showPrevious,
  showNext,
  jumpToCurrentEntry,
} = useProfileAlbum();
const settingsStore = useSettingsStore();
const copy = computed(() => t(settingsStore.locale));

function handleGoBack(): void {
  navigateBackOrFallback({
    fallbackUrl: `/${ROUTES.profile}`,
  });
}

onMounted(() => {
  void refresh();
});

onShow(() => {
  void refresh();
});
</script>

<style scoped>
.profile-album-page {
  min-height: 100vh;
  background: var(--noche-bg);
  color: var(--noche-text);
}

.profile-album-page__topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
  padding: 40rpx 32rpx 18rpx;
}

.profile-album-page__title {
  font-size: 30rpx;
  line-height: 1.4;
  color: var(--noche-text);
  letter-spacing: 0.24em;
  padding-left: 0.24em;
}

.profile-album-page__spacer {
  width: 72rpx;
  height: 72rpx;
}

.profile-album-page__scroll {
  min-height: calc(100vh - 118rpx);
}

.profile-album-page__content {
  max-width: 720rpx;
  margin: 0 auto;
  padding: 12rpx 30rpx 88rpx;
}
</style>
