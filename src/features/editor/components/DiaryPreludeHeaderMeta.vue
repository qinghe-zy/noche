<template>
  <view
    class="diary-prelude-header-meta"
    :class="{ 'diary-prelude-header-meta--editable': isEditable }"
    @tap="handleEdit"
  >
    <view class="diary-prelude-header-meta__row">
      <text class="diary-prelude-header-meta__meta-text">{{ subtitle }}</text>
      <text class="diary-prelude-header-meta__meta-text">{{ timeLabel }}</text>
      <view
        v-for="icon in iconItems"
        :key="`${icon.kind}-${icon.code}`"
        class="diary-prelude-header-meta__icon"
      >
        <DiaryPreludeGlyph
          class="diary-prelude-header-meta__icon-glyph"
          :kind="icon.kind"
          :code="icon.code"
        />
      </view>
      <view
        v-if="showImageAction"
        class="diary-prelude-header-meta__action-button"
        @tap.stop="emit('pick-image')"
      >
        <AppIcon name="image" class="diary-prelude-header-meta__action-icon" />
      </view>
    </view>
    <text v-if="quoteLine" class="diary-prelude-header-meta__quote literary-text">{{ quoteLine }}</text>
  </view>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { DiaryPreludeMeta, DiaryPreludeStatus } from "@/domain/diaryPrelude/types";
import DiaryPreludeGlyph from "@/features/editor/components/DiaryPreludeGlyph.vue";
import AppIcon from "@/shared/ui/AppIcon.vue";
import {
  shouldAllowDiaryPreludeEdit,
  shouldRenderDiaryPreludeHeaderMeta,
} from "@/features/editor/diaryPreludeState";

const props = defineProps<{
  mode: "edit" | "read";
  subtitle: string;
  timeLabel: string;
  status: DiaryPreludeStatus;
  prelude: DiaryPreludeMeta | null;
  showImageAction?: boolean;
}>();

const emit = defineEmits<{
  (event: "edit"): void;
  (event: "pick-image"): void;
}>();

const showPreludeDetails = computed(() =>
  shouldRenderDiaryPreludeHeaderMeta(props.status, props.prelude),
);
const isEditable = computed(() => shouldAllowDiaryPreludeEdit(props.mode, props.status));
const showImageAction = computed(() => props.showImageAction === true && props.mode === "edit");
const iconItems = computed(() =>
  [
    {
      kind: "weather" as const,
      code: showPreludeDetails.value ? props.prelude?.weatherCode ?? null : null,
    },
    {
      kind: "mood" as const,
      code: showPreludeDetails.value ? props.prelude?.moodCode ?? null : null,
    },
  ].filter((item) => Boolean(item.code)),
);
const quoteLine = computed(() => (
  showPreludeDetails.value && props.mode === "read"
    ? props.prelude?.quote ?? ""
    : ""
));

function handleEdit(): void {
  if (!isEditable.value) {
    return;
  }

  emit("edit");
}
</script>

<style scoped>
.diary-prelude-header-meta,
.diary-prelude-header-meta * {
  box-sizing: border-box;
}

.diary-prelude-header-meta {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.diary-prelude-header-meta--editable:active {
  opacity: 0.82;
}

.diary-prelude-header-meta__row {
  display: flex;
  flex-wrap: wrap;
  gap: 18rpx;
  align-items: center;
}

.diary-prelude-header-meta__meta-text {
  font-family: "Inter", "PingFang SC", sans-serif;
  font-size: 22rpx;
  line-height: 1.6;
  font-weight: 400;
  letter-spacing: 0.12em;
  color: rgba(99, 95, 85, 0.78);
}

.diary-prelude-header-meta__icon {
  width: 28rpx;
  height: 28rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(99, 95, 85, 0.78);
}

.diary-prelude-header-meta__action-button {
  width: 40rpx;
  height: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 999rpx;
  color: rgba(99, 95, 85, 0.78);
}

.diary-prelude-header-meta__icon-glyph {
  width: 24rpx;
  height: 24rpx;
}

.diary-prelude-header-meta__action-icon {
  width: 24rpx;
  height: 24rpx;
  color: currentColor;
}

.literary-text {
  letter-spacing: 0.04em;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
}

.diary-prelude-header-meta__quote {
  display: block;
  font-size: 20rpx;
  line-height: 1.74;
  color: rgba(99, 95, 85, 0.54);
}
</style>
