import { useState } from 'react';
import { studentSteps, businessSteps } from '../data/mockData';
import type { HowStep } from '../types';

function StepCard({ step }: { step: HowStep }) {
  return (
    <div className="how-step fade-up">
      <div className="step-num">{step.num}</div>
      <div className="step-icon">{step.icon}</div>
      <div className="step-title">{step.title}</div>
      <div className="step-desc">{step.desc}</div>
    </div>
  );
}

export default function HowItWorks() {
  const [mode, setMode] = useState<'student' | 'business'>('student');
  const steps = mode === 'student' ? studentSteps : businessSteps;

  return (
    <section className="how-section" id="how">
      <div className="container">
        <div className="section-header fade-up">
          <div className="section-eyebrow">Quy trình</div>
          <h2 className="section-title">Đơn giản — Minh bạch — An toàn</h2>
          <p className="section-sub">Chỉ 4 bước để bắt đầu kiếm thu nhập từ chuyên ngành của bạn</p>
        </div>
        <div className="how-tabs">
          <button
            className={`how-tab${mode === 'student' ? ' active' : ''}`}
            onClick={() => setMode('student')}
          >
            👨‍🎓 Dành cho Sinh viên
          </button>
          <button
            className={`how-tab${mode === 'business' ? ' active' : ''}`}
            onClick={() => setMode('business')}
          >
            🏢 Dành cho Doanh nghiệp
          </button>
        </div>
        <div className="how-steps">
          {steps.map((step) => (
            <StepCard key={step.num + mode} step={step} />
          ))}
        </div>
      </div>
    </section>
  );
}
