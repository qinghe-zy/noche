<template>
  <text class="chisu-symbol" :class="[`chisu-symbol--${tone}`]">{{ symbol }}</text>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  symbol: "◎" | "✒" | "✉" | "◫" | "▦" | "✦";
  tone?: "active" | "muted" | "accent";
}>(), {
  tone: "muted",
});
</script>

<style scoped>
.chisu-symbol {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: "Noto Serif SC", "EB Garamond", serif;
  line-height: 1;
}

.chisu-symbol--active {
  color: var(--paper, var(--noche-text));
  opacity: 1;
}

.chisu-symbol--muted {
  color: var(--muted, var(--noche-muted));
  opacity: 0.72;
}

.chisu-symbol--accent {
  color: var(--red, #A83228);
  opacity: 1;
}
</style>
