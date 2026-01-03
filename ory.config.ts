import type { OryClientConfiguration } from "@ory/elements-react";

const config: OryClientConfiguration = {
  sdk: {
    url: process.env.NEXT_PUBLIC_ORY_SDK_URL,
  },
  project: {
    default_locale: "en",
    default_redirect_url: "/",
    error_ui_url: "/error",
    locale_behavior: "force_default",
    name: "",
    registration_enabled: true,
    verification_enabled: true,
    recovery_enabled: true,
    registration_ui_url: "/registration",
    verification_ui_url: "/verification",
    recovery_ui_url: "/recovery",
    login_ui_url: "/login",
    settings_ui_url: "/settings",
  },
};

export default config;
