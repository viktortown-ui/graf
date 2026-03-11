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
  { id: 'finance', label: 'Finance' },
  { id: 'body', label: 'Body' },
  { id: 'work', label: 'Work' },
  { id: 'goal', label: 'Goal' },
  { id: 'state', label: 'State' },
  { id: 'factors', label: 'Factors' },
  { id: 'confidence', label: 'Confidence / Derived' },
  { id: 'later', label: 'Later / Future' },
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
        <p className="scene-mode-kicker">Dev-only · Data Lab / Подстанция данных</p>
        <h2 className="scene-mode-title">Инженерная подстанция данных: registry, зависимости, prompts, confidence и sandbox.</h2>
        <div className="data-lab-summary-grid">
          <article><span>Всего полей</span><strong>{registry.length}</strong></article>
          <article><span>Critical / Recommended / Later</span><strong>{registry.filter((f) => f.criticality === 'critical').length} / {registry.filter((f) => f.criticality === 'recommended').length} / {registry.filter((f) => f.criticality === 'later').length}</strong></article>
          <article><span>Заполнено</span><strong>{registry.filter((f) => f.status === 'filled' || f.status === 'inferred').length}</strong></article>
          <article><span>Слабый домен</span><strong>{weakDomain?.[0]} ({weakDomain?.[1]}%)</strong></article>
          <article><span>Global confidence</span><strong>{sandboxConfidence.globalConfidence}%</strong></article>
          <article><span>Next unlock</span><strong>{sandboxConfidence.nextUnlock ? `${sandboxConfidence.nextUnlock.title} · ${sandboxConfidence.nextUnlock.daysLeft} дн.` : 'unlock max'}</strong></article>
        </div>
      </section>

      <section className="data-lab-section">
        <h3>Реестр полей и метрик</h3>
        <div className="data-lab-filters">
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Поиск по key/label" />
          <select value={criticality} onChange={(e) => setCriticality(e.target.value as typeof criticality)}>
            <option value="all">Все criticality</option><option value="critical">critical</option><option value="recommended">recommended</option><option value="later">later</option>
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
          <h3>Inspector</h3>
          <p><strong>{active.label}</strong> · {active.id}</p>
          <p>Тип: {active.inputType} / {active.controlType}</p>
          <p>Описание: {active.description}</p>
          <p>Зачем: {active.whyItMatters}</p>
          <p>Criticality: {active.criticality}</p>
          <p>Default: {active.defaultValue}</p>
          <p>Validation: {active.validation}</p>
          <p>Formatter: {active.formatter}</p>
          <p>Used in: {active.usedIn.join(', ')}</p>
          <p>Affects metrics: {active.affectsMetrics.join(', ') || '—'}</p>
          <p>Affects confidence: {active.affectsConfidence.join(', ') || '—'}</p>
          <p>Unlock: {active.affectsUnlock ? 'yes' : 'no'}</p>
          <p>Prompt pack: {active.promptPack.join(', ')}</p>
          <p>Micro-prompt copy: {active.suggestedPrompt}</p>
          <p>UI surface: {active.uiSurface}</p>
        </article>
        <article>
          <h3>Связи и влияние</h3>
          <ul>
            {active.affectsMetrics.map((metric) => <li key={metric}>{active.id} → {metric}</li>)}
            {active.affectsConfidence.map((domain) => <li key={domain}>{active.id} → {domain} confidence</li>)}
            {active.promptPack.map((pack) => <li key={pack}>{active.id} → {pack}</li>)}
            {active.affectsUnlock ? <li>{active.id} → unlock dependency</li> : null}
          </ul>
        </article>
      </section>

      <section className="data-lab-section inspector-grid">
        <article>
          <h3>Prompt packs / adaptive preview</h3>
          {PROMPT_PACKS.map((pack) => {
            const missing = pack.fields.filter((field) => !(registry.find((item) => item.id === field)?.status === 'filled' || registry.find((item) => item.id === field)?.status === 'inferred'));
            return (
              <div key={pack.id} className="pack-card">
                <p><strong>{pack.title}</strong> · {pack.priority}</p>
                <p>Required: {pack.required.join(', ')}</p>
                <p>Missing: {missing.join(', ') || 'none'}</p>
                <p>Surface: {pack.surface}</p>
                <p>Generated prompt: {missing.length ? `Добавь ${missing.slice(0, 2).join(' и ')}, чтобы усилить ${pack.title}.` : 'Pack complete.'}</p>
              </div>
            );
          })}
        </article>
        <article>
          <h3>Preview контролов и состояний</h3>
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
          <h3>Sandbox / simulation</h3>
          <p>Редактируй значения и смотри влияние мгновенно.</p>
          <div className="sandbox-list">
            {registry.filter((field) => field.source === 'manual' && field.criticality !== 'later').slice(0, 12).map((field) => (
              <label key={field.id}>{field.label}
                <input value={formatValue(field.value)} onChange={(e) => updateSandboxValue(field.id, e.target.value)} />
              </label>
            ))}
          </div>
          <button type="button" onClick={() => onApplySandbox({ profile: sandbox.profile, dailyCheckIn: sandbox.dailyCheckIn, dailyFactors: sandbox.dailyFactors })}>Применить sandbox в систему</button>
        </article>
        <article>
          <h3>Confidence / unlock overview</h3>
          <p>Global confidence: <strong>{sandboxConfidence.globalConfidence}%</strong></p>
          <p>Completeness: {sandboxConfidence.completenessScore}% · Freshness: {sandboxConfidence.freshnessScore}% · Consistency: {sandboxConfidence.consistencyScore}% · History depth: {sandboxConfidence.historyDepthScore}%</p>
          <p>Domains: finance {sandboxConfidence.domainConfidence.finance} · body {sandboxConfidence.domainConfidence.body} · work {sandboxConfidence.domainConfidence.work} · goal {sandboxConfidence.domainConfidence.goal}</p>
          <p>History thresholds: 3 / 7 / 14 / 30 / 60 дней · факт: {sandboxConfidence.historyDepthDays} дней, streak {sandboxConfidence.streakDays}</p>
          <p>Missing for unlock: {sandboxConfidence.nextUnlock?.missingForUnlock.join(', ') || '—'}</p>
          <p>Missing critical: {sandboxConfidence.missingCriticalFields.join(', ') || '—'}</p>
          <p>Missing recommended: {sandboxConfidence.missingRecommendedFields.join(', ') || '—'}</p>
        </article>
      </section>

      <section className="data-lab-section">
        <p className="settings-note">Access: добавь <code>?devlab=1</code> в URL или нажми <code>Ctrl+Shift+L</code> для internal toggle.</p>
        <p className="settings-note">Текущая продукционная UX-цепочка (Start/drawer/micro-prompts) не изменена.</p>
      </section>

      <section className="data-lab-section">
        <p>Production confidence now: {confidence.globalConfidence}% (reference, read-only).</p>
      </section>
    </div>
  );
};
