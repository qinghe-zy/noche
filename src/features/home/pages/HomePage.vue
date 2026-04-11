<template>
  <view class="home-page">
    <view class="home-page__vignette"></view>

    <view class="home-page__topnav">
      <view class="home-page__topnav-inner">
        <view class="home-page__topnav-spacer"></view>
        <view class="home-page__topnav-profile-entry" @tap="handleNavigate('profile')">
          <view class="home-page__topnav-profile-mark">
            <HomeProfileMark />
          </view>
        </view>
      </view>
    </view>

    <view class="home-page__main">
      <view class="home-page__hero">
        <text class="home-page__hero-title home-page__letter-spacing-widest">见字如面</text>
      </view>

      <view class="home-page__focus">
        <view class="home-page__paper-premium" @click="handleNavigate('editor', { type: 'diary' })">
          <view class="home-page__paper-texture" :style="paperTextureStyle"></view>

          <view class="home-page__paper-inner">
            <view class="home-page__paper-line"></view>

            <view class="home-page__paper-content">
              <view class="home-page__paper-icon-wrap">
                <text class="home-page__material-symbols home-page__paper-icon">auto_stories</text>
              </view>

              <view class="home-page__paper-copy">
                <text class="home-page__paper-heading home-page__letter-spacing-medium">打开今日信纸</text>
                <text class="home-page__paper-subtitle">Today&apos;s Letter</text>
              </view>
            </view>

            <view class="home-page__paper-seal">
              <view class="home-page__paper-seal-dot"></view>
            </view>
          </view>
        </view>
      </view>

      <view class="home-page__secondary-nav">
        <view class="home-page__nav-entry" @click="handleOpenJotting">
          <view class="home-page__nav-entry-icon">
            <text class="home-page__material-symbols">edit_note</text>
          </view>
          <text class="home-page__nav-entry-label">随笔</text>
        </view>

        <view class="home-page__nav-entry" @click="handleNavigate('editor', { type: 'future' })">
          <view class="home-page__nav-entry-icon">
            <text class="home-page__material-symbols">history_edu</text>
          </view>
          <text class="home-page__nav-entry-label">未来信</text>
        </view>

        <view class="home-page__nav-entry" @click="handleNavigate('mailbox')">
          <view class="home-page__nav-entry-icon">
            <text class="home-page__material-symbols">drafts</text>
          </view>
          <text class="home-page__nav-entry-label">邮箱</text>
        </view>
      </view>
    </view>

    <view class="home-page__footer">
      <text class="home-page__footer-text">{{ footerMark }}</text>
    </view>

    <view
      v-if="isJottingModalOpen"
      class="home-page__jotting-modal-mask"
      @click="handleCloseJottingModal"
    >
      <view class="home-page__jotting-modal" @click.stop>
        <view class="home-page__jotting-modal-head">
          <text class="home-page__jotting-modal-title">这页随笔还没有收好</text>
          <text class="home-page__jotting-modal-copy">要继续沿着上次的纸页写，还是重新起一张？</text>
        </view>

        <view class="home-page__jotting-modal-actions">
          <view class="home-page__jotting-modal-action" @click="handleContinueJottingDraft">
            <text class="home-page__jotting-modal-action-title">继续上次</text>
            <text class="home-page__jotting-modal-action-copy">回到刚才那一页</text>
          </view>

          <view class="home-page__jotting-modal-action" @click="handleCreateAnotherJottingDraft">
            <text class="home-page__jotting-modal-action-title">另起一张</text>
            <text class="home-page__jotting-modal-action-copy">先把上一页收好，再写这一刻</text>
          </view>

          <view class="home-page__jotting-modal-action home-page__jotting-modal-action--muted" @click="handleCloseJottingModal">
            <text class="home-page__jotting-modal-action-title">取消</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import dayjs from "dayjs";
import { ROUTES } from "@/shared/constants/routes";
import { useDraftStore } from "@/app/store/useDraftStore";
import type { Draft } from "@/domain/draft/types";
import { resolveDraftSaveAction } from "@/domain/services/entryService";
import HomeProfileMark from "@/features/home/components/HomeProfileMark.vue";

const draftStore = useDraftStore();
const isJottingModalOpen = ref(false);
const pendingJottingDraft = ref<Draft | null>(null);

