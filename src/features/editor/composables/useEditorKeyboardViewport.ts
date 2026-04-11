import { computed, ref } from "vue";

export function useEditorKeyboardViewport() {
  const screenHeight = ref(uni.getSystemInfoSync().screenHeight || 800);

  const cursorSpacing = computed(() => {
    if (screenHeight.value >= 2400) {
      return 220;
    }

    if (screenHeight.value >= 2000) {
      return 200;
    }

    return 180;
  });

  return {
    cursorSpacing,
  };
}
