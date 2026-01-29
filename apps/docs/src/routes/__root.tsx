import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
} from "@tanstack/react-router";
import { RootProvider } from "fumadocs-ui/provider/tanstack";

import appCss from "../styles.css?url";

const meta = () => ({
  meta: [
    {
      charSet: "utf-8",
    },
    {
      name: "viewport",
      content: "width=device-width, initial-scale=1",
    },
    {
      title: "OpenForm Docs",
    },
  ],
  links: [
    {
      rel: "stylesheet",
      href: appCss,
    },
    {
      rel: "icon",
      href: "/favicon.ico",
    },
  ],
});

export const Route = createRootRoute({
  head: meta,
  component: RootDocument,
});

import { TanstackProvider } from 'fumadocs-core/framework/tanstack';

function RootDocument() {
  return (
    <html lang="en" suppressHydrationWarning>
      <HeadContent />
      <body className="flex flex-col min-h-screen">
        <TanstackProvider>
        <RootProvider>
          <Outlet />
        </RootProvider>
        </TanstackProvider>
        <Scripts />
      </body>
    </html>
  );
}
