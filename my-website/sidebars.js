/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  mainSidebar: [
    'intro',
    {
      type: 'category',
      label: '📋 Требования',
      collapsed: false,
      items: [
        'requirements/business',
        'requirements/functional',
        'requirements/non-functional',
      ],
    },
    {
      type: 'category',
      label: '👥 Стейкхолдеры',
      items: [
        'scenarios/stakeholders',
      ],
    },
    {
      type: 'category',
      label: '⚙️ Архитектура',
      items: [
        'architecture/bpmn-process',
        'architecture/storage',
        'architecture/async',
      ],
    },
    {
      type: 'category',
      label: '🎨 Дизайн и API',
      items: [
        'design/ui-and-api',
      ],
    },
    {
      type: 'category',
      label: '🗄️ База данных',
      items: [
        'database/erd',
      ],
    },
    {
      type: 'category',
      label: '🚀 Стратегия',
      items: [
        'scenarios/platform-strategy',
      ],
    },
  ],
};

export default sidebars;
