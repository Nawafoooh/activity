import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <div className="footer-logo">
            <div className="fl-icon">S</div>
            <div>
              <div className="fl-main">STEP Academy</div>
              <div className="fl-sub">منصة اختبار الكفاءة في اللغة الإنجليزية</div>
            </div>
          </div>
          <p>منصتك الشاملة للتحضير لاختبار الستيب STEP بأعلى مستوى من الجودة التعليمية.</p>
        </div>
        <div className="footer-links">
          <div className="fl-group">
            <h4>الأقسام</h4>
            <Link to="/sections/reading">Reading Comprehension</Link>
            <Link to="/sections/vocabulary">Vocabulary</Link>
            <Link to="/sections/grammar">Grammar</Link>
            <Link to="/sections/writing">Writing</Link>
          </div>
          <div className="fl-group">
            <h4>المنصة</h4>
            <Link to="/mock-exams">اختبارات محاكاة</Link>
            <Link to="/leaderboard">لوحة المتقدمين</Link>
            <Link to="/dashboard">لوحة التحكم</Link>
            <Link to="/register">إنشاء حساب</Link>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="container">
          <span>© 2025 STEP Academy. جميع الحقوق محفوظة.</span>
        </div>
      </div>
      <style>{`
        .footer { background: var(--navy); color: rgba(255,255,255,0.7); padding: 56px 0 0; margin-top: 80px; }
        .footer-inner {
          display: grid; grid-template-columns: 1.5fr 1fr; gap: 60px;
          padding-bottom: 48px; border-bottom: 1px solid rgba(255,255,255,0.1);
        }
        .footer-brand p { font-size: 14px; line-height: 1.7; max-width: 300px; margin-top: 16px; }
        .footer-logo { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
        .fl-icon {
          width: 36px; height: 36px;
          background: linear-gradient(135deg, var(--gold), var(--gold-light));
          border-radius: 8px; display: flex; align-items: center; justify-content: center;
          font-family: var(--font-display); font-size: 18px; font-weight: 700; color: var(--navy);
        }
        .fl-main { color: white; font-size: 16px; font-weight: 800; letter-spacing: 1px; }
        .fl-sub { color: var(--gold); font-size: 10px; margin-top: 1px; }
        .footer-links { display: flex; gap: 40px; }
        .fl-group { display: flex; flex-direction: column; gap: 10px; }
        .fl-group h4 { color: white; font-size: 14px; font-weight: 700; margin-bottom: 4px; }
        .fl-group a { color: rgba(255,255,255,0.55); font-size: 13px; text-decoration: none; transition: color 0.2s; }
        .fl-group a:hover { color: var(--gold-light); }
        .footer-bottom { padding: 16px 0; font-size: 13px; text-align: center; color: rgba(255,255,255,0.35); }
        @media (max-width: 768px) { .footer-inner { grid-template-columns: 1fr; gap: 32px; } }
      `}</style>
    </footer>
  );
}
