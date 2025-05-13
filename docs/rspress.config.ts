import { defineConfig } from "rspress/config";

export default defineConfig({
  root: "./",
  title: "ew-responsive-store",
  description: "Making Session Storage Data Reactive",
  outDir: "ew-responsive-store",
  base: "/ew-responsive-store/",
  icon: "/favicon.svg",
  logo: "/logo.svg",
  lang: "zh",
  themeConfig: {
    socialLinks: [
      {
        icon: "github",
        mode: "link",
        content: "https://github.com/eveningwater/ew-responsive-store",
      },
    ],
    locales: [
      {
        lang: "en",
        label: "English",
        editLink: {
          docRepoBaseUrl:
            "https://github.com/eveningwater/ew-responsive-store/tree/main/docs",
          text: "Edit this page on GitHub",
        },
      },
      {
        lang: "zh",
        label: "简体中文",
        editLink: {
          docRepoBaseUrl:
            "https://github.com/eveningwater/ew-responsive-store/tree/main/docs",
          text: "在 GitHub 上编辑此页",
        },
      },
    ],
    footer: {
      message:
        "Released under the MIT License.Copyright © 2023-present eveningwater",
    },
  },
  markdown: {
    checkDeadLinks: true,
    codeHighlighter: "prism",
    highlightLanguages: [
      ["js", "javascript"],
      ["ts", "typescript"],
      ["jsx", "tsx"],
      ["xml", "xml-doc"],
      ["md", "markdown"],
      ["mdx", "tsx"],
      ["vue", "vue"],
    ],
    showLineNumbers: true,
  },
  route: {
    cleanUrls: true,
  },
  locales: [
    {
      lang: "en",
      label: "English",
      title: "ew-responsive-store",
      description: "Making Session Storage Data Reactive",
    },
    {
      lang: "zh",
      label: "简体中文",
      title: "ew-responsive-store",
      description: "让会话存储数据响应式化",
    },
  ],
});
