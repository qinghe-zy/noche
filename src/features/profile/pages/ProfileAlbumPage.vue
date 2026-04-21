<template>
  <view class="profile-album-page" :class="[themeClass, typographyClass]">
    <view class="profile-album-page__topbar">
      <view class="profile-album-page__topbar-inner" :style="topbarInnerStyle">
        <TopbarIconButton @tap="handleGoBack" />
        <text class="profile-album-page__title">{{ copy.profile.albumTitle }}</text>
        <view class="profile-album-page__spacer"></view>
      </view>
    </view>

    <scroll-view scroll-y class="profile-album-page__scroll">
      <view class="profile-album-page__content">
        <ProfileMemoryAlbum
          :title="copy.profile.albumAll"
          :subtitle="copy.profile.albumSubtitle"
          :items="pageVisibleItems"
          :is-loading="isLoading"
          :has-any-record="pageVisibleItems.length > 0"
          @open-item="openViewer"
        />

        <view
          v-if="canLoadMore"
          class="profile-album-page__load-more"
          @tap="handleLoadMore"
        >
          <text class="profile-album-page__load-more-text">{{ copy.profile.albumLoadMore }}</text>
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
import { computed, onMounted, ref, watch } from "vue";
import { onShow } from "@dcloudio/uni-app";
import { useSettingsStore } from "@/app/store/useSettingsStore";
import { ROUTES } from "@/shared/constants/routes";
import { navigateBackOrFallback } from "@/shared/utils/navigation";
import TopbarIconButton from "@/shared/ui/TopbarIconButton.vue";
import ProfileAlbumViewer from "@/features/profile/components/ProfileAlbumViewer.vue";
import ProfileMemoryAlbum from "@/features/profile/components/ProfileMemoryAlbum.vue";
import { useProfileAlbum } from "@/features/profile/composables/useProfileAlbum";
import { useEditorKeyboardViewport } from "@/features/editor/composables/useEditorKeyboardViewport";
import { t } from "@/shared/i18n";
import { useThemeClass, useTypographyClass } from "@/shared/theme";

const {
  allItems,
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
const themeClass = useThemeClass();
const typographyClass = useTypographyClass();
const { statusBarHeight, topbarBottomSpacing, rpxToPx } = useEditorKeyboardViewport();
const copy = computed(() => t(settingsStore.locale));
const loadedCount = ref(0);
const topbarInnerStyle = computed(() => ({
  paddingTop: `${statusBarHeight.value + rpxToPx(32)}px`,
  paddingLeft: `${rpxToPx(32)}px`,
  paddingRight: `${rpxToPx(32)}px`,
  paddingBottom: `${topbarBottomSpacing.value}px`,
}));

const pageVisibleItems = computed(() => {
  if (settingsStore.albumDisplayCount === 0) {
    return allItems.value;
  }

  return allItems.value.slice(0, loadedCount.value);
});

const canLoadMore = computed(() =>
  settingsStore.albumDisplayCount !== 0 && loadedCount.value < allItems.value.length,
);

watch(
  () => [settingsStore.albumDisplayCount, allItems.value.length],
  () => {
    loadedCount.value = settingsStore.albumDisplayCount === 0
      ? allItems.value.length
      : Math.min(settingsStore.albumDisplayCount, allItems.value.length);
  },
  { immediate: true },
);

function handleGoBack(): void {
  navigateBackOrFallback({
    fallbackUrl: `/${ROUTES.profile}`,
  });
}

function handleLoadMore(): void {
  if (settingsStore.albumDisplayCount === 0) {
    return;
  }

  loadedCount.value = Math.min(
    loadedCount.value + settingsStore.albumDisplayCount,
    allItems.value.length,
  );
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
  --profile-soft-text: rgba(74, 70, 64, 0.88);
  --profile-soft-meta: rgba(92, 87, 79, 0.8);
  --profile-soft-hint: rgba(110, 104, 96, 0.72);
  --profile-surface: rgba(255, 255, 255, 0.72);
  --profile-line: rgba(177, 179, 171, 0.14);
  --profile-title: #31332e;
  --profile-topbar-bg: rgba(251, 249, 245, 0.92);
  min-height: 100vh;
  background: var(--noche-bg);
  color: var(--noche-text);
}

.theme-dark.profile-album-page {
  --profile-soft-text: rgba(241, 237, 230, 0.92);
  --profile-soft-meta: rgba(224, 218, 208, 0.82);
  --profile-soft-hint: rgba(224, 218, 208, 0.72);
  --profile-surface: rgba(20, 17, 11, 0.96);
  --profile-line: var(--noche-shell-line);
  --profile-title: var(--noche-shell-text);
  --profile-topbar-bg: rgba(23, 23, 22, 0.92);
}

.profile-album-page__topbar {
  position: sticky;
  top: 0;
  width: 100%;
  background: var(--profile-topbar-bg);
  backdrop-filter: blur(12rpx);
  z-index: 8;
}

.profile-album-page__topbar-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
  width: 100%;
  max-width: 640px;
  margin: 0 auto;
}

.profile-album-page__title {
  font-size: 30rpx;
  line-height: 1.4;
  color: var(--profile-title);
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

.theme-dark.profile-album-page .profile-album-page__content {
  padding-top: 20rpx;
}

.profile-album-page__load-more {
  margin-top: 28rpx;
  display: flex;
  justify-content: center;
}

.profile-album-page__load-more-text {
  padding: 10rpx 18rpx;
  border: 1rpx solid var(--profile-line);
  background: var(--profile-surface);
  font-size: 20rpx;
  line-height: 1.5;
  color: var(--profile-soft-meta);
  letter-spacing: 0.12em;
  padding-left: 0.12em;
}

.type-scale-small .profile-album-page__title { font-size: 28rpx; }
.type-scale-large .profile-album-page__title { font-size: 32rpx; }
.type-scale-small .profile-album-page__load-more-text { font-size: 19rpx; }
.type-scale-large .profile-album-page__load-more-text { font-size: 22rpx; }
</style>
