<script setup lang="ts">
import { computed } from "vue";
import { useSettingsStore } from "@/app/store/useSettingsStore";
import { t } from "@/shared/i18n";
import {
  formatProfileWordCount,
  type ProfileStats,
} from "@/features/profile/profileData";

const props = defineProps<{
  stats: ProfileStats;
  isLoading?: boolean;
}>();
const settingsStore = useSettingsStore();
const copy = computed(() => t(settingsStore.locale));

const statItems = computed(() => [
  {
    label: copy.value.profile.statsRecordedDays,
    value: props.isLoading ? "..." : String(props.stats.recordedDays),
  },
  {
    label: copy.value.profile.statsTotalWords,
    value: props.isLoading ? "..." : formatProfileWordCount(props.stats.totalWords),
  },
  {
    label: copy.value.profile.statsDiaryCount,
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
      {{ copy.profile.statsEmpty }}
    </text>
  </view>
</template>

<style scoped>
.profile-stats {
  padding: 4rpx 0 0;
}

.profile-stats__row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 4rpx;
}

.profile-stats__item {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6rpx;
  padding: 8rpx 8rpx 0;
  text-align: center;
}

.profile-stats__item + .profile-stats__item::before {
  content: "";
  position: absolute;
  left: -2rpx;
  top: 14rpx;
  width: 1rpx;
  height: 42rpx;
  background: rgba(177, 179, 171, 0.18);
}

.profile-stats__value {
  font-size: 48rpx;
  line-height: 1.1;
  font-weight: 400;
  color: #31332e;
}

.profile-stats__label {
  font-size: 17rpx;
  line-height: 1.45;
  color: var(--profile-soft-meta, rgba(99, 95, 85, 0.54));
  letter-spacing: 0.06em;
}

.profile-stats__empty {
  display: block;
  margin-top: 18rpx;
  font-size: 20rpx;
  line-height: 1.7;
  text-align: left;
  color: var(--profile-soft-meta, rgba(99, 95, 85, 0.66));
}

.type-scale-small .profile-stats__value { font-size: 45rpx; }
.type-scale-large .profile-stats__value { font-size: 52rpx; }
.type-scale-small .profile-stats__label { font-size: 16rpx; }
.type-scale-large .profile-stats__label { font-size: 18rpx; }
.type-scale-small .profile-stats__empty { font-size: 19rpx; }
.type-scale-large .profile-stats__empty { font-size: 22rpx; }
</style>
