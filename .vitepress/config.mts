import { defineConfig } from 'vitepress'
import { withMermaid } from 'vitepress-plugin-mermaid'

export default withMermaid(
  defineConfig({
    base: '/adlvs-architecture/',
    title: 'ADLVS',
    description: 'Automated Data & Lead Verification System — Architecture Playbook',

    themeConfig: {
      nav: [
        { text: 'Home', link: '/' },
        { text: 'Overview', link: '/01_overview' },
        { text: 'Architecture', link: '/02_architecture' },
        { text: 'Developer Reference', link: '/04_developer_reference' },
      ],

      sidebar: [
        { text: '01 — Overview', link: '/01_overview' },
        { text: '02 — Architecture', link: '/02_architecture' },
        { text: '03 — Key Features', link: '/03_key_features' },
        { text: '04 — Developer Reference', link: '/04_developer_reference' },
        { text: '05 — Infrastructure', link: '/05_infrastructure' },
      ],

      outline: { level: [2, 3] },
      search: { provider: 'local' },
    },

    mermaid: {
      theme: 'default',
    },

  })
)
