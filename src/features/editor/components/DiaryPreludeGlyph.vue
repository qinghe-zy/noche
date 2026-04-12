<template>
  <image
    class="diary-prelude-glyph"
    :src="iconSource"
    @error="handleImageError"
    mode="aspectFit"
    aria-hidden="true"
  />
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import {
  resolvePreludeGlyphFallbackSource,
  resolvePreludeGlyphPrimarySource,
} from "@/features/editor/preludeGlyphSource";

const props = defineProps<{
  kind: "weather" | "mood";
  code: string | null | undefined;
}>();

const fallbackCode = computed(() => (props.kind === "weather" ? "sunny" : "calm"));
const resolvedCode = computed(() => props.code ?? fallbackCode.value);
const shouldUseFallback = ref(false);

watch(
  () => [props.kind, resolvedCode.value] as const,
  () => {
    shouldUseFallback.value = false;
  },
);

const iconSource = computed(() => (
  shouldUseFallback.value
    ? resolvePreludeGlyphFallbackSource(props.kind, resolvedCode.value)
    : resolvePreludeGlyphPrimarySource(props.kind, resolvedCode.value)
));

function handleImageError(): void {
  if (shouldUseFallback.value) {
    return;
  }

  shouldUseFallback.value = true;
}
</script>

<style scoped>
.diary-prelude-glyph {
  width: 1em;
  height: 1em;
  display: block;
}
</style>
