import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';

export function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(getArabicError(err.code));
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    setLoading(true); setError('');
    try {
      await loginWithGoogle();
      navigate('/dashboard');
    } catch (err) {
      setError('حدث خطأ في تسجيل الدخول بـ Google');
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">S</div>
          <span>STEP Academy</span>
        </div>
        <h1>مرحباً بعودتك</h1>
        <p>سجّل دخولك لمتابعة رحلتك التعليمية</p>
        {error && <div className="auth-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>البريد الإلكتروني</label>
            <input type="email" value={form.email} onChange={e => setForm(p => ({...p, email: e.target.value}))} required placeholder="example@email.com" />
          </div>
          <div className="form-group">
            <label>كلمة المرور</label>
            <input type="password" value={form.password} onChange={e => setForm(p => ({...p, password: e.target.value}))} required placeholder="••••••••" />
          </div>
          <button type="submit" className="btn-primary auth-submit" disabled={loading}>
            {loading ? '⏳ جارٍ الدخول...' : 'تسجيل الدخول ←'}
          </button>
        </form>
        <div className="auth-divider"><span>أو</span></div>
        <button className="google-btn" onClick={handleGoogle} disabled={loading}>
          <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.35-8.16 2.35-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
          المتابعة بـ Google
        </button>
        <p className="auth-switch">ليس لديك حساب؟ <Link to="/register">إنشاء حساب مجاني</Link></p>
      </div>
      <style>{authStyles}</style>
    </div>
  );
}

export function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) { setError('كلمتا المرور غير متطابقتين'); return; }
    if (form.password.length < 6) { setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل'); return; }
    setLoading(true); setError('');
    try {
      await register(form.name, form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(getArabicError(err.code));
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
      navigate('/dashboard');
    } catch (err) {
      setError('حدث خطأ في التسجيل بـ Google');
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">S</div>
          <span>STEP Academy</span>
        </div>
        <h1>إنشاء حساب جديد</h1>
        <p>ابدأ رحلتك لاجتياز اختبار الستيب بتفوق</p>
        {error && <div className="auth-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>الاسم الكامل</label>
            <input type="text" value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))} required placeholder="محمد أحمد" />
          </div>
          <div className="form-group">
            <label>البريد الإلكتروني</label>
            <input type="email" value={form.email} onChange={e => setForm(p => ({...p, email: e.target.value}))} required placeholder="example@email.com" />
          </div>
          <div className="form-group">
            <label>كلمة المرور</label>
            <input type="password" value={form.password} onChange={e => setForm(p => ({...p, password: e.target.value}))} required placeholder="6 أحرف على الأقل" />
          </div>
          <div className="form-group">
            <label>تأكيد كلمة المرور</label>
            <input type="password" value={form.confirm} onChange={e => setForm(p => ({...p, confirm: e.target.value}))} required placeholder="••••••••" />
          </div>
          <button type="submit" className="btn-primary auth-submit" disabled={loading}>
            {loading ? '⏳ جارٍ الإنشاء...' : 'إنشاء الحساب ←'}
          </button>
        </form>
        <div className="auth-divider"><span>أو</span></div>
        <button className="google-btn" onClick={handleGoogle} disabled={loading}>
          <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.35-8.16 2.35-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
          التسجيل بـ Google
        </button>
        <p className="auth-switch">لديك حساب بالفعل؟ <Link to="/login">تسجيل الدخول</Link></p>
      </div>
      <style>{authStyles}</style>
    </div>
  );
}

function getArabicError(code) {
  const errors = {
    'auth/user-not-found': 'البريد الإلكتروني غير مسجل',
    'auth/wrong-password': 'كلمة المرور غير صحيحة',
    'auth/email-already-in-use': 'البريد الإلكتروني مسجل مسبقاً',
    'auth/invalid-email': 'البريد الإلكتروني غير صحيح',
    'auth/weak-password': 'كلمة المرور ضعيفة جداً',
    'auth/too-many-requests': 'محاولات كثيرة — حاول لاحقاً',
    'auth/invalid-credential': 'البريد أو كلمة المرور غير صحيحة',
  };
  return errors[code] || 'حدث خطأ، يرجى المحاولة مجدداً';
}

