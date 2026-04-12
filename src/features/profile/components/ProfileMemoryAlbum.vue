<template>
  <view class="profile-album">
    <view class="profile-album__head">
      <view class="profile-album__title-wrap">
        <text class="profile-album__title">{{ title }}</text>
        <text class="profile-album__subtitle">{{ subtitle }}</text>
      </view>

      <view
        v-if="showAllEntry"
        class="profile-album__all"
        @tap="$emit('open-all')"
      >
        <text class="profile-album__all-text">{{ copy.profile.albumAllShort }}</text>
      </view>
    </view>

    <view v-if="isLoading" class="profile-album__state">
      <text class="profile-album__state-text">{{ copy.profile.albumLoading }}</text>
    </view>

    <view v-else-if="items.length" class="profile-album__grid">
      <view
        v-for="item in items"
        :key="item.id"
        class="profile-album__card"
        @tap="$emit('open-item', item.attachmentId)"
      >
        <image
          class="profile-album__image"
          :src="normalizeLocalImageSrc(item.localUri)"
          mode="aspectFill"
          lazy-load
        />
        <text class="profile-album__date">{{ formatProfileRecordDate(item.recordDate) }}</text>
      </view>
    </view>

    <view v-else class="profile-album__state profile-album__state--empty">
      <text class="profile-album__state-title">
        {{ hasAnyRecord ? copy.profile.albumEmptyHasRecord : copy.profile.albumEmptyNoRecord }}
      </text>
      <text class="profile-album__state-text">
        {{
          hasAnyRecord
            ? copy.profile.albumEmptyHasRecordCopy
            : copy.profile.albumEmptyNoRecordCopy
        }}
      </text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useSettingsStore } from "@/app/store/useSettingsStore";
import { t } from "@/shared/i18n";
import { formatProfileRecordDate, type ProfileAlbumItem } from "@/features/profile/profileData";
import { normalizeLocalImageSrc } from "@/shared/utils/localFiles";

const settingsStore = useSettingsStore();
const copy = computed(() => t(settingsStore.locale));

withDefaults(defineProps<{
  title?: string;
  subtitle?: string;
  items: ProfileAlbumItem[];
  isLoading?: boolean;
  hasAnyRecord?: boolean;
  showAllEntry?: boolean;
}>(), {
  title: "",
  subtitle: "",
  isLoading: false,
  hasAnyRecord: false,
  showAllEntry: false,
});

defineEmits<{
  (event: "open-item", attachmentId: string): void;
  (event: "open-all"): void;
}>();
</script>

<style scoped>
.profile-album {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
}

.profile-album__head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20rpx;
}

.profile-album__title-wrap {
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.profile-album__title {
  font-size: 29rpx;
  line-height: 1.3;
  color: var(--noche-ink-strong);
  letter-spacing: 0.08em;
  padding-left: 0.08em;
}

.profile-album__subtitle,
.profile-album__all-text,
.profile-album__date {
  font-size: 17rpx;
  line-height: 1.6;
  color: var(--noche-ink-faint);
  letter-spacing: 0.04em;
}

.profile-album__all {
  padding: 4rpx 0;
}

.profile-album__grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 20rpx 16rpx;
}

.profile-album__card {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.profile-album__image {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 20rpx;
  background: var(--noche-card-muted);
}

.profile-album__state {
  padding: 20rpx 0 8rpx;
  border-radius: 0;
  background: transparent;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8rpx;
  text-align: left;
}

.profile-album__state-title {
  font-size: 23rpx;
  line-height: 1.4;
  color: var(--noche-ink-strong);
}

.profile-album__state-text {
  font-size: 19rpx;
  line-height: 1.72;
  color: var(--noche-ink-faint);
}

.profile-album__state--empty {
  border-top: 1rpx solid color-mix(in srgb, var(--noche-border) 48%, transparent);
  border-bottom: 1rpx solid color-mix(in srgb, var(--noche-border) 36%, transparent);
}
</style>
