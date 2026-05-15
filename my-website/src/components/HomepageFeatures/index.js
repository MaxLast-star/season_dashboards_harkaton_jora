import clsx from 'clsx';
import Heading from '@theme/Heading';
import Link from '@docusaurus/Link';
import styles from './styles.module.css';

const FeatureList = [
  {
    title: 'Требования',
    icon: '📋',
    description: 'Бизнес-требования, KPI и риски. Функциональные требования с Use Cases. Нефункциональные требования по категориям.',
    link: '/docs/requirements/business',
    linkLabel: 'Открыть раздел',
  },
  {
    title: 'Стейкхолдеры',
    icon: '👥',
    description: 'Классификация стейкхолдеров по матрице RACI. Вопросы для интервью с шефами, PM и командой svoe-rodnoe.ru.',
    link: '/docs/scenarios/stakeholders',
    linkLabel: 'Открыть раздел',
  },
  {
    title: 'Архитектура',
    icon: '🏗️',
    description: 'BPMN-процесс планирования меню, DMN-таблица сезонности. Выбор хранилищ данных. Асинхронные взаимодействия.',
    link: '/docs/architecture/bpmn-process',
    linkLabel: 'Открыть раздел',
  },
  {
    title: 'API Reference',
    icon: '⚡',
    description: 'Интерактивная документация REST API в формате Redoc. Эндпоинты, схемы запросов и ответов для всех 6 экранов.',
    link: '/api',
    linkLabel: 'Открыть раздел',
  },
  {
    title: 'База данных',
    icon: '🗄️',
    description: 'Концептуальная и физическая модели данных. ERD-диаграммы. Паттерны проектирования: M:N, история изменений.',
    link: '/docs/database/erd',
    linkLabel: 'Открыть раздел',
  },
  {
    title: 'Стратегия и стек',
    icon: '🚀',
    description: 'Технологический стек с обоснованием. Бизнес-ценность в числах. Value flywheel. Роадмап MVP → v2.0 → v3.0.',
    link: '/docs/scenarios/platform-strategy',
    linkLabel: 'Открыть раздел',
  },
];

function Feature({icon, title, description, link, linkLabel}) {
  return (
    <div className={clsx('col col--4')}>
      <div className={clsx('card', styles.featureCard)}>
        <div className="card__header">
          <div className={styles.featureIcon}>{icon}</div>
          <Heading as="h3">{title}</Heading>
        </div>
        <div className="card__body">
          <p>{description}</p>
        </div>
        <div className="card__footer">
          <Link className="button button--primary button--sm" to={link}>
            {linkLabel}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
