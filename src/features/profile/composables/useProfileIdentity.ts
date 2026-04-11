import { ref } from "vue";
import { getPrefsRepository } from "@/app/store/settingsRepository";
import {
  PROFILE_DEFAULT_IDENTITY,
  PROFILE_PREF_KEYS,
  type ProfileIdentity,
} from "@/features/profile/profileData";

function sanitizeText(value: string | null | undefined, fallback: string): string {
  return value && value.trim().length ? value.trim() : fallback;
}

function sanitizeUri(value: string | null | undefined): string | null {
  return value && value.trim().length ? value.trim() : null;
}

export function useProfileIdentity() {
  const identity = ref<ProfileIdentity>({ ...PROFILE_DEFAULT_IDENTITY });
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  async function refresh(): Promise<void> {
    isLoading.value = true;
    error.value = null;

    try {
      const repository = getPrefsRepository();
      const [
        displayNameRecord,
        signatureRecord,
        avatarRecord,
        coverRecord,
        backupRecord,
      ] = await Promise.all([
        repository.get(PROFILE_PREF_KEYS.displayName),
        repository.get(PROFILE_PREF_KEYS.signature),
        repository.get(PROFILE_PREF_KEYS.avatarUri),
        repository.get(PROFILE_PREF_KEYS.coverUri),
        repository.get(PROFILE_PREF_KEYS.lastBackupAt),
      ]);

      identity.value = {
        displayName: sanitizeText(displayNameRecord?.value, PROFILE_DEFAULT_IDENTITY.displayName),
        signature: sanitizeText(signatureRecord?.value, PROFILE_DEFAULT_IDENTITY.signature),
        avatarUri: sanitizeUri(avatarRecord?.value),
        coverUri: sanitizeUri(coverRecord?.value),
        lastBackupAt: sanitizeUri(backupRecord?.value),
      };
    } catch (nextError) {
      error.value = nextError instanceof Error ? nextError.message : "加载个人信息失败。";
      identity.value = { ...PROFILE_DEFAULT_IDENTITY };
    } finally {
      isLoading.value = false;
    }
  }

  async function persistIdentityField(
    key: string,
    value: string,
    apply: () => void,
    fallbackError: string,
  ): Promise<void> {
    error.value = null;

    try {
      await getPrefsRepository().set({ key, value });
      apply();
    } catch (nextError) {
      error.value = nextError instanceof Error ? nextError.message : fallbackError;
    }
  }

  async function setDisplayName(displayName: string): Promise<void> {
    const nextValue = sanitizeText(displayName, PROFILE_DEFAULT_IDENTITY.displayName);
    await persistIdentityField(
      PROFILE_PREF_KEYS.displayName,
      nextValue,
      () => {
        identity.value = {
          ...identity.value,
          displayName: nextValue,
        };
      },
      "保存昵称失败。",
    );
  }

  async function setSignature(signature: string): Promise<void> {
    const nextValue = sanitizeText(signature, PROFILE_DEFAULT_IDENTITY.signature);
    await persistIdentityField(
      PROFILE_PREF_KEYS.signature,
      nextValue,
      () => {
        identity.value = {
          ...identity.value,
          signature: nextValue,
        };
      },
      "保存签名失败。",
    );
  }

  async function setAvatarUri(avatarUri: string | null): Promise<void> {
    const nextValue = sanitizeUri(avatarUri) ?? "";
    await persistIdentityField(
      PROFILE_PREF_KEYS.avatarUri,
      nextValue,
      () => {
        identity.value = {
          ...identity.value,
          avatarUri: sanitizeUri(nextValue),
        };
      },
      "保存头像失败。",
    );
  }

  return {
    identity,
    isLoading,
    error,
    refresh,
    setDisplayName,
    setSignature,
    setAvatarUri,
  };
}
