import {
  createContext,
  ReactNode,
  useContext,
  useMemo,
  useState,
  useEffect,
} from "react";
import { Platform } from "react-native";
import { vars } from "nativewind";
import AsyncStorage from "@react-native-async-storage/async-storage";

type ThemeMode = "light" | "dark";

type ThemeContextValue = {
  theme: ThemeMode;
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;
  themeVars: ReturnType<typeof vars>;
  isReady: boolean;
};

const LIGHT_THEME = {
  "--background-primary": "249 250 251",
  "--background-secondary": "243 244 246",
  "--card-background": "255 255 255",
  "--border-default": "209 213 219",
  "--divider": "229 231 235",
  "--text-primary": "17 24 39",
  "--text-secondary": "107 114 128",
  "--text-tertiary": "156 163 175",
  "--text-disabled": "209 213 219",
  "--button-primary": "37 99 235",
  "--button-primary-pressed": "29 78 216",
  "--button-secondary": "229 231 235",
  "--button-secondary-text": "17 24 39",
  "--button-destructive": "220 38 38",
  "--state-success": "22 163 74",
  "--state-warning": "245 158 11",
  "--state-error": "220 38 38",
  "--state-info": "37 99 235",
};

const DARK_THEME = {
  "--background-primary": "11 18 32",
  "--background-secondary": "17 24 39",
  "--card-background": "31 41 55",
  "--border-default": "51 65 85",
  "--divider": "55 65 81",
  "--text-primary": "248 250 252",
  "--text-secondary": "209 213 219",
  "--text-tertiary": "148 163 184",
  "--text-disabled": "100 116 139",
  "--button-primary": "59 130 246",
  "--button-primary-pressed": "37 99 235",
  "--button-secondary": "30 41 59",
  "--button-secondary-text": "248 250 252",
  "--button-destructive": "248 113 113",
  "--state-success": "34 197 94",
  "--state-warning": "251 191 36",
  "--state-error": "248 113 113",
  "--state-info": "96 165 250",
};

const ThemeContext = createContext<ThemeContextValue>({
  theme: "light",
  toggleTheme: () => {},
  setTheme: () => {},
  themeVars: vars(LIGHT_THEME),
  isReady: false,
});

const THEME_STORAGE_KEY = "@vision-gestao/theme";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeMode>("light");
  const [isReady, setIsReady] = useState(false);

  const themeVars = useMemo(
    () => vars(theme === "dark" ? DARK_THEME : LIGHT_THEME),
    [theme]
  );

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const saved = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (saved === "light" || saved === "dark") {
          setTheme(saved);
        }
      } catch (loadError) {
        console.warn("Falha ao carregar tema:", loadError);
      } finally {
        setIsReady(true);
      }
    };

    loadTheme();
  }, []);

  useEffect(() => {
    if (!isReady) return;
    AsyncStorage.setItem(THEME_STORAGE_KEY, theme).catch((saveError) => {
      console.warn("Falha ao salvar tema:", saveError);
    });
  }, [theme, isReady]);

  useEffect(() => {
    if (Platform.OS !== "web") return;
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    root.classList.toggle("theme-dark", theme === "dark");
    root.classList.toggle("theme-light", theme === "light");
  }, [theme]);

  const value = useMemo(
    () => ({
      theme,
      toggleTheme: () =>
        setTheme((current) => (current === "dark" ? "light" : "dark")),
      setTheme,
      themeVars,
      isReady,
    }),
    [theme, themeVars, isReady]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
