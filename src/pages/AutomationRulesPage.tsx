import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { STORAGE_KEYS } from '../constants';
import type { AutomationRule } from '../types/automation';
import { simulateDelay } from '../utils/async';

/* ─── HELPERS ─────────────────────────────────────── */

function loadRules(companyId: string): AutomationRule[] {
  try {
    const all: AutomationRule[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.AUTOMATION_RULES) || '[]');
    return all.filter(r => r.companyId === companyId);
  } catch {
    return [];
  }
}

function saveRules(rules: AutomationRule[]) {
  try {
    const all: AutomationRule[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.AUTOMATION_RULES) || '[]');
    const updated = all.filter(r => !rules.some(nr => nr.id === r.id)).concat(rules);
    localStorage.setItem(STORAGE_KEYS.AUTOMATION_RULES, JSON.stringify(updated));
  } catch {
    // Ignore storage errors in demo mode.
  }
}

function generateId(): string {
  return `aut-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/* ─── SUB COMPONENTS ──────────────────────────────── */

function RuleCard({ rule, onToggle, onDelete, onEdit }: {
  rule: AutomationRule;
  onToggle: (id: string, enabled: boolean) => void;
  onDelete: (id: string) => void;
  onEdit: (rule: AutomationRule) => void;
}) {
  const typeLabel: Record<string, string> = {
    auto_accept: '✅ Tự động chấp nhận',
    auto_reject: '❌ Tự động từ chối',
    auto_approve: '🎯 Tự động duyệt & thanh toán',
    auto_notify: '🔔 Tự động thông báo',
    auto_assign: '📋 Tự động gán công việc',
    auto_release: '💰 Tự động giải ngân',
  };

  return (
    <div className={`auth-rule-card${!rule.enabled ? ' disabled' : ''}`}>
      <div className="auth-rule-header">
        <div className="auth-rule-title">{rule.name}</div>
        <label className="switch">
          <input
            type="checkbox"
            checked={rule.enabled}
            onChange={(e) => onToggle(rule.id, e.target.checked)}
          />
          <span className="slider" />
        </label>
      </div>

      <div className="auth-rule-type">{typeLabel[rule.ruleType] || rule.ruleType}</div>

      <div className="auth-rule-conditions">
        <strong>Điều kiện:</strong>
        <ul>
          {rule.conditions.minRating && <li>⭐ Rating ≥ {rule.conditions.minRating}</li>}
          {rule.conditions.maxRating && <li>⭐ Rating ≤ {rule.conditions.maxRating}</li>}
          {rule.conditions.requiredSkills && rule.conditions.requiredSkills.length > 0 && (
            <li>🛠️ Skill: {rule.conditions.requiredSkills.join(', ')}</li>
          )}
          {rule.conditions.jobTitles && rule.conditions.jobTitles.length > 0 && (
            <li>📌 Công việc: {rule.conditions.jobTitles.join(', ')}</li>
          )}
        </ul>
      </div>

      <div className="auth-rule-meta">
        <span>Chạy {rule.runCount} lần</span>
        {rule.lastRun && <span>Lần cuối: {rule.lastRun}</span>}
      </div>

      <div className="auth-rule-actions">
        <button className="btn btn-ghost btn-sm" onClick={() => onEdit(rule)}>✏️ Sửa</button>
        <button className="btn btn-danger-ghost btn-sm" onClick={() => onDelete(rule.id)}>🗑️ Xóa</button>
      </div>
    </div>
  );
}

function RuleForm({ rule, onSave, onCancel }: {
  rule?: AutomationRule;
  onSave: (rule: AutomationRule) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(rule?.name || '');
  const [ruleType, setRuleType] = useState<AutomationRule['ruleType']>(rule?.ruleType || 'auto_accept');
  const [minRating, setMinRating] = useState(rule?.conditions.minRating || 4.5);
  const [maxRating, setMaxRating] = useState(rule?.conditions.maxRating || 0);
  const [message, setMessage] = useState(rule?.action.message || '');
  const [releaseThreshold, setReleaseThreshold] = useState(rule?.action.releaseThreshold || 90);
  const [enabled, setEnabled] = useState(rule?.enabled ?? true);

  const parseRuleType = (value: string): AutomationRule['ruleType'] => {
    const valid: AutomationRule['ruleType'][] = [
      'auto_accept',
      'auto_reject',
      'auto_approve',
      'auto_notify',
      'auto_assign',
      'auto_release',
    ];
    return valid.includes(value as AutomationRule['ruleType'])
      ? (value as AutomationRule['ruleType'])
      : 'auto_accept';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date().toISOString();
    onSave({
      ...(rule || {
        id: generateId(),
        companyId: '',
        enabled: true,
        runCount: 0,
        createdAt: now,
        updatedAt: now,
      }),
      name,
      ruleType,
      enabled,
      conditions: {
        minRating: ruleType === 'auto_accept' ? minRating : undefined,
        maxRating: ruleType === 'auto_reject' ? maxRating : undefined,
      },
      action: {
        type: ruleType,
        message: ruleType === 'auto_notify' ? message : undefined,
        releaseThreshold: ruleType === 'auto_release' ? releaseThreshold : undefined,
      },
      updatedAt: now,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="auth-rule-form">
      <h3>{rule ? 'Sửa quy tắc' : 'Tạo quy tắc tự động'}</h3>

      <div className="form-group">
        <label>Tên quy tắc</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="VD: Chấp nhận rating 4.5+"
          required
        />
      </div>

      <div className="form-group">
        <label>Loại quy tắc</label>
        <select value={ruleType} onChange={(e) => setRuleType(parseRuleType(e.target.value))} required>
          <option value="auto_accept">✅ Tự động chấp nhận (nếu rating cao)</option>
          <option value="auto_reject">❌ Tự động từ chối (nếu rating thấp)</option>
          <option value="auto_approve">🎯 Tự động duyệt & thanh toán (nếu chất lượng tốt)</option>
          <option value="auto_notify">🔔 Tự động thông báo (khi có ứng viên mới)</option>
          <option value="auto_assign">📋 Tự động gán công việc</option>
          <option value="auto_release">💰 Tự động giải ngân (nếu completion % cao)</option>
        </select>
      </div>

      {(ruleType === 'auto_accept' || ruleType === 'auto_reject') && (
        <>
          {ruleType === 'auto_accept' && (
            <div className="form-group">
              <label>Rating tối thiểu</label>
              <input
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={minRating}
                onChange={(e) => setMinRating(parseFloat(e.target.value) || 0)}
              />
              <small>Chấp nhận nếu rating ≥ {minRating}</small>
            </div>
          )}
          {ruleType === 'auto_reject' && (
            <div className="form-group">
              <label>Rating tối đa để từ chối</label>
              <input
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={maxRating}
                onChange={(e) => setMaxRating(parseFloat(e.target.value) || 0)}
              />
              <small>Từ chối nếu rating ≤ {maxRating}</small>
            </div>
          )}
        </>
      )}

      {ruleType === 'auto_notify' && (
        <div className="form-group">
          <label>Nội dung thông báo</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="VD: Cảm ơn bạn đã ứng tuyển. Chúng tôi sẽ liên hệ bạn sớm..."
            rows={3}
          />
        </div>
      )}

      {ruleType === 'auto_release' && (
        <div className="form-group">
          <label>% hoàn thành trước khi giải ngân</label>
          <input
            type="number"
            min="0"
            max="100"
            value={releaseThreshold}
            onChange={(e) => setReleaseThreshold(parseInt(e.target.value) || 0)}
          />
          <small>Tự động giải ngân nếu completion rate ≥ {releaseThreshold}%</small>
        </div>
      )}

      <div className="form-group">
        <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
          />
          Bật quy tắc này
        </label>
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary">Lưu</button>
        <button type="button" className="btn btn-ghost" onClick={onCancel}>Hủy</button>
      </div>
    </form>
  );
}

/* ─── MAIN PAGE ───────────────────────────────────── */

export default function AutomationRulesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingRule, setEditingRule] = useState<AutomationRule | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) navigate('/login');
    else if (user.role !== 'business') navigate('/dashboard');
  }, [user, navigate]);

  useEffect(() => {
    if (!user) return;
    simulateDelay(500).then(() => {
      setRules(loadRules(user.id));
      setIsLoading(false);
    });
  }, [user]);

  const activeRules = useMemo(() => rules.filter(r => r.enabled), [rules]);

  const handleToggle = useCallback((id: string, enabled: boolean) => {
    setRules(prev => {
      const updated = prev.map(r => r.id === id ? { ...r, enabled } : r);
      saveRules(updated);
      return updated;
    });
  }, []);

  const handleDelete = useCallback((id: string) => {
    if (window.confirm('Xoá quy tắc này?')) {
      setRules(prev => {
        const updated = prev.filter(r => r.id !== id);
        saveRules(updated);
        return updated;
      });
    }
  }, []);

  const handleSave = useCallback((rule: AutomationRule) => {
    if (!user) return;
    const newRule = {
      ...rule,
      companyId: user.id,
      updatedAt: new Date().toISOString(),
    };

    setRules(prev => {
      const existing = prev.find(r => r.id === rule.id);
      const updated = existing
        ? prev.map(r => r.id === rule.id ? newRule : r)
        : [newRule, ...prev];
      saveRules(updated);
      return updated;
    });

    setShowForm(false);
    setEditingRule(undefined);
  }, [user]);

  if (isLoading) return <div className="page-loading">Loading...</div>;

  return (
    <div className="page-automation-rules">
      <div className="page-header">
        <div>
          <h1>🤖 Tự động hóa quy trình</h1>
          <p>Setup automation để tự động chấp nhận, từ chối, duyệt & thanh toán một cách tự động</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {
            setEditingRule(undefined);
            setShowForm(!showForm);
          }}
        >
          {showForm ? '✕ Đóng' : '+ Tạo quy tắc'}
        </button>
      </div>

      {/* Stats */}
      <div className="auth-stats-grid">
        <div className="auth-stat-card">
          <div className="auth-stat-number">{rules.length}</div>
          <div className="auth-stat-label">Quy tắc tạo</div>
        </div>
        <div className="auth-stat-card">
          <div className="auth-stat-number">{activeRules.length}</div>
          <div className="auth-stat-label">Quy tắc hoạt động</div>
        </div>
        <div className="auth-stat-card">
          <div className="auth-stat-number">{rules.reduce((sum, r) => sum + r.runCount, 0)}</div>
          <div className="auth-stat-label">Lần chạy (tổng)</div>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="auth-form-container">
          <RuleForm
            rule={editingRule}
            onSave={handleSave}
            onCancel={() => {
              setShowForm(false);
              setEditingRule(undefined);
            }}
          />
        </div>
      )}

      {/* Rules List */}
      {rules.length === 0 ? (
        <div className="auth-empty-state">
          <div className="auth-empty-icon">🤖</div>
          <h3>Chưa có quy tắc tự động hóa</h3>
          <p>Tạo quy tắc đầu tiên để bắt đầu tự động hóa quy trình tuyển dụng</p>
        </div>
      ) : (
        <div className="auth-rules-grid">
          {rules.map(rule => (
            <RuleCard
              key={rule.id}
              rule={rule}
              onToggle={handleToggle}
              onDelete={handleDelete}
              onEdit={(r) => {
                setEditingRule(r);
                setShowForm(true);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
