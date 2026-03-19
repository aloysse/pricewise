---
name: pwa-requirements
description: PWA 技術需求、相機存取、離線支援、Service Worker 設定。開發前端 PWA 功能時套用。
---

# PWA 技術需求

## Vite PWA 設定

```typescript
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "購物記錄",
        short_name: "購物記錄",
        description: "記錄日常購物，追蹤性價比",
        theme_color: "#ffffff",
        background_color: "#ffffff",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        icons: [
          { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
          {
            src: "/icons/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "supabase-cache",
              expiration: { maxEntries: 50, maxAgeSeconds: 300 },
            },
          },
        ],
      },
    }),
  ],
});
```

## 相機存取

### 方式一：input[capture]（最簡單，推薦）

```tsx
// 直接開啟相機拍照
const openCamera = () => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.capture = "environment"; // 'environment' = 後鏡頭, 'user' = 前鏡頭
  input.onchange = (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) onImageSelected(file);
  };
  input.click();
};

// 開啟相簿選擇（不帶 capture）
const openGallery = () => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  // 不加 capture，讓使用者選擇相機或相簿
  input.onchange = (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) onImageSelected(file);
  };
  input.click();
};
```

### 方式二：getUserMedia（進階，需要處理權限）

```tsx
// 需要時才使用，適合需要預覽畫面的情境
const startCamera = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" },
    });
    videoRef.current!.srcObject = stream;
  } catch (error) {
    if (error instanceof DOMException && error.name === "NotAllowedError") {
      // 用戶拒絕，顯示提示
      showPermissionDeniedMessage();
    }
  }
};
```

## 圖片處理（上傳前壓縮）

```typescript
// src/utils/image.ts
export async function compressImage(
  file: File,
  maxWidth = 1920,
  quality = 0.85,
): Promise<File> {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ratio = Math.min(maxWidth / img.width, 1);
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;

      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(
        (blob) => resolve(new File([blob!], file.name, { type: "image/jpeg" })),
        "image/jpeg",
        quality,
      );
    };
  });
}

// 最大允許檔案大小
export const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB

export function validateImageFile(file: File): string | null {
  if (!file.type.startsWith("image/")) return "請選擇圖片檔案";
  if (file.size > MAX_IMAGE_SIZE) return "圖片大小不能超過 10MB";
  return null;
}
```

## PWA 安裝提示

```tsx
// src/hooks/usePWAInstall.ts
export function usePWAInstall() {
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const install = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === "accepted") setInstallPrompt(null);
  };

  return { canInstall: !!installPrompt, install };
}
```

## 重要限制

- **HTTPS 必要**：相機權限、Service Worker 都需要 HTTPS（localhost 除外）
- **iOS Safari 限制**：PWA 安裝後無法存取 cookie，Auth 需使用 localStorage
- **相機權限**：用戶拒絕後需引導至瀏覽器設定手動開啟