const authStyles = `
  .auth-page {
    min-height: 100vh;
    background: linear-gradient(135deg, var(--navy) 0%, #0d2040 60%, #112244 100%);
    display: flex; align-items: center; justify-content: center;
    padding: 80px 16px 40px; position: relative;
  }
  .auth-page::before {
    content: ''; position: absolute; inset: 0;
    background-image: linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
    background-size: 40px 40px;
  }
  .auth-card {
    background: white; border-radius: var(--radius-lg); padding: 44px;
    width: 100%; max-width: 440px; box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    position: relative; animation: fadeUp 0.5s ease;
  }
  .auth-logo { display: flex; align-items: center; gap: 10px; margin-bottom: 24px; justify-content: center; }
  .auth-logo-icon {
    width: 36px; height: 36px;
    background: linear-gradient(135deg, var(--gold), var(--gold-light));
    border-radius: 8px; display: flex; align-items: center; justify-content: center;
    font-family: var(--font-display); font-size: 20px; font-weight: 700; color: var(--navy);
  }
  .auth-logo span { font-size: 18px; font-weight: 800; color: var(--navy); }
  .auth-card h1 { font-size: 24px; font-weight: 900; color: var(--navy); text-align: center; margin-bottom: 6px; }
  .auth-card > p { color: var(--gray-600); text-align: center; margin-bottom: 24px; font-size: 14px; }
  .auth-error {
    background: #fdf0f0; border: 1px solid #b0303040;
    color: #6b1a1a; padding: 12px 16px; border-radius: var(--radius-sm);
    font-size: 14px; margin-bottom: 16px; font-weight: 500;
  }
  .form-group { display: flex; flex-direction: column; gap: 6px; margin-bottom: 14px; }
  .form-group label { font-size: 13px; font-weight: 600; color: var(--navy); }
  .form-group input {
    padding: 11px 14px; border: 1.5px solid var(--gray-200); border-radius: var(--radius-sm);
    font-size: 14px; font-family: var(--font-arabic); color: var(--navy);
    background: var(--gray-50); transition: border 0.2s; direction: ltr; text-align: right;
  }
  .form-group input:focus { outline: none; border-color: var(--navy); background: white; }
  .auth-submit { width: 100%; justify-content: center; margin-top: 4px; padding: 13px; }
  .auth-submit:disabled { opacity: 0.6; cursor: not-allowed; transform: none !important; }
  .auth-divider { text-align: center; position: relative; margin: 20px 0; color: var(--gray-400); font-size: 13px; }
  .auth-divider::before, .auth-divider::after {
    content: ''; position: absolute; top: 50%; width: 42%; height: 1px; background: var(--gray-200);
  }
  .auth-divider::before { right: 0; }
  .auth-divider::after { left: 0; }
  .google-btn {
    width: 100%; padding: 11px; border-radius: var(--radius-sm);
    border: 1.5px solid var(--gray-200); background: white;
    display: flex; align-items: center; justify-content: center; gap: 10px;
    font-size: 14px; font-weight: 600; color: var(--gray-800);
    font-family: var(--font-arabic); cursor: pointer; transition: var(--transition);
  }
  .google-btn:hover { border-color: var(--navy); background: var(--gray-50); }
  .google-btn:disabled { opacity: 0.6; cursor: not-allowed; }
  .auth-switch { text-align: center; margin-top: 20px; font-size: 14px; color: var(--gray-600); }
  .auth-switch a { color: var(--teal); font-weight: 600; text-decoration: none; }
  .auth-switch a:hover { text-decoration: underline; }
`;