const paperTextureImage =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBWOsHrKELS9OzpBgav9btG0US__Q5LVLc5d_x1Vu7d-WYGRKP8MPrIfJpyg0fSeVm4vXpzCQ60I0lJ9sY6fds7DgEnasBrNYGgNWr83qla5Zvb8IBqT4a1X58MkOHjlWBNq39ZGMScTKh70f2TxEcHRksZ1S3QrfyfwEfWym1CX23p8hGNulas0eB0CwBEYPnBCGXRNeZEf9a2muY7EjUu8RaLEJAfc4LoaTYTQxjxpgtGF9x2yIhgtm2BoNbWVB_hYXjyMY5EPYU";

const footerMark = computed(() => `${dayjs().format("YYYY年MM月")} · 安静书写`);
const paperTextureStyle = {
  backgroundImage: `url(${paperTextureImage})`,
};

const handleNavigate = (routeKey: keyof typeof ROUTES, query?: Record<string, string>) => {
  let url = `/${ROUTES[routeKey]}`;
  if (query) {
    const queryString = Object.entries(query)
      .map(([key, val]) => `${key}=${val}`)
      .join("&");
    url += `?${queryString}`;
  }

  uni.navigateTo({
    url,
  });
};

const handleOpenJotting = async () => {
  const existingDraft = await draftStore.peekDraft({
    type: "jotting",
  });

  if (!existingDraft || resolveDraftSaveAction(existingDraft) !== "save-entry") {
    handleNavigate("editor", { type: "jotting" });
    return;
  }

  pendingJottingDraft.value = existingDraft;
  isJottingModalOpen.value = true;
};

function handleCloseJottingModal() {
  isJottingModalOpen.value = false;
  pendingJottingDraft.value = null;
}

function handleContinueJottingDraft() {
  handleCloseJottingModal();
  handleNavigate("editor", { type: "jotting" });
}

async function handleCreateAnotherJottingDraft() {
  if (pendingJottingDraft.value) {
    await draftStore.openDraft({
      type: "jotting",
    });
    await draftStore.saveActiveDraftAsEntry();
    uni.showToast({
      title: "上一张随笔已收好",
      icon: "none",
    });
  }

  handleCloseJottingModal();
  handleNavigate("editor", { type: "jotting" });
}
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@200;300;400;600&family=Inter:wght@300;400&display=swap");
@import url("https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap");

.home-page,
.home-page * {
  box-sizing: border-box;
}

.home-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow-x: hidden;
  background-color: #fdfbf7;
  color: #2c2e2a;
  font-family: "Noto Serif SC", serif;
  -webkit-font-smoothing: antialiased;
  position: relative;
}

.home-page__vignette {
  position: fixed;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(circle at center, transparent 0%, rgba(0, 0, 0, 0.01) 100%);
}

.home-page__topnav {
  width: 100%;
  z-index: 2;
}

.home-page__topnav-inner {
  width: 100%;
  max-width: 768px;
  margin: 0 auto;
  padding: 28px 22px 0;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.home-page__topnav-spacer {
  flex: 1;
}

.home-page__topnav-profile-entry {
  width: 72rpx;
  height: 72rpx;
  border: none;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(138, 129, 120, 0.82);
  padding: 0;
  box-shadow: none;
  outline: none;
  -webkit-tap-highlight-color: transparent;
  transition: color 160ms ease, opacity 160ms ease;
}

.home-page__topnav-profile-mark {
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.92;
}

.home-page__topnav-profile-entry:active {
  color: #73695f;
}

.home-page__topnav-profile-entry:hover {
  color: #73695f;
}

.home-page__main {
  flex: 1;
  width: 100%;
  max-width: 768px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0 24px 24px;
  position: relative;
  margin-top: -24px;
  z-index: 1;
}

.home-page__hero {
  margin-bottom: 56px;
  text-align: center;
}

.home-page__hero-title {
  font-size: 38px;
  line-height: 1.15;
  font-weight: 200;
  color: rgba(44, 46, 42, 0.9);
}

.home-page__letter-spacing-widest {
  letter-spacing: 0.8em;
  padding-left: 0.8em;
}

.home-page__letter-spacing-medium {
  letter-spacing: 0.35em;
  padding-left: 0.35em;
}

.home-page__focus {
  width: 100%;
  display: flex;
  justify-content: center;
  margin-bottom: 56px;
}

.home-page__paper-premium {
  position: relative;
  width: min(100%, 340px);
  aspect-ratio: 1 / 1.4;
  padding: 48px;
  background-color: #ffffff;
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.03),
    0 10px 30px -5px rgba(0, 0, 0, 0.05),
    inset 0 0 0 1px rgba(0, 0, 0, 0.02);
}

.home-page__paper-premium::after {
  content: "";
  position: absolute;
  inset: 8px;
  border: 1px solid rgba(0, 0, 0, 0.03);
  pointer-events: none;
}

