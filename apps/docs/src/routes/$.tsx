import { createFileRoute, notFound } from "@tanstack/react-router";
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import { createServerFn } from "@tanstack/react-start";
import { source } from "@/lib/source";
import browserCollections from "fumadocs-mdx:collections/browser";
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
} from "fumadocs-ui/layouts/docs/page";
import defaultMdxComponents from "fumadocs-ui/mdx";
import { baseOptions } from "@/lib/layout.shared";
import { useFumadocsLoader } from "fumadocs-core/source/client";

export const Route = createFileRoute("/$")({
  component: Page,
  loader: async ({ params }) => {
    const slugs = params._splat?.split("/") ?? [];
    const data = await serverLoader({ data: slugs });
    await clientLoader.preload(data.path);
    return data;
  },
});

const serverLoader = createServerFn({
  method: "GET",
})
  .inputValidator((slugs: string[]) => slugs)
  .handler(async ({ data: slugs }) => {
    const page = source.getPage(slugs);
    if (!page) throw notFound();

    return {
      path: page.path,
      pageTree: await source.serializePageTree(source.getPageTree()),
    };
  });

import { PageLastUpdate } from "fumadocs-ui/layouts/docs/page";

const clientLoader = browserCollections.docs.createClientLoader({
  component({ toc, frontmatter, default: MDX, lastModified }) {
    return (
      <DocsPage toc={toc}>
        <DocsTitle>{frontmatter.title}</DocsTitle>
        <DocsDescription>{frontmatter.description}</DocsDescription>
        {lastModified && <PageLastUpdate date={lastModified} />}
        <DocsBody>
          <MDX
            components={{
              ...defaultMdxComponents,
            }}
          />
        </DocsBody>
      </DocsPage>
    );
  },
});

function Page() {
  const data = Route.useLoaderData();
  const { pageTree } = useFumadocsLoader(data);
  const Content = clientLoader.getComponent(data.path);

  return (
    <DocsLayout {...baseOptions()} tree={pageTree}>
      <Content />
    </DocsLayout>
  );
}

// import { createFileRoute, notFound } from "@tanstack/react-router";
// import { DocsLayout } from "fumadocs-ui/layouts/docs";
// import { createServerFn } from "@tanstack/react-start";
// import { source } from "@/lib/source";
// import browserCollections from 'fumadocs-mdx:collections/browser';
// import { createClientLoader } from "fumadocs-mdx/runtime/vite";
// import {
//   DocsBody,
//   DocsDescription,
//   DocsPage,
//   DocsTitle,
//   PageLastUpdate,
// } from "fumadocs-ui/layouts/docs/page";
// import defaultMdxComponents from "fumadocs-ui/mdx";
// import { baseOptions } from "@/lib/layout.shared";
// import { useFumadocsLoader } from "fumadocs-core/source/client";
// import { LLMCopyButton, ViewOptions } from "@/components/page-actions";
// import { PageProvider, usePageContext } from "@/lib/page-context";

// export const Route = createFileRoute("/$")({
//   component: Page,
//   loader: async ({ params }) => {
//     const slugs = params._splat?.split("/") ?? [];
//     const data = await serverLoader({ data: slugs });
//     await clientLoader.preload(data.path);
//     return data;
//   },
//   notFoundComponent: () => {
//     // const data = Route.useLoaderData();
//     // const { pageTree } = useFumadocsLoader(data);

//     return (
//       <div>
//         <h1>This page doesn't exist!</h1>
//       </div>
//       // <DocsLayout {...baseOptions()} tree={pageTree}>
//       //   <PageProvider url={data.url} filePath={data.path}>
//       //     This page doesn't exist!
//       //   </PageProvider>
//       // </DocsLayout>
//     );
//   },
// });

// const serverLoader = createServerFn({
//   method: "GET",
// })
//   .inputValidator((slugs: string[]) => slugs)
//   .handler(async ({ data: slugs }) => {
//     const page = source.getPage(slugs);
//     if (!page) throw notFound();

//     return {
//       path: page.path,
//       url: page.url,
//       // filePath: page.file.path,
//       pageTree: await source.serializePageTree(source.getPageTree()),
//     };
//   });

// function PageActions() {
//   const { url, filePath } = usePageContext();
//   const markdownUrl = `${url}.mdx`;
//   const githubUrl = `https://github.com/nicholasgriffintn/open-form/blob/main/apps/docs/${filePath}`;

//   return (
//     <div className="flex flex-row gap-2 items-center border-b border-fd-border pb-4 mb-6">
//       <LLMCopyButton markdownUrl={markdownUrl} />
//       <ViewOptions markdownUrl={markdownUrl} githubUrl={githubUrl} />
//     </div>
//   );
// }

// const clientLoader = createClientLoader(browserDocs.doc, {
//   id: "docs",
//   component({ toc, frontmatter, default: MDX, lastModified }) {
//     return (
//       <DocsPage toc={toc}>
//         <DocsTitle>{frontmatter.title}</DocsTitle>
//         <DocsDescription>{frontmatter.description}</DocsDescription>
//         The date... {String(lastModified)}
//         {lastModified && <PageLastUpdate date={lastModified} />}
//         <PageActions />
//         <DocsBody>
//           <MDX
//             components={{
//               ...defaultMdxComponents,
//             }}
//           />
//         </DocsBody>
//       </DocsPage>
//     );
//   },
// });

// function Page() {
//   const data = Route.useLoaderData();
//   const { pageTree } = useFumadocsLoader(data);
//   const Content = clientLoader.getComponent(data.path);

//   return (
//     <DocsLayout {...baseOptions()} tree={pageTree}>
//       <PageProvider url={data.url} filePath={data.path}>
//         <Content />
//       </PageProvider>
//     </DocsLayout>
//   );
// }
