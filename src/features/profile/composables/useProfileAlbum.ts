import { computed, ref } from "vue";
import { listActiveEntriesWithFutureState } from "@/app/store/entryReadFacade";
import { ROUTES } from "@/shared/constants/routes";
import {
  buildProfileAlbumItems,
  type ProfileAlbumItem,
} from "@/features/profile/profileData";

export function useProfileAlbum(limit?: number) {
  const allItems = ref<ProfileAlbumItem[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const isViewerOpen = ref(false);
  const viewerIndex = ref(0);

  const visibleItems = computed(() =>
    typeof limit === "number" ? allItems.value.slice(0, limit) : allItems.value,
  );
  const hasMore = computed(() =>
    typeof limit === "number" ? allItems.value.length > limit : false,
  );
  const currentViewerItem = computed(() => visibleItems.value[viewerIndex.value] ?? null);

  async function refresh(): Promise<void> {
    isLoading.value = true;
    error.value = null;

    try {
      const entries = await listActiveEntriesWithFutureState();
      allItems.value = buildProfileAlbumItems(entries);
    } catch (nextError) {
      error.value = nextError instanceof Error ? nextError.message : "加载相册失败。";
      allItems.value = [];
    } finally {
      isLoading.value = false;
    }
  }

  function openViewer(attachmentId: string): void {
    const index = visibleItems.value.findIndex((item) => item.attachmentId === attachmentId);

    if (index < 0) {
      return;
    }

    viewerIndex.value = index;
    isViewerOpen.value = true;
  }

  function closeViewer(): void {
    isViewerOpen.value = false;
  }

  function showPrevious(): void {
    if (viewerIndex.value > 0) {
      viewerIndex.value -= 1;
    }
  }

  function showNext(): void {
    if (viewerIndex.value < visibleItems.value.length - 1) {
      viewerIndex.value += 1;
    }
  }

  function jumpToCurrentEntry(): void {
    const item = currentViewerItem.value;

    if (!item) {
      return;
    }

    uni.navigateTo({
      url: `/${ROUTES.editor}?mode=read&entryId=${item.entryId}&attachmentId=${item.attachmentId}`,
    });
    closeViewer();
  }

  return {
    allItems,
    visibleItems,
    hasMore,
    isLoading,
    error,
    isViewerOpen,
    viewerIndex,
    currentViewerItem,
    refresh,
    openViewer,
    closeViewer,
    showPrevious,
    showNext,
    jumpToCurrentEntry,
  };
}
