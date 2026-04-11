<template>
  <view class="profile-stats">
    <view class="profile-stats__row">
      <view
        v-for="item in statItems"
        :key="item.label"
        class="profile-stats__item"
      >
        <text class="profile-stats__value">{{ item.value }}</text>
        <text class="profile-stats__label">{{ item.label }}</text>
      </view>
    </view>

    <text v-if="showEmptyHint" class="profile-stats__empty">
      还没有留下记录。写下第一张纸页后，这里会慢慢长出自己的刻度。
    </text>
  </view>
</template>

<script setup lang="ts">
import { computed } from "vue";
import {
  formatProfileWordCount,
  type ProfileStats,
} from "@/features/profile/profileData";

const props = defineProps<{
  stats: ProfileStats;
  isLoading?: boolean;
}>();

const statItems = computed(() => [
  {
    label: "记录天数",
    value: props.isLoading ? "..." : String(props.stats.recordedDays),
  },
  {
    label: "已记录总字数",
    value: props.isLoading ? "..." : formatProfileWordCount(props.stats.totalWords),
  },
  {
    label: "日记篇数",
    value: props.isLoading ? "..." : String(props.stats.diaryCount),
  },
]);

const showEmptyHint = computed(() =>
  !props.isLoading
  && props.stats.recordedDays === 0
  && props.stats.totalWords === 0
  && props.stats.diaryCount === 0,
);
</script>

<style scoped>
.profile-stats {
  padding: 26rpx 20rpx 0;
}

.profile-stats__row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18rpx;
}

.profile-stats__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10rpx;
  text-align: center;
}

.profile-stats__value {
  font-size: 48rpx;
  line-height: 1.1;
  font-weight: 300;
  color: #31332e;
}

.profile-stats__label {
  font-size: 19rpx;
  line-height: 1.6;
  color: rgba(99, 95, 85, 0.72);
  letter-spacing: 0.16em;
}

.profile-stats__empty {
  display: block;
  margin-top: 24rpx;
  font-size: 22rpx;
  line-height: 1.8;
  text-align: center;
  color: rgba(99, 95, 85, 0.74);
}
</style>
