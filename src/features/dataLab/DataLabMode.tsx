import { useMemo, useState } from 'react';
import type { DailyCheckIn, DailyFactors, Profile } from '../../app/state/dataSpine';
import { createDataSpine } from '../../app/state/dataSpine';
import type { ConfidenceSnapshot } from '../../entities/confidence/confidenceEngine';
import { evaluateConfidence } from '../../entities/confidence/confidenceEngine';
import { CONTROL_PREVIEW, PROMPT_PACKS, getRegistrySnapshot, type RegistryDomain } from '../../entities/dataLab/fieldRegistry';

type DataLabModeProps = {
  dataSpine: ReturnType<typeof createDataSpine>;
  confidence: ConfidenceSnapshot;
  historyDates: string[];
  onApplySandbox: (payload: { profile: Profile; dailyCheckIn: DailyCheckIn; dailyFactors: DailyFactors }) => void;
};

const DOMAIN_GROUPS: { id: RegistryDomain; label: string }[] = [
  { id: 'finance', label: 'Финансы' },
  { id: 'body', label: 'Тело' },
  { id: 'work', label: 'Работа' },
  { id: 'goal', label: 'Цель' },
  { id: 'state', label: 'Состояние' },
  { id: 'factors', label: 'Факторы' },
  { id: 'confidence', label: 'Уверенность / Производные' },
  { id: 'later', label: 'Позже / Будущее' },
];

const formatValue = (value: unknown) => {
  if (typeof value === 'number') return Number.isInteger(value) ? value.toString() : value.toFixed(1);
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (value === null || value === undefined || value === '') return '—';
  return String(value);
};

