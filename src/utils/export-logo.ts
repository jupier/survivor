// Utility script to export the logo as an image file
// This can be run in the browser console or as a standalone script

import { createLogo, createLogoIcon } from "../assets/create-logo";

// Function to download the logo as an image
export function downloadLogo(): void {
  const logoDataUrl = createLogo();
  const link = document.createElement("a");
  link.download = "survivor-logo.png";
  link.href = logoDataUrl;
  link.click();
}

// Function to download the icon as an image
export function downloadLogoIcon(): void {
  const iconDataUrl = createLogoIcon();
  const link = document.createElement("a");
  link.download = "survivor-icon.png";
  link.href = iconDataUrl;
  link.click();
}

// Function to set the logo as favicon
export function setLogoAsFavicon(): void {
  const iconDataUrl = createLogoIcon();
  const link = document.querySelector("link[rel*='icon']") as HTMLLinkElement || document.createElement("link");
  link.type = "image/png";
  link.rel = "shortcut icon";
  link.href = iconDataUrl;
  document.getElementsByTagName("head")[0].appendChild(link);
}

// Auto-set favicon when this module is imported
if (typeof window !== "undefined") {
  setLogoAsFavicon();
}

