import { source } from "@/lib/source";
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
} from "fumadocs-ui/page";
import { notFound } from "next/navigation";
import { getMDXComponents } from "@/mdx-components";
import type { Metadata } from "next";
import { createRelativeLink } from "fumadocs-ui/mdx";
import {
  generateArticleData,
  generateBreadcrumbData,
} from "@/lib/structured-data";

export default async function Page(props: PageProps<"/docs/[[...slug]]">) {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  const MDX = page.data.body;
  const baseUrl = "https://hivecms.online";
  const ogImage = "/og.png";
  const url = `${baseUrl}/docs/${params.slug?.join("/") || ""}`;

  // Generate breadcrumb data
  const breadcrumbItems = [
    { name: "Home", url: baseUrl },
    { name: "Documentation", url: `${baseUrl}/docs` },
  ];

  if (params.slug && params.slug.length > 0) {
    params.slug.forEach((slug, index) => {
      const slugPath = params.slug!.slice(0, index + 1).join("/");
      breadcrumbItems.push({
        name: slug.charAt(0).toUpperCase() + slug.slice(1),
        url: `${baseUrl}/docs/${slugPath}`,
      });
    });
  }

  const breadcrumbData = generateBreadcrumbData(breadcrumbItems);
  const articleData = generateArticleData({
    title: page.data.title,
    description: page.data.description || "",
    url: url,
    image: `${baseUrl}${ogImage}`,
  });

  return (
    <DocsPage toc={page.data.toc} full={page.data.full}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleData) }}
      />
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription>{page.data.description}</DocsDescription>
      <DocsBody>
        <MDX
          components={getMDXComponents({
            // this allows you to link to other pages with relative file paths
            a: createRelativeLink(source, page),
          })}
        />
      </DocsBody>
    </DocsPage>
  );
}

export async function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata(
  props: PageProps<"/docs/[[...slug]]">
): Promise<Metadata> {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  const baseUrl = "https://hivecms.online";
  const ogImage = "/og.png";
  const url = `${baseUrl}/docs/${params.slug?.join("/") || ""}`;

  return {
    title: page.data.title,
    description: page.data.description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: page.data.title,
      description: page.data.description,
      type: "article",
      url: url,
      siteName: "Hive",
      locale: "en_US",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: page.data.title,
          type: "image/png",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: page.data.title,
      description: page.data.description,
      images: [ogImage],
      creator: "@ni3rav",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}
