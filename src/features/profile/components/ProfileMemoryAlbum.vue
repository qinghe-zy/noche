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
        <text class="profile-album__all-text">{{ copy.profile.albumViewAll }}</text>
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
        <view class="profile-album__thumb">
          <image
            class="profile-album__image"
            :src="item.localUri"
            mode="aspectFill"
            lazy-load
          />
        </view>
        <text class="profile-album__date">{{ formatProfileRecordDate(item.recordDate) }}</text>
      </view>
    </view>

    <view v-else class="profile-album__state profile-album__state--empty">
      <text class="profile-album__state-title">{{ copy.profile.albumEmptyFixed }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useSettingsStore } from "@/app/store/useSettingsStore";
import { t } from "@/shared/i18n";
import { formatProfileRecordDate, type ProfileAlbumItem } from "@/features/profile/profileData";

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
  color: #31332e;
  letter-spacing: 0.08em;
  padding-left: 0.08em;
}

.profile-album__subtitle,
.profile-album__all-text,
.profile-album__date {
  font-size: 17rpx;
  line-height: 1.6;
  color: var(--profile-soft-meta, rgba(99, 95, 85, 0.56));
  letter-spacing: 0.04em;
}

.profile-album__all {
  padding: 4rpx 0;
}

.profile-album__grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12rpx;
}

.profile-album__card {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.profile-album__thumb {
  position: relative;
  width: 100%;
  padding-top: 100%;
  border-radius: 20rpx;
  overflow: hidden;
  background: rgba(235, 231, 224, 0.88);
}

.profile-album__image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
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
  color: #4d4943;
}

.profile-album__state-text {
  font-size: 19rpx;
  line-height: 1.72;
  color: var(--profile-soft-meta, rgba(99, 95, 85, 0.6));
}

.profile-album__state--empty {
  border-top: 1rpx solid rgba(177, 179, 171, 0.12);
  border-bottom: 1rpx solid rgba(177, 179, 171, 0.08);
}

.type-scale-small .profile-album__title { font-size: 27rpx; }
.type-scale-large .profile-album__title { font-size: 31rpx; }
.type-scale-small .profile-album__subtitle,
.type-scale-small .profile-album__all-text,
.type-scale-small .profile-album__date { font-size: 16rpx; }
.type-scale-large .profile-album__subtitle,
.type-scale-large .profile-album__all-text,
.type-scale-large .profile-album__date { font-size: 18rpx; }
.type-scale-small .profile-album__state-title { font-size: 22rpx; }
.type-scale-large .profile-album__state-title { font-size: 25rpx; }
.type-scale-small .profile-album__state-text { font-size: 18rpx; }
.type-scale-large .profile-album__state-text { font-size: 20rpx; }
</style>
