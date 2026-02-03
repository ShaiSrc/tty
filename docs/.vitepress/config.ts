import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "@shaisrc/tty",
  description:
    "A minimalist, high-performance ASCII rendering library for game developers",
  base: "/",

  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: "/android-chrome-192x192.png",
    siteTitle: "@shaisrc/tty",

    nav: [
      { text: "Home", link: "/" },
      { text: "Guide", link: "/guide/quick-start" },
      { text: "API Reference", link: "/api/README" },
      { text: "Examples", link: "/examples/" },
      { text: "🎮 Live Demos", link: "/demos/index.html", target: "_blank" },
    ],

    sidebar: {
      "/guide/": [
        {
          text: "Introduction",
          items: [
            { text: "What is KISS ASCII?", link: "/guide/what-is-kiss-ascii" },
            { text: "Quick Start", link: "/guide/quick-start" },
            { text: "Core Concepts", link: "/guide/core-concepts" },
          ],
        },
        {
          text: "Features",
          items: [
            { text: "Renderer API", link: "/guide/renderer-api" },
            { text: "Drawing Primitives", link: "/guide/drawing-primitives" },
            { text: "Box Drawing", link: "/guide/box-drawing" },
            { text: "Text Alignment", link: "/guide/alignment" },
            { text: "Colors", link: "/guide/colors" },
          ],
        },
        {
          text: "Advanced",
          items: [
            { text: "Layer System", link: "/guide/layer-system" },
            { text: "Camera System", link: "/guide/camera-system" },
            { text: "Game Loop", link: "/guide/game-loop" },
            { text: "Keyboard Input", link: "/guide/keyboard-input" },
            { text: "Gamepad Input", link: "/guide/gamepad-input" },
            { text: "Pointer Input", link: "/guide/pointer-input" },
            { text: "Mouse Input", link: "/guide/mouse-input" },
          ],
        },
        {
          text: "Helpers",
          items: [
            { text: "Menus", link: "/guide/menu-helper" },
            { text: "Progress Bars", link: "/guide/progress-bar" },
            { text: "Panels", link: "/guide/panel-helper" },
          ],
        },
        {
          text: "Render Targets",
          items: [{ text: "Canvas Target", link: "/guide/canvas-target" }],
        },
      ],
      "/examples/": [
        {
          text: "Examples",
          items: [{ text: "Overview", link: "/examples/" }],
        },
      ],
    },

    socialLinks: [{ icon: "github", link: "https://github.com/shaisrc/tty" }],

    search: {
      provider: "local",
    },

    editLink: {
      pattern: "https://github.com/shaisrc/tty/edit/main/docs/:path",
      text: "Edit this page on GitHub",
    },

    footer: {
      message: "Released under the MIT License.",
      copyright: "Copyright © 2026-present ShaiDev",
    },
  },

  markdown: {
    theme: {
      light: "github-light",
      dark: "github-dark",
    },
    lineNumbers: true,
  },

  head: [
    // Favicons
    ["link", { rel: "icon", type: "image/x-icon", href: "/tty/favicon.ico" }],
    [
      "link",
      {
        rel: "icon",
        type: "image/png",
        sizes: "16x16",
        href: "/tty/favicon-16x16.png",
      },
    ],
    [
      "link",
      {
        rel: "icon",
        type: "image/png",
        sizes: "32x32",
        href: "/tty/favicon-32x32.png",
      },
    ],
    [
      "link",
      {
        rel: "apple-touch-icon",
        sizes: "180x180",
        href: "/tty/apple-touch-icon.png",
      },
    ],
    ["link", { rel: "manifest", href: "/site.webmanifest" }],

    // Meta tags
    ["meta", { name: "theme-color", content: "#a4e400" }],
    [
      "meta",
      {
        name: "keywords",
        content:
          "ascii, renderer, terminal, tty, game development, typescript, canvas, retro, gamepad, keyboard",
      },
    ],
    ["meta", { property: "og:type", content: "website" }],
    [
      "meta",
      { property: "og:title", content: "@shaisrc/tty - KISS ASCII Renderer" },
    ],
    [
      "meta",
      {
        property: "og:description",
        content:
          "A minimalist, high-performance ASCII rendering library for game developers",
      },
    ],
    ["meta", { property: "og:image", content: "/tty/logo.png" }],
  ],
});
