import localFont from "next/font/local";

export const jakarta = localFont({
  src: "../fonts/jakarta.woff2",
  variable: "--font-jakarta",
  weight: "200 800",
  display: "swap",
  preload: true,
});

export const jbmono = localFont({
  src: "../fonts/jbmono.woff2",
  variable: "--font-jbmono",
  weight: "100 800",
  display: "swap",
  preload: false,
});
