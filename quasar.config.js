const { configure } = require("quasar/wrappers")

module.exports = configure(function (/* ctx */) {
  return {
    eslint: {
      fix: true,
      warnings: false,
      errors: true
    },
    boot: [
      "componentDefaults",
      "init"
    ],
    css: [
      "app.sass"
    ],
    extras: [
      "roboto-font",
      "material-icons",
      "fontawesome-v6"
    ],
    build: {
      target: {
        browser: ["es2022", "edge90", "firefox90", "chrome90", "safari15"],
        node: "node18"
      },
      extendViteConf(viteConf, { isClient, isServer }) {
        // import("vite-plugin-rewrite-all").then(el => {
        //   viteConf.plugins.push(el)
        // }) // fixes a bug with dots in the url during development
        // viteConf.logLevel = "warn"
        // viteConf.build = {
        //   target: "es2020"
        //   // minify: false
        //   // commonjsOptions: {
        //   //   include: []
        //   // }
        // }
        // // viteConf.define["process.env.NODE_DEBUG"] = "false"
        // // viteConf.define.global = "globalThis"

        // viteConf.optimizeDeps = { esbuildOptions: { target: "es2020" } }
      },
      vueRouterMode: "history",
      minify: true
    },
    devServer: {
      open: false
    },
    framework: {
      config: {
        ripple: false
      },
      plugins: [
        "Notify",
        "Dialog",
        "LoadingBar"
      ]
    },
    animations: [],
    ssr: {
      pwa: false,
      prodPort: 3000,
      middlewares: [
        "render" // keep this as last one
      ]
    },
    pwa: {
      workboxMode: "generateSW", // or 'injectManifest'
      injectPwaMetaTags: true,
      swFilename: "sw.js",
      manifestFilename: "manifest.json",
      useCredentialsForManifestTag: false
    }
  }
})
