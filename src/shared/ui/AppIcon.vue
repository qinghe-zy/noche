<template>
  <svg
    class="app-icon"
    :class="$attrs.class"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      v-for="(path, index) in paths"
      :key="`${name}-${index}`"
      :d="path.d"
      :fill="path.fill ?? 'none'"
      :stroke="path.stroke ?? 'currentColor'"
      :stroke-width="path.strokeWidth ?? 1.8"
      :stroke-linecap="path.linecap ?? 'round'"
      :stroke-linejoin="path.linejoin ?? 'round'"
      :opacity="path.opacity ?? 1"
    />
  </svg>
</template>

<script setup lang="ts">
import { computed } from "vue";

type IconName =
  | "back"
  | "back-ios"
  | "mail"
  | "mail-read"
  | "check"
  | "image"
  | "palette"
  | "close"
  | "ink-pen"
  | "calendar"
  | "chevron-left"
  | "chevron-right"
  | "lock"
  | "stories"
  | "edit-note"
  | "edit-square";

const props = defineProps<{
  name: IconName;
}>();

interface IconPath {
  d: string;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  opacity?: number;
  linecap?: "round" | "butt" | "square";
  linejoin?: "round" | "miter" | "bevel";
}

const ICONS: Record<IconName, IconPath[]> = {
  back: [{ d: "M15 6L9 12L15 18" }],
  "back-ios": [{ d: "M14.5 5.5L8.5 12L14.5 18.5" }],
  mail: [
    { d: "M4.5 7.5H19.5V17.5H4.5V7.5Z" },
    { d: "M5.5 8.5L12 13.2L18.5 8.5" },
  ],
  "mail-read": [
    { d: "M4.5 7.5H19.5V17.5H4.5V7.5Z" },
    { d: "M5.5 8.5L12 13.2L18.5 8.5" },
    { d: "M8.4 12.8L10.4 14.8L14.8 10.6", strokeWidth: 1.6 },
  ],
  check: [{ d: "M6.5 12.5L10.2 16L17.5 8" }],
  image: [
    { d: "M4.5 5.5H19.5V18.5H4.5V5.5Z" },
    { d: "M8 10.2C8.55228 10.2 9 9.75228 9 9.2C9 8.64772 8.55228 8.2 8 8.2C7.44772 8.2 7 8.64772 7 9.2C7 9.75228 7.44772 10.2 8 10.2Z", fill: "currentColor", stroke: "none" },
    { d: "M6 16L10.1 12.2L13.2 15.1L15.4 13.1L18 16" },
  ],
  palette: [
    { d: "M12 4.5C7.85786 4.5 4.5 7.63319 4.5 11.5C4.5 14.5407 6.86259 17 9.75 17H11C11.9665 17 12.75 17.7835 12.75 18.75C12.75 19.4404 13.3096 20 14 20C17.5899 20 20.5 17.0899 20.5 13.5C20.5 8.52944 16.4706 4.5 11.5 4.5H12Z" },
    { d: "M8 12.2C8.41421 12.2 8.75 11.8642 8.75 11.45C8.75 11.0358 8.41421 10.7 8 10.7C7.58579 10.7 7.25 11.0358 7.25 11.45C7.25 11.8642 7.58579 12.2 8 12.2Z", fill: "currentColor", stroke: "none" },
    { d: "M10.8 9.5C11.2142 9.5 11.55 9.16421 11.55 8.75C11.55 8.33579 11.2142 8 10.8 8C10.3858 8 10.05 8.33579 10.05 8.75C10.05 9.16421 10.3858 9.5 10.8 9.5Z", fill: "currentColor", stroke: "none" },
    { d: "M14.2 9.9C14.6142 9.9 14.95 9.56421 14.95 9.15C14.95 8.73579 14.6142 8.4 14.2 8.4C13.7858 8.4 13.45 8.73579 13.45 9.15C13.45 9.56421 13.7858 9.9 14.2 9.9Z", fill: "currentColor", stroke: "none" },
  ],
  close: [
    { d: "M7.5 7.5L16.5 16.5" },
    { d: "M16.5 7.5L7.5 16.5" },
  ],
  "ink-pen": [
    { d: "M7 17L17.8 6.2L20.8 9.2L10 20H7V17Z" },
    { d: "M15.8 8.2L18.8 11.2" },
  ],
  calendar: [
    { d: "M6.5 4.5V7.2" },
    { d: "M17.5 4.5V7.2" },
    { d: "M4.5 8H19.5" },
    { d: "M5 6.5H19C19.2761 6.5 19.5 6.72386 19.5 7V18.5C19.5 18.7761 19.2761 19 19 19H5C4.72386 19 4.5 18.7761 4.5 18.5V7C4.5 6.72386 4.72386 6.5 5 6.5Z" },
    { d: "M8.2 11.2H8.3" },
    { d: "M12 11.2H12.1" },
    { d: "M15.8 11.2H15.9" },
    { d: "M8.2 14.6H8.3" },
    { d: "M12 14.6H12.1" },
    { d: "M15.8 14.6H15.9" },
  ],
  "chevron-left": [{ d: "M14 7L10 12L14 17" }],
  "chevron-right": [{ d: "M10 7L14 12L10 17" }],
  lock: [
    { d: "M7.5 11V9.2C7.5 6.9 9.3 5 12 5C14.7 5 16.5 6.9 16.5 9.2V11" },
    { d: "M6.5 11H17.5V19H6.5V11Z" },
  ],
  stories: [
    { d: "M7 5.5H17.5V18.5H7V5.5Z" },
    { d: "M5 7.5H15.5V20.5H5V7.5Z", opacity: 0.68, strokeWidth: 1.4 },
  ],
  "edit-note": [
    { d: "M6 5.5H14.5" },
    { d: "M6 9.5H12.5" },
    { d: "M6 13.5H10.5" },
    { d: "M14.2 13.2L18.3 9.1L20.4 11.2L16.3 15.3L13.8 15.7L14.2 13.2Z" },
  ],
  "edit-square": [
    { d: "M5 5.5H15.5V16" },
    { d: "M8 8.5H13.5" },
    { d: "M8 12H11.8" },
    { d: "M14.2 15.2L18.3 11.1L20.4 13.2L16.3 17.3L13.8 17.7L14.2 15.2Z" },
  ],
};

const paths = computed(() => ICONS[props.name]);
</script>

<style scoped>
.app-icon {
  width: 1em;
  height: 1em;
  display: block;
}
</style>
