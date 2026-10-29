// Сборка для приватного предпросмотра (не для публикации сайта):
//   VITE_PREVIEW_ROUTER=memory npx vite build --config vite.preview.config.js --outDir <папка>
// Отличия от обычной сборки: относительные пути (страница открывается не из корня
// домена) и маршрутизация в памяти (см. App.jsx). Код сайта не меняется.
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const PUBLIC_PATH = /(["'`])\/(logo\.svg|icons\/[\w-]+\.svg|motion\/[\w-]+\.svg)/g;

export default defineConfig({
  base: "./",
  plugins: [
    react(),
    {
      name: "pan-terra-relative-public-paths",
      enforce: "pre",
      transform(code, id) {
        if (!/\/src\/.*\.(jsx?|tsx?)$/.test(id)) return null;
        const out = code.replace(PUBLIC_PATH, "$1./$2");
        return out === code ? null : { code: out, map: null };
      },
    },
  ],
});
