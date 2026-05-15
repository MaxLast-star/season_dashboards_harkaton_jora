// @ts-check
import {themes as prismThemes} from 'prism-react-renderer';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Своё Шеф — Дашборд сезонности',
  tagline: 'Техническая документация · Кейс №2 · Хакатон РСХБ × НИЯУ МИФИ',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  url: 'https://MaxLast-star.github.io',
  baseUrl: '/season_dashboards_harkaton_jora/',
  organizationName: 'MaxLast-star',
  projectName: 'season_dashboards_harkaton_jora',
  deploymentBranch: 'gh-pages',

  onBrokenLinks: 'warn',
  trailingSlash: false,

  i18n: {
    defaultLocale: 'ru',
    locales: ['ru'],
  },

  markdown: {
    mermaid: true,
  },

  themes: ['@docusaurus/theme-mermaid'],

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.js',
          routeBasePath: 'docs',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      },
    ],
    [
      'redocusaurus',
      {
        specs: [
          {
            id: 'svoe-shef-api',
            spec: 'static/media/api.yaml',
            route: '/api',
          },
        ],
        theme: {
          primaryColor: '#3B6D11',
        },
      },
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      image: 'img/docusaurus-social-card.jpg',
      colorMode: {
        respectPrefersColorScheme: true,
      },
      mermaid: {
        theme: { light: 'neutral', dark: 'dark' },
      },
      navbar: {
        title: 'Своё Шеф',
        logo: {
          alt: 'Своё Шеф Logo',
          src: 'img/logo.svg',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'mainSidebar',
            position: 'left',
            label: 'Документация',
          },
          {
            to: '/api',
            label: 'API Reference',
            position: 'left',
          },
          {
            href: 'https://github.com/MaxLast-star/season_dashboards_harkaton_jora',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Документация',
            items: [
              { label: 'Обзор системы', to: '/docs/intro' },
              { label: 'Бизнес-требования', to: '/docs/requirements/business' },
              { label: 'UI и API', to: '/docs/design/ui-and-api' },
            ],
          },
          {
            title: 'Разработка',
            items: [
              { label: 'API Reference', to: '/api' },
              {
                label: 'GitHub',
                href: 'https://github.com/MaxLast-star/season_dashboards_harkaton_jora',
              },
            ],
          },
          {
            title: 'Хакатон',
            items: [
              { label: 'РСХБ × НИЯУ МИФИ · Кейс №2', href: '#' },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Команда «Пушистики». Built with Docusaurus.`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
        additionalLanguages: ['json', 'bash', 'yaml'],
      },
    }),
};

export default config;
