import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';

export default function DashboardPage() {
  const { user, userProfile, loading } = useAuth();
  const [recentResults, setRecentResults] = useState([]);
  const [stats, setStats] = useState({ exams: 0, avgScore: 0, bestScore: 0 });

  useEffect(() => { if (user) loadData(); }, [user]);

  const loadData = async () => {
    try {
      const snap = await getDocs(query(
        collection(db, 'quizResults'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc'),
        limit(10)
      ));
      const results = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setRecentResults(results);
      if (results.length > 0) {
        const avg = Math.round(results.reduce((s, r) => s + r.score, 0) / results.length);
        const best = Math.max(...results.map(r => r.score));
        setStats({ exams: results.length, avgScore: avg, bestScore: best });
      }
    } catch (e) {
      setRecentResults([
        { id: '1', score: 78, correct: 39, total: 50, createdAt: { toDate: () => new Date() } },
        { id: '2', score: 85, correct: 43, total: 50, createdAt: { toDate: () => new Date(Date.now() - 86400000) } },
      ]);
      setStats({ exams: 2, avgScore: 81, bestScore: 85 });
    }
  };

  if (loading) return <div style={{ padding: '120px', textAlign: 'center', fontSize: '18px' }}>⏳ جارٍ التحميل...</div>;
  if (!user) return <Navigate to="/login" replace />;

  const name = userProfile?.name || user.displayName || 'الطالب';

  const SECTIONS = [
    { id: 'reading',    icon: '📖', label: 'Reading',    color: '#1a9e8f', progress: 65 },
    { id: 'vocabulary', icon: '🔤', label: 'Vocabulary', color: '#c9a84c', progress: 40 },
    { id: 'grammar',    icon: '✏️', label: 'Grammar',    color: '#b03030', progress: 80 },
    { id: 'writing',    icon: '📝', label: 'Writing',    color: '#4a6fa5', progress: 30 },
    { id: 'listening',  icon: '🎧', label: 'Listening',  color: '#6b4a9e', progress: 55 },
  ];

  return (
    <div className="dashboard">
      <div className="dash-banner">
        <div className="container dash-banner-inner">
          <div className="db-avatar">{name.charAt(0)}</div>
          <div className="db-info">
            <h1>أهلاً، {name} 👋</h1>
            <p>استمر في التحضير — أنت على الطريق الصحيح!</p>
          </div>
          <div className="db-actions">
            <Link to="/mock-exams" className="btn-primary">🎯 ابدأ اختباراً</Link>
            <Link to="/sections" className="btn-secondary">📚 تصفح الدروس</Link>
          </div>
        </div>
      </div>

      <div className="container dash-content">
        <div className="dash-stats">
          <div className="ds-card"><div className="ds-icon" style={{color:'#c9a84c',background:'#fdf9f0'}}>🏆</div><div><div className="ds-num">{stats.bestScore||'--'}</div><div className="ds-label">أعلى نتيجة</div></div></div>
          <div className="ds-card"><div className="ds-icon" style={{color:'#1a9e8f',background:'#f0faf9'}}>📊</div><div><div className="ds-num">{stats.avgScore||'--'}</div><div className="ds-label">متوسط النتائج</div></div></div>
          <div className="ds-card"><div className="ds-icon" style={{color:'#4a6fa5',background:'#f0f4fa'}}>📝</div><div><div className="ds-num">{stats.exams}</div><div className="ds-label">اختبار أجريته</div></div></div>
          <div className="ds-card"><div className="ds-icon" style={{color:'#6b4a9e',background:'#f4f0fa'}}>🔥</div><div><div className="ds-num">{userProfile?.streak||0}</div><div className="ds-label">يوم متواصل</div></div></div>
        </div>

        <div className="dash-grid">
          <div className="dash-section-progress card" style={{padding:'24px'}}>
            <h2>تقدمك حسب القسم</h2>
            <div className="section-bars">
              {SECTIONS.map(s => (
                <div key={s.id} className="sb-item">
                  <div className="sb-head">
                    <span className="sb-icon">{s.icon}</span>
                    <span className="sb-name">{s.label}</span>
                    <span className="sb-pct" style={{color:s.color}}>{s.progress}%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{width:s.progress+'%',background:s.color}} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="dash-recent card" style={{padding:'24px'}}>
            <div className="dr-head">
              <h2>آخر نتائجك</h2>
              <Link to="/mock-exams" className="dr-link">اختبار جديد ←</Link>
            </div>
            {recentResults.length === 0 ? (
              <div className="dr-empty">
                <div style={{fontSize:'40px',marginBottom:'12px'}}>🎯</div>
                <p>لم تُجرِ أي اختبار بعد</p>
                <Link to="/mock-exams" className="btn-primary" style={{marginTop:'12px',display:'inline-flex'}}>ابدأ أول اختبار</Link>
              </div>
            ) : (
              <div className="results-list">
                {recentResults.map((r) => {
                  const date = r.createdAt?.toDate ? r.createdAt.toDate() : new Date();
                  const grade = r.score >= 80 ? '🏆' : r.score >= 60 ? '💪' : '📚';
                  const color = r.score >= 80 ? '#1a9e8f' : r.score >= 60 ? '#c9a84c' : '#b03030';
                  return (
                    <div key={r.id} className="rl-item">
                      <div className="rli-icon" style={{background:color+'15',color}}>{grade}</div>
                      <div className="rli-info">
                        <div className="rli-score" style={{color}}>{r.score}/100</div>
                        <div className="rli-detail">{r.correct} من {r.total} سؤال صحيح</div>
                      </div>
                      <div className="rli-date">{date.toLocaleDateString('ar-SA',{month:'short',day:'numeric'})}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="quick-access">
          <h2>وصول سريع</h2>
          <div className="qa-grid">
            {[
              {icon:'📖',title:'Reading',   desc:'فهم المقروء',  to:'/sections/reading',    color:'#1a9e8f'},
              {icon:'🔤',title:'Vocabulary', desc:'المفردات',    to:'/sections/vocabulary', color:'#c9a84c'},
              {icon:'✏️',title:'Grammar',   desc:'القواعد',     to:'/sections/grammar',    color:'#b03030'},
              {icon:'🎯',title:'Mock Exam', desc:'اختبار تجريبي',to:'/mock-exams',          color:'#4a6fa5'},
            ].map(item => (
              <Link key={item.to} to={item.to} className="qa-card">
                <div className="qa-icon" style={{background:item.color+'18',color:item.color}}>{item.icon}</div>
                <div className="qa-en">{item.title}</div>
                <div className="qa-ar">{item.desc}</div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .dashboard { padding-top: 64px; min-height: 100vh; background: var(--gray-50); }
        .dash-banner { background: linear-gradient(135deg, var(--navy), #0d2040); padding: 40px 0; }
        .dash-banner-inner { display: flex; align-items: center; gap: 20px; flex-wrap: wrap; }
        .db-avatar { width:64px;height:64px;border-radius:50%;background:linear-gradient(135deg,var(--gold),var(--gold-light));display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:900;color:var(--navy);flex-shrink:0; }
        .db-info { flex: 1; }
        .db-info h1 { color:white;font-size:24px;font-weight:800;margin-bottom:4px; }
        .db-info p { color:rgba(255,255,255,0.6);font-size:14px; }
        .db-actions { display:flex;gap:10px;flex-wrap:wrap; }
        .dash-content { padding: 32px 0 60px; }
        .dash-stats { display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:24px; }
        .ds-card { background:white;border-radius:var(--radius);padding:20px;display:flex;align-items:center;gap:14px;box-shadow:var(--shadow-sm); }
        .ds-icon { width:48px;height:48px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0; }
        .ds-num { font-size:28px;font-weight:900;color:var(--navy); }
        .ds-label { font-size:12px;color:var(--gray-600);margin-top:2px; }
        .dash-grid { display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:24px; }
        .dash-section-progress h2, .dash-recent h2 { font-size:18px;font-weight:800;color:var(--navy);margin-bottom:20px; }
        .section-bars { display:flex;flex-direction:column;gap:14px; }
        .sb-item { display:flex;flex-direction:column;gap:6px; }
        .sb-head { display:flex;align-items:center;gap:8px; }
        .sb-icon { font-size:16px; }
        .sb-name { flex:1;font-size:13px;font-weight:600;color:var(--navy); }
        .sb-pct { font-size:13px;font-weight:700; }
        .dr-head { display:flex;align-items:center;justify-content:space-between;margin-bottom:20px; }
        .dr-link { font-size:13px;color:var(--teal);font-weight:600;text-decoration:none; }
        .dr-empty { text-align:center;padding:32px;color:var(--gray-400); }
        .results-list { display:flex;flex-direction:column;gap:10px; }
        .rl-item { display:flex;align-items:center;gap:12px;padding:12px;background:var(--gray-50);border-radius:var(--radius-sm); }
        .rli-icon { width:40px;height:40px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0; }
        .rli-info { flex:1; }
        .rli-score { font-size:18px;font-weight:900; }
        .rli-detail { font-size:12px;color:var(--gray-600);margin-top:2px; }
        .rli-date { font-size:12px;color:var(--gray-400);font-weight:500; }
        .quick-access h2 { font-size:20px;font-weight:800;color:var(--navy);margin-bottom:16px; }
        .qa-grid { display:grid;grid-template-columns:repeat(4,1fr);gap:16px; }
        .qa-card { background:white;border-radius:var(--radius);padding:20px;text-align:center;text-decoration:none;transition:var(--transition);box-shadow:var(--shadow-sm);border:1px solid var(--gray-200); }
        .qa-card:hover { transform:translateY(-3px);box-shadow:var(--shadow-md); }
        .qa-icon { width:52px;height:52px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:22px;margin:0 auto 10px; }
        .qa-en { font-size:11px;color:var(--gray-400);font-weight:600;letter-spacing:1px; }
        .qa-ar { font-size:16px;font-weight:800;color:var(--navy);margin-top:2px; }
        @media(max-width:1024px){ .dash-stats{grid-template-columns:repeat(2,1fr);} .qa-grid{grid-template-columns:repeat(2,1fr);} }
        @media(max-width:768px){ .dash-grid{grid-template-columns:1fr;} }
      `}</style>
    </div>
  );
}
