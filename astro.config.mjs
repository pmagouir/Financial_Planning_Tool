// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

// Canonical origin for absolute URLs (og:image, og:url, canonical).
// Vercel injects VERCEL_PROJECT_PRODUCTION_URL at build time so this stays
// correct across deploys (and any future custom domain); the fallback covers
// local builds and previews.
const site = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : 'https://financial-planning-tool.vercel.app';

// https://astro.build/config
export default defineConfig({
  site,
  integrations: [react()],

  vite: {
    plugins: [tailwindcss()]
  }
});