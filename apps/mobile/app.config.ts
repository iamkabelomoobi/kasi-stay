import { ConfigContext, ExpoConfig } from "expo/config";

const IS_DEV = process.env.APP_VARIANT === "development";
const IS_PREVIEW = process.env.APP_VARIANT === "preview";

const getUniqueIdentifier = () => {
  if (IS_DEV) {
    return "com.paystay.dev";
  }
  if (IS_PREVIEW) {
    return "com.paystay.preview";
  }
  return "com.paystay";
};

const getAppName = () => {
  if (IS_DEV) {
    return "Pay Stay (Dev)";
  }
  if (IS_PREVIEW) {
    return "Pay Stay (Preview)";
  }
  return "Pay Stay";
};

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,

  name: getAppName(),
  slug: "paystay",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "paystay",
  userInterfaceStyle: "automatic",
  newArchEnabled: true,

  ios: {
    ...config.ios,
    supportsTablet: true,
    bundleIdentifier: getUniqueIdentifier(),
  },

  android: {
    ...config.android,
    package: getUniqueIdentifier(),
    adaptiveIcon: {
      backgroundColor: "#E6F4FE",
      foregroundImage: "./assets/images/android-icon-foreground.png",
      backgroundImage: "./assets/images/android-icon-background.png",
      monochromeImage: "./assets/images/android-icon-monochrome.png",
    },
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
  },

  web: {
    ...config.web,
    output: "static",
    favicon: "./assets/images/favicon.png",
  },

  plugins: [
    "expo-router",
    [
      "expo-splash-screen",
      {
        image: "./assets/images/splash-icon.png",
        imageWidth: 200,
        resizeMode: "contain",
        backgroundColor: "#ffffff",
        dark: {
          backgroundColor: "#000000",
        },
      },
    ],
  ],

  experiments: {
    ...config.experiments,
    typedRoutes: true,
  },
});
