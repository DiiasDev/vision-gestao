import { NativeModules, Platform } from "react-native";

const API_PORT = "3333";

const normalizeBaseUrl = (value: string) => value.trim().replace(/\/+$/, "");

const envApiUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
const useFixedApiUrl = process.env.EXPO_PUBLIC_USE_FIXED_API_URL === "true";

const inferBaseUrlFromBundleHost = (): string | null => {
  const scriptURL = NativeModules?.SourceCode?.scriptURL as string | undefined;
  if (!scriptURL) return null;

  try {
    const parsed = new URL(scriptURL);
    if (parsed.hostname) {
      return `http://${parsed.hostname}:${API_PORT}`;
    }
  } catch {
    const match = scriptURL.match(/^(?:https?|exp):\/\/([^/:]+)(?::\d+)?/i);
    if (match?.[1]) {
      return `http://${match[1]}:${API_PORT}`;
    }
  }

  return null;
};

const defaultBaseByPlatform =
  Platform.OS === "android" ? `http://10.0.2.2:${API_PORT}` : `http://localhost:${API_PORT}`;

export const getApiBaseUrl = () => {
  const inferred = inferBaseUrlFromBundleHost();

  if (__DEV__) {
    if (useFixedApiUrl && envApiUrl) {
      return normalizeBaseUrl(envApiUrl);
    }

    if (inferred) return normalizeBaseUrl(inferred);
    if (envApiUrl) return normalizeBaseUrl(envApiUrl);
  } else if (envApiUrl) {
    return normalizeBaseUrl(envApiUrl);
  } else if (inferred) {
    return normalizeBaseUrl(inferred);
  }

  return normalizeBaseUrl(defaultBaseByPlatform);
};
