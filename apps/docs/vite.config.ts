import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import viteTsConfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";
import mdx from "fumadocs-mdx/vite";
import * as MdxConfig from "./source.config";


// @ts-expect-error: nitro import is intentionally unused
import { nitro } from 'nitro/vite'


import takumiPackageJson from "@takumi-rs/core/package.json" with {
  type: "json",
};

const config = defineConfig({
  nitro: {
    externals: {
      external: ["@takumi-rs/core"], 
      traceInclude: Object.keys(takumiPackageJson.optionalDependencies), 
    }
	},
  plugins: [
    viteTsConfigPaths({
      projects: ["./tsconfig.json"],
    }),
    mdx(MdxConfig),
    tailwindcss(),
    tanstackStart({
      prerender: {
        enabled: true,
        crawlLinks: true, // Discovers all linkable pages
      },
      router: {
        routeFileIgnorePrefix: "components",
      },
      sitemap: {
        enabled: true,
        host: 'https://docs.open-form.dev',
      },
    }),
    viteReact(),
  ],
});

export default config;
