<template>
  <PageScaffold
    class="profile-album-page"
    :title="copy.profile.albumTitle"
    :show-left="true"
    :topbar-bordered="true"
    :max-width="'760px'"
    scrollable
    @left-tap="handleGoBack"
  >
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
  </PageScaffold>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import { onShow } from "@dcloudio/uni-app";
import { useSettingsStore } from "@/app/store/useSettingsStore";
import { ROUTES } from "@/shared/constants/routes";
import { navigateBackOrFallback } from "@/shared/utils/navigation";
import PageScaffold from "@/shared/ui/PageScaffold.vue";
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
  background: var(--noche-bg);
  color: var(--noche-text);
}

.profile-album-page__content {
  padding: 14rpx var(--noche-page-padding-x) var(--noche-page-bottom-padding);
}
</style>