.home-page__paper-texture {
  position: absolute;
  inset: 0;
  background-blend-mode: multiply;
  opacity: 0.04;
  pointer-events: none;
}

.home-page__paper-inner {
  width: 100%;
  height: 100%;
  border: 0.5px solid rgba(201, 203, 192, 0.35);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
}

.home-page__paper-line {
  position: absolute;
  top: 40px;
  left: 50%;
  transform: translateX(-50%);
  width: 24px;
  height: 0.5px;
  background: rgba(201, 203, 192, 0.5);
}

.home-page__paper-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32px;
  z-index: 1;
}

.home-page__paper-icon-wrap {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.home-page__material-symbols {
  font-family: "Material Symbols Outlined", sans-serif;
  font-variation-settings: "FILL" 0, "wght" 200, "GRAD" 0, "opsz" 24;
  line-height: 1;
}

.home-page__paper-icon {
  font-size: 40px;
  color: rgba(99, 95, 85, 0.3);
}

.home-page__paper-copy {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.home-page__paper-heading {
  font-size: 30px;
  line-height: 1.3;
  font-weight: 300;
  color: rgba(44, 46, 42, 0.82);
  text-align: center;
}

.home-page__paper-subtitle {
  font-family: "Inter", "PingFang SC", sans-serif;
  font-size: 10px;
  letter-spacing: 0.4em;
  text-transform: uppercase;
  color: rgba(138, 140, 130, 0.68);
  padding-left: 0.4em;
}

.home-page__paper-seal {
  position: absolute;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  opacity: 0.3;
}

.home-page__paper-seal-dot {
  width: 6px;
  height: 6px;
  border-radius: 9999px;
  border: 1px solid #c9cbc0;
}

.home-page__secondary-nav {
  width: 100%;
  max-width: 420px;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  gap: 28px;
}

.home-page__nav-entry {
  flex: 1;
  max-width: 96px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 12px 8px;
}

.home-page__nav-entry-icon {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(201, 203, 192, 0.45);
  color: rgba(99, 95, 85, 0.72);
}

.home-page__nav-entry-label {
  font-family: "Inter", "PingFang SC", sans-serif;
  font-size: 10px;
  letter-spacing: 0.3em;
  color: rgba(99, 95, 85, 0.76);
  padding-left: 0.3em;
}

.home-page__footer {
  margin-top: auto;
  padding: 24px 0 48px;
  z-index: 1;
}

.home-page__footer-text {
  font-family: "Inter", "PingFang SC", sans-serif;
  font-size: 10px;
  letter-spacing: 0.6em;
  text-transform: uppercase;
  color: rgba(201, 203, 192, 0.88);
  padding-left: 0.6em;
}

.home-page__jotting-modal-mask {
  position: fixed;
  inset: 0;
  z-index: 30;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 24px 16px 28px;
  background: rgba(44, 46, 42, 0.24);
  backdrop-filter: blur(8px);
}

.home-page__jotting-modal {
  width: min(100%, 420px);
  background: rgba(252, 248, 241, 0.98);
  border: 1px solid rgba(213, 204, 191, 0.82);
  border-radius: 22px;
  box-shadow: 0 18px 40px rgba(44, 46, 42, 0.14);
  overflow: hidden;
}

.home-page__jotting-modal-head {
  padding: 26px 24px 18px;
  text-align: center;
  border-bottom: 1px solid rgba(221, 212, 200, 0.72);
}

.home-page__jotting-modal-title {
  display: block;
  font-size: 24px;
  line-height: 1.35;
  color: #2c2e2a;
}

.home-page__jotting-modal-copy {
  display: block;
  margin-top: 10px;
  font-size: 13px;
  line-height: 1.8;
  color: rgba(99, 95, 85, 0.82);
}

.home-page__jotting-modal-actions {
  display: flex;
  flex-direction: column;
}

.home-page__jotting-modal-action {
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: center;
  text-align: center;
  background: transparent;
}

.home-page__jotting-modal-action + .home-page__jotting-modal-action {
  border-top: 1px solid rgba(221, 212, 200, 0.58);
}

.home-page__jotting-modal-action-title {
  font-size: 18px;
  line-height: 1.4;
  color: #2c2e2a;
}

.home-page__jotting-modal-action-copy {
  font-size: 12px;
  line-height: 1.7;
  color: rgba(99, 95, 85, 0.72);
}

.home-page__jotting-modal-action--muted .home-page__jotting-modal-action-title {
  color: rgba(99, 95, 85, 0.8);
}
</style>
