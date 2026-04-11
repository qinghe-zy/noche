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
        <text class="profile-album__all-text">全部</text>
      </view>
    </view>

    <view v-if="isLoading" class="profile-album__state">
      <text class="profile-album__state-text">正在收拢这些画面…</text>
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
          :src="item.localUri"
          mode="aspectFill"
          lazy-load
        />
        <text class="profile-album__date">{{ formatProfileRecordDate(item.recordDate) }}</text>
      </view>
    </view>

    <view v-else class="profile-album__state profile-album__state--empty">
      <text class="profile-album__state-title">
        {{ hasAnyRecord ? "还没有收进图片" : "还没有任何画面" }}
      </text>
      <text class="profile-album__state-text">
        {{
          hasAnyRecord
            ? "带图片的日记、随笔，或已启封的未来信，会安静地留在这里。"
            : "写下第一篇记录、放进第一张照片之后，这里会慢慢变成自己的相册。"
        }}
      </text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { formatProfileRecordDate, type ProfileAlbumItem } from "@/features/profile/profileData";

withDefaults(defineProps<{
  title?: string;
  subtitle?: string;
  items: ProfileAlbumItem[];
  isLoading?: boolean;
  hasAnyRecord?: boolean;
  showAllEntry?: boolean;
}>(), {
  title: "时光相册",
  subtitle: "只收本地留下的画面",
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
  gap: 26rpx;
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
  gap: 8rpx;
}

.profile-album__title {
  font-size: 30rpx;
  line-height: 1.3;
  color: #31332e;
  letter-spacing: 0.18em;
  padding-left: 0.18em;
}

.profile-album__subtitle,
.profile-album__all-text,
.profile-album__date {
  font-size: 18rpx;
  line-height: 1.6;
  color: rgba(99, 95, 85, 0.72);
  letter-spacing: 0.14em;
}

.profile-album__all {
  padding: 8rpx 0;
}

.profile-album__grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 20rpx 16rpx;
}

.profile-album__card {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.profile-album__image {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 18rpx;
  background: rgba(235, 231, 224, 0.88);
}

.profile-album__state {
  padding: 42rpx 30rpx;
  border-radius: 28rpx;
  background: rgba(255, 255, 255, 0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14rpx;
  text-align: center;
}

.profile-album__state-title {
  font-size: 28rpx;
  line-height: 1.4;
  color: #4d4943;
}

.profile-album__state-text {
  font-size: 22rpx;
  line-height: 1.8;
  color: rgba(99, 95, 85, 0.72);
}
</style>