export const DataLabMode = ({ dataSpine, confidence, historyDates, onApplySandbox }: DataLabModeProps) => {
  const [search, setSearch] = useState('');
  const [criticality, setCriticality] = useState<'all' | 'critical' | 'recommended' | 'later'>('all');
  const [domainFilter, setDomainFilter] = useState<'all' | RegistryDomain>('all');
  const [selectedField, setSelectedField] = useState('monthlyIncome');

  const [sandbox, setSandbox] = useState(dataSpine);
  const sandboxConfidence = useMemo(() => evaluateConfidence({ dataSpine: sandbox, historyDates }), [sandbox, historyDates]);

  const registry = useMemo(() => getRegistrySnapshot(sandbox, sandboxConfidence.historyDepthDays), [sandbox, sandboxConfidence.historyDepthDays]);

  const filtered = registry.filter((item) => {
    if (criticality !== 'all' && item.criticality !== criticality) return false;
    if (domainFilter !== 'all' && item.domain !== domainFilter) return false;
    if (!search.trim()) return true;
    const q = search.trim().toLowerCase();
    return item.id.toLowerCase().includes(q) || item.label.toLowerCase().includes(q);
  });

  const active = registry.find((item) => item.id === selectedField) ?? registry[0];

  const updateSandboxValue = (key: string, raw: string) => {
    setSandbox((current) => {
      const next = structuredClone(current);
      const profile = next.profile as Record<string, unknown>;
      const state = next.dailyCheckIn as Record<string, unknown>;
      const factors = next.dailyFactors as Record<string, unknown>;
      const candidate = raw === 'true' ? true : raw === 'false' ? false : Number.isNaN(Number(raw)) || raw.trim() === '' ? raw : Number(raw);
      if (key in profile) profile[key] = candidate;
      if (key in state) state[key] = candidate;
      if (key in factors) factors[key] = candidate;
      return createDataSpine(next.profile, next.dailyCheckIn, next.dailyFactors);
    });
  };

  const weakDomain = (Object.entries(sandboxConfidence.domainConfidence) as [string, number][]).sort((a, b) => a[1] - b[1])[0];

  return (
    <div className="data-lab-mode">
      <section className="data-lab-section">
        <p className="scene-mode-kicker">Только для разработки · Подстанция данных</p>
        <h2 className="scene-mode-title">Инженерная подстанция данных: реестр, зависимости, подсказки, уверенность модели и песочница.</h2>
        <div className="data-lab-summary-grid">
          <article><span>Всего полей</span><strong>{registry.length}</strong></article>
          <article><span>Критичные / Рекомендуемые / Позже</span><strong>{registry.filter((f) => f.criticality === 'critical').length} / {registry.filter((f) => f.criticality === 'recommended').length} / {registry.filter((f) => f.criticality === 'later').length}</strong></article>
          <article><span>Заполнено</span><strong>{registry.filter((f) => f.status === 'filled' || f.status === 'inferred').length}</strong></article>
          <article><span>Слабый домен</span><strong>{weakDomain?.[0]} ({weakDomain?.[1]}%)</strong></article>
          <article><span>Глобальная уверенность модели</span><strong>{sandboxConfidence.globalConfidence}%</strong></article>
          <article><span>Следующее открытие</span><strong>{sandboxConfidence.nextUnlock ? `${sandboxConfidence.nextUnlock.title} · ${sandboxConfidence.nextUnlock.daysLeft} дн.` : 'максимум уже открыт'}</strong></article>
        </div>
      </section>

      <section className="data-lab-section">
        <h3>Реестр полей и метрик</h3>
        <div className="data-lab-filters">
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Поиск по ключу или подписи" />
          <select value={criticality} onChange={(e) => setCriticality(e.target.value as typeof criticality)}>
            <option value="all">Все уровни критичности</option><option value="critical">Критичные</option><option value="recommended">Рекомендуемые</option><option value="later">Позже</option>
          </select>
          <select value={domainFilter} onChange={(e) => setDomainFilter(e.target.value as typeof domainFilter)}>
            <option value="all">Все домены</option>
            {DOMAIN_GROUPS.map((domain) => <option key={domain.id} value={domain.id}>{domain.label}</option>)}
          </select>
        </div>
        <div className="registry-grid">
          {DOMAIN_GROUPS.map((domain) => {
            const items = filtered.filter((item) => item.domain === domain.id);
            if (!items.length) return null;
            return (
              <article key={domain.id} className="registry-domain">
                <h4>{domain.label}</h4>
                {items.map((item) => (
                  <button key={item.id} className={`registry-row ${selectedField === item.id ? 'active' : ''}`} onClick={() => setSelectedField(item.id)}>
                    <span>{item.label}</span>
                    <small>{item.id} · {item.status} · {formatValue(item.value)}</small>
                  </button>
                ))}
              </article>
            );
          })}
        </div>
      </section>

      <section className="data-lab-section inspector-grid">
        <article>
          <h3>Инспектор</h3>
          <p><strong>{active.label}</strong> · {active.id}</p>
          <p>Тип: {active.inputType} / {active.controlType}</p>
          <p>Описание: {active.description}</p>
          <p>Зачем: {active.whyItMatters}</p>
          <p>Критичность: {active.criticality}</p>
          <p>По умолчанию: {active.defaultValue}</p>
          <p>Проверка: {active.validation}</p>
          <p>Формат: {active.formatter}</p>
          <p>Используется в: {active.usedIn.join(', ')}</p>
          <p>Влияет на метрики: {active.affectsMetrics.join(', ') || '—'}</p>
          <p>Влияет на уверенность: {active.affectsConfidence.join(', ') || '—'}</p>
          <p>Открытие: {active.affectsUnlock ? 'да' : 'нет'}</p>
          <p>Пакет подсказок: {active.promptPack.join(', ')}</p>
          <p>Текст микроподсказки: {active.suggestedPrompt}</p>
          <p>Зона интерфейса: {active.uiSurface}</p>
        </article>
        <article>
          <h3>Связи и влияние</h3>
          <ul>
            {active.affectsMetrics.map((metric) => <li key={metric}>{active.id} → {metric}</li>)}
            {active.affectsConfidence.map((domain) => <li key={domain}>{active.id} → уверенность домена {domain}</li>)}
            {active.promptPack.map((pack) => <li key={pack}>{active.id} → {pack}</li>)}
            {active.affectsUnlock ? <li>{active.id} → зависимость открытия</li> : null}
          </ul>
        </article>
      </section>

      <section className="data-lab-section inspector-grid">
        <article>
          <h3>Пакеты подсказок / адаптивный предпросмотр</h3>
          {PROMPT_PACKS.map((pack) => {
            const missing = pack.fields.filter((field) => !(registry.find((item) => item.id === field)?.status === 'filled' || registry.find((item) => item.id === field)?.status === 'inferred'));
            return (
              <div key={pack.id} className="pack-card">
                <p><strong>{pack.title}</strong> · {pack.priority}</p>
                <p>Нужно: {pack.required.join(', ')}</p>
                <p>Не хватает: {missing.join(', ') || 'нет'}</p>
                <p>Где показывается: {pack.surface}</p>
                <p>Сформированная подсказка: {missing.length ? `Добавь ${missing.slice(0, 2).join(' и ')}, чтобы усилить ${pack.title}.` : 'Пакет заполнен.'}</p>
              </div>
            );
          })}
        </article>
        <article>
          <h3>Предпросмотр контролов и состояний</h3>
          {CONTROL_PREVIEW.map((control) => (
            <div key={control.id} className="control-preview">
              <p>{control.label}</p>
              <div>{control.states.map((state) => <span key={state}>{state}</span>)}</div>
            </div>
          ))}
        </article>
      </section>

      <section className="data-lab-section inspector-grid">
        <article>
          <h3>Песочница / симуляция</h3>
          <p>Редактируй значения и смотри влияние мгновенно.</p>
          <div className="sandbox-list">
            {registry.filter((field) => field.source === 'manual' && field.criticality !== 'later').slice(0, 12).map((field) => (
              <label key={field.id}>{field.label}
                <input value={formatValue(field.value)} onChange={(e) => updateSandboxValue(field.id, e.target.value)} />
              </label>
            ))}
          </div>
          <button type="button" onClick={() => onApplySandbox({ profile: sandbox.profile, dailyCheckIn: sandbox.dailyCheckIn, dailyFactors: sandbox.dailyFactors })}>Применить песочницу в систему</button>
        </article>
        <article>
          <h3>Обзор уверенности и открытий</h3>
          <p>Глобальная уверенность модели: <strong>{sandboxConfidence.globalConfidence}%</strong></p>
          <p>Полнота: {sandboxConfidence.completenessScore}% · Актуальность: {sandboxConfidence.freshnessScore}% · Согласованность: {sandboxConfidence.consistencyScore}% · Глубина истории: {sandboxConfidence.historyDepthScore}%</p>
          <p>Домены: финансы {sandboxConfidence.domainConfidence.finance} · тело {sandboxConfidence.domainConfidence.body} · работа {sandboxConfidence.domainConfidence.work} · цель {sandboxConfidence.domainConfidence.goal}</p>
          <p>Пороги истории: 3 / 7 / 14 / 30 / 60 дней · факт: {sandboxConfidence.historyDepthDays} дней, серия {sandboxConfidence.streakDays}</p>
          <p>Не хватает для открытия: {sandboxConfidence.nextUnlock?.missingForUnlock.join(', ') || '—'}</p>
          <p>Не хватает критичных: {sandboxConfidence.missingCriticalFields.join(', ') || '—'}</p>
          <p>Не хватает рекомендуемых: {sandboxConfidence.missingRecommendedFields.join(', ') || '—'}</p>
        </article>
      </section>

      <section className="data-lab-section">
        <p className="settings-note">Доступ: добавьте <code>?devlab=1</code> в URL или нажмите <code>Ctrl+Shift+L</code> для внутреннего переключателя.</p>
        <p className="settings-note">Текущая рабочая UX-цепочка (Старт/панель/микроподсказки) не изменена.</p>
      </section>

      <section className="data-lab-section">
        <p>Текущая продукционная уверенность: {confidence.globalConfidence}% (справочно, только чтение).</p>
      </section>
    </div>
  );
};
