<template>
  <view
    v-if="shouldRender"
    class="diary-prelude-header-meta"
    :class="{
      'diary-prelude-header-meta--editable': isEditable,
      'diary-prelude-header-meta--compact-icons': isCompactIcons,
    }"
    @tap="handleEdit"
  >
    <template v-if="isCompactIcons">
      <view class="diary-prelude-header-meta__compact-icons">
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
      </view>
    </template>

    <template v-else>
      <view class="diary-prelude-header-meta__row">
        <text class="diary-prelude-header-meta__meta-text">{{ subtitle }}</text>
        <text class="diary-prelude-header-meta__meta-text">{{ timeLabel }}</text>
        <view
          v-for="icon in visibleIconItems"
          :key="`${icon.kind}-${icon.code}`"
          class="diary-prelude-header-meta__icon"
        >
          <DiaryPreludeGlyph
            class="diary-prelude-header-meta__icon-glyph"
            :kind="icon.kind"
            :code="icon.code"
          />
        </view>
      </view>
      <text v-if="quoteLine" class="diary-prelude-header-meta__quote literary-text">{{ quoteLine }}</text>
    </template>
  </view>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { DiaryPreludeMeta, DiaryPreludeStatus } from "@/domain/diaryPrelude/types";
import DiaryPreludeGlyph from "@/features/editor/components/DiaryPreludeGlyph.vue";
import {
  shouldAllowDiaryPreludeEdit,
  shouldRenderDiaryPreludeHeaderMeta,
} from "@/features/editor/diaryPreludeState";

const props = withDefaults(defineProps<{
  mode: "edit" | "read";
  subtitle: string;
  timeLabel: string;
  status: DiaryPreludeStatus;
  prelude: DiaryPreludeMeta | null;
  variant?: "default" | "compact-icons";
  showGlyphs?: boolean;
}>(), {
  variant: "default",
  showGlyphs: true,
});

const emit = defineEmits<{
  (event: "edit"): void;
}>();

const showPreludeDetails = computed(() =>
  shouldRenderDiaryPreludeHeaderMeta(props.status, props.prelude),
);
const isCompactIcons = computed(() => props.variant === "compact-icons");
const isEditable = computed(() =>
  !isCompactIcons.value && shouldAllowDiaryPreludeEdit(props.mode, props.status),
);
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
const visibleIconItems = computed(() =>
  props.showGlyphs ? iconItems.value : [],
);
const quoteLine = computed(() => (
  showPreludeDetails.value && props.mode === "read"
    ? props.prelude?.quote ?? ""
    : ""
));
const shouldRender = computed(() => {
  if (isCompactIcons.value) {
    return iconItems.value.length > 0;
  }

  return Boolean(props.subtitle || props.timeLabel || visibleIconItems.value.length || quoteLine.value);
});

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

.diary-prelude-header-meta--compact-icons {
  width: auto;
  min-width: 0;
  gap: 0;
}

.diary-prelude-header-meta__row,
.diary-prelude-header-meta__compact-icons {
  display: flex;
  flex-wrap: wrap;
  gap: 18rpx;
  align-items: center;
}

.diary-prelude-header-meta__compact-icons {
  gap: 12rpx;
}

.diary-prelude-header-meta__meta-text {
  font-family: var(--font-body, inherit);
  font-size: 22rpx;
  line-height: 1.6;
  font-weight: 400;
  letter-spacing: 0.12em;
  color: var(--text-secondary, rgba(99, 95, 85, 0.78));
}

.diary-prelude-header-meta__icon {
  width: 28rpx;
  height: 28rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary, rgba(99, 95, 85, 0.78));
  flex: 0 0 auto;
}

.diary-prelude-header-meta__icon-glyph {
  width: 24rpx;
  height: 24rpx;
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
  color: var(--text-tertiary, rgba(99, 95, 85, 0.54));
}
</style>
