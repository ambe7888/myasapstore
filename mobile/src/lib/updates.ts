import * as Updates from 'expo-updates';

export interface UpdateCheckResult {
  applied: boolean;
  message: string;
}

/**
 * Checks EAS Update for a newer JS bundle and, if found, downloads and
 * applies it immediately (reloads the app). Requires the project to be
 * linked to EAS (`eas init` + `eas update:configure`) — until then
 * `Updates.isEnabled` is false and this is a no-op, so it's always safe
 * to call.
 */
export async function checkForUpdate(): Promise<UpdateCheckResult> {
  if (__DEV__) {
    return { applied: false, message: 'Les mises à jour sont désactivées en mode développement.' };
  }

  if (!Updates.isEnabled) {
    return { applied: false, message: "Le système de mise à jour n'est pas encore configuré." };
  }

  try {
    const result = await Updates.checkForUpdateAsync();
    if (!result.isAvailable) {
      return { applied: false, message: 'Vous utilisez déjà la dernière version.' };
    }

    await Updates.fetchUpdateAsync();
    await Updates.reloadAsync();
    return { applied: true, message: 'Mise à jour installée.' };
  } catch {
    return { applied: false, message: 'Impossible de vérifier les mises à jour pour le moment.' };
  }
}
