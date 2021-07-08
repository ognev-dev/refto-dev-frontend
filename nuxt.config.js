export default {
  publicRuntimeConfig: {
    githubAuthAddr: process.env.REFTO_GITHUB_CLIENT_ID ? 'https://github.com/login/oauth/authorize?client_id=' + process.env.REFTO_GITHUB_CLIENT_ID  : 'github client ID not set!'
  },
  mode: 'spa',
  /*
  ** Headers of the page
  */
  head: {
    title: 'refto.dev',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: '' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      // { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;700&display=swap' }
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: true },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;700&family=Roboto+Slab:wght@400;700&family=Roboto:wght@400;700&display=swap" },
    ]
  },

  /*
  ** Customize the progress-bar color
  */
  loading: { color: '#0096ff' },
  /*
  ** Global CSS
  */
  css: [
    'ant-design-vue/dist/antd.css'
  ],
  /*
  ** Plugins to load before mounting the App
  */
  plugins: [
    '@/plugins/general',
    '@/plugins/console_welcome_message',
    '@/plugins/axios',
  ],
  /*
  ** Nuxt.js dev-modules
  */
  buildModules: [
    ['@nuxtjs/google-analytics', {
      id: process.env.GA_ID || ''
    }]
  ],

  /*
   ** Nuxt.js modules
   */
  modules: [
    // Doc: https://axios.nuxtjs.org/usage
    '@nuxtjs/axios'
  ],

  /*
 ** Axios module configuration
 ** See https://axios.nuxtjs.org/options
 */
  axios: {
    baseURL: process.env.REFTO_API_ADDR || 'http://localhost:8080/api'
  },

  router: {
    middleware: ['init_auth', 'auth'],
  },

  /*
  ** Build configuration
  */
  build: {
    publicPath: process.env.NUXT_PUBLIC_PATH || '/_nuxt/',
    /*
    ** You can extend webpack config here
    */
    extend (config, ctx) {
    }
   //  babel: {
   //    plugins: [
   //       ['import', { libraryName: "ant-design-vue" } ]
   //      ]
   // }
  },
}
