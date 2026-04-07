import React, { useState, useEffect } from 'react';
import { useAuth } from '../utils/AuthContext';
import { Navigate } from 'react-router-dom';
import {
  collection, addDoc, getDocs, deleteDoc, doc,
  serverTimestamp, query, orderBy
} from 'firebase/firestore';
import { db } from '../firebase';

const SECTIONS = ['reading', 'vocabulary', 'grammar', 'writing', 'listening', 'speaking'];
const LEVELS   = ['مبتدئ', 'متوسط', 'متقدم'];

export default function AdminPage() {
  const { user, isAdmin, loading } = useAuth();
  const [tab, setTab]         = useState('courses');
  const [courses, setCourses] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError]     = useState('');

  const [courseForm, setCourseForm] = useState({
    title:'', description:'', section:'reading', level:'متوسط',
    videoUrl:'', duration:'', order:0, content:'', isPublished:true
  });

  const [qForm, setQForm] = useState({
    text:'', section:'grammar', options:['','','',''],
    correct:0, explanation:'', difficulty:'medium'
  });

  useEffect(() => {
    if (isAdmin) { loadCourses(); loadQuestions(); }
  }, [isAdmin]);

  if (loading) return <div style={{padding:'120px',textAlign:'center'}}>⏳ جارٍ التحميل...</div>;
  if (!user || !isAdmin) return <Navigate to="/login" replace />;

  const loadCourses = async () => {
    try {
      const snap = await getDocs(query(collection(db,'courses'), orderBy('createdAt','desc')));
      setCourses(snap.docs.map(d => ({id:d.id,...d.data()})));
    } catch(e){}
  };

  const loadQuestions = async () => {
    try {
      const snap = await getDocs(query(collection(db,'questions'), orderBy('createdAt','desc')));
      setQuestions(snap.docs.map(d => ({id:d.id,...d.data()})));
    } catch(e){}
  };

  const saveCourse = async (e) => {
    e.preventDefault();
    setUploading(true); setError(''); setSuccess('');
    try {
      await addDoc(collection(db,'courses'), {
        ...courseForm,
        order: Number(courseForm.order),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lessonsCount: 0,
        enrolledCount: 0,
      });
      setSuccess('✅ تم إضافة الدرس بنجاح!');
      setCourseForm({title:'',description:'',section:'reading',level:'متوسط',videoUrl:'',duration:'',order:0,content:'',isPublished:true});
      loadCourses();
    } catch(e) { setError('❌ حدث خطأ: ' + e.message); }
    setUploading(false);
  };

  const saveQuestion = async (e) => {
    e.preventDefault();
    if (qForm.options.some(o => !o.trim())) { setError('❌ يرجى ملء جميع الخيارات'); return; }
    setUploading(true); setError(''); setSuccess('');
    try {
      await addDoc(collection(db,'questions'), {
        ...qForm,
        correct: Number(qForm.correct),
        createdAt: serverTimestamp(),
      });
      setSuccess('✅ تم إضافة السؤال بنجاح!');
      setQForm({text:'',section:'grammar',options:['','','',''],correct:0,explanation:'',difficulty:'medium'});
      loadQuestions();
    } catch(e) { setError('❌ حدث خطأ: ' + e.message); }
    setUploading(false);
  };

  const deleteCourse   = async (id) => { if(!confirm('هل أنت متأكد؟')) return; await deleteDoc(doc(db,'courses',id));   loadCourses();   };
  const deleteQuestion = async (id) => { if(!confirm('هل أنت متأكد؟')) return; await deleteDoc(doc(db,'questions',id)); loadQuestions(); };

  const TABS = [
    {id:'courses',          label:'📚 رفع درس'},
    {id:'questions',        label:'❓ رفع سؤال'},
    {id:'list-courses',     label:'📋 الدروس',   count:courses.length},
    {id:'list-questions',   label:'📋 الأسئلة',  count:questions.length},
  ];

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div className="container">
          <h1>⚙️ لوحة المعلم</h1>
          <p>إدارة المحتوى التعليمي واختبارات الستيب</p>
        </div>
      </div>

      <div className="container admin-stats">
        <div className="as-card"><span className="as-num">{courses.length}</span><span>درس منشور</span></div>
        <div className="as-card"><span className="as-num">{questions.length}</span><span>سؤال في البنك</span></div>
        <div className="as-card"><span className="as-num">{SECTIONS.length}</span><span>قسم مفعّل</span></div>
      </div>

      <div className="admin-tabs">
        <div className="container" style={{display:'flex',gap:'8px',flexWrap:'wrap'}}>
          {TABS.map(t => (
            <button key={t.id} className={`admin-tab ${tab===t.id?'active':''}`} onClick={() => setTab(t.id)}>
              {t.label} {t.count !== undefined && <span className="tab-count">{t.count}</span>}
            </button>
          ))}
        </div>
      </div>

      <div className="container admin-content">
        {(success||error) && (
          <div className={`alert ${success?'alert-success':'alert-error'}`}>{success||error}</div>
        )}

        {/* ── رفع درس ── */}
        {tab==='courses' && (
          <form onSubmit={saveCourse} className="admin-form">
            <h2>إضافة درس جديد</h2>
            <div className="form-grid-2">
              <div className="form-group">
                <label>عنوان الدرس *</label>
                <input type="text" value={courseForm.title} onChange={e=>setCourseForm(p=>({...p,title:e.target.value}))} required placeholder="مثال: فهم المقروء - المستوى الأول" />
              </div>
              <div className="form-group">
                <label>القسم *</label>
                <select value={courseForm.section} onChange={e=>setCourseForm(p=>({...p,section:e.target.value}))}>
                  {SECTIONS.map(s=><option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>المستوى</label>
                <select value={courseForm.level} onChange={e=>setCourseForm(p=>({...p,level:e.target.value}))}>
                  {LEVELS.map(l=><option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>رابط الفيديو (YouTube)</label>
                <input type="url" value={courseForm.videoUrl} onChange={e=>setCourseForm(p=>({...p,videoUrl:e.target.value}))} placeholder="https://youtube.com/watch?v=..." />
              </div>
              <div className="form-group">
                <label>المدة الزمنية</label>
                <input type="text" value={courseForm.duration} onChange={e=>setCourseForm(p=>({...p,duration:e.target.value}))} placeholder="مثال: 45 دقيقة" />
              </div>
              <div className="form-group">
                <label>الترتيب</label>
                <input type="number" value={courseForm.order} onChange={e=>setCourseForm(p=>({...p,order:e.target.value}))} min="0" />
              </div>
            </div>
            <div className="form-group">
              <label>وصف الدرس *</label>
              <textarea value={courseForm.description} onChange={e=>setCourseForm(p=>({...p,description:e.target.value}))} required rows={3} placeholder="وصف مختصر للدرس..." />
            </div>
            <div className="form-group">
              <label>محتوى الدرس (شرح + أمثلة)</label>
              <textarea value={courseForm.content} onChange={e=>setCourseForm(p=>({...p,content:e.target.value}))} rows={10} placeholder="اكتب هنا شرح الدرس، القواعد، الأمثلة... يمكنك استخدام HTML بسيط مثل <h3> و <p> و <ul>" />
            </div>
            <div className="form-group checkbox-group">
              <label>
                <input type="checkbox" checked={courseForm.isPublished} onChange={e=>setCourseForm(p=>({...p,isPublished:e.target.checked}))} />
                نشر الدرس فوراً
              </label>
            </div>
            <button type="submit" className="btn-primary submit-btn" disabled={uploading}>
              {uploading ? '⏳ جارٍ الحفظ...' : '✅ حفظ الدرس'}
            </button>
          </form>
        )}

        {/* ── رفع سؤال ── */}
        {tab==='questions' && (
          <form onSubmit={saveQuestion} className="admin-form">
            <h2>إضافة سؤال للبنك</h2>
            <div className="form-grid-2">
              <div className="form-group">
                <label>القسم *</label>
                <select value={qForm.section} onChange={e=>setQForm(p=>({...p,section:e.target.value}))}>
                  {SECTIONS.map(s=><option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>مستوى الصعوبة</label>
                <select value={qForm.difficulty} onChange={e=>setQForm(p=>({...p,difficulty:e.target.value}))}>
                  <option value="easy">سهل</option>
                  <option value="medium">متوسط</option>
                  <option value="hard">صعب</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>نص السؤال *</label>
              <textarea value={qForm.text} onChange={e=>setQForm(p=>({...p,text:e.target.value}))} required rows={3} placeholder="اكتب السؤال هنا بالإنجليزية..." />
            </div>
            <div className="options-form">
              <label>الخيارات * — حدد الإجابة الصحيحة بالنقر على الدائرة</label>
              {qForm.options.map((opt,i) => (
                <div key={i} className="option-input">
                  <input type="radio" name="correct" checked={qForm.correct===i} onChange={()=>setQForm(p=>({...p,correct:i}))} />
                  <span className="opt-label">{String.fromCharCode(65+i)}</span>
                  <input
                    type="text" value={opt}
                    onChange={e=>{ const opts=[...qForm.options]; opts[i]=e.target.value; setQForm(p=>({...p,options:opts})); }}
                    placeholder={`الخيار ${String.fromCharCode(65+i)}`} required
                  />
                </div>
              ))}
            </div>
            <div className="form-group">
              <label>شرح الإجابة</label>
              <textarea value={qForm.explanation} onChange={e=>setQForm(p=>({...p,explanation:e.target.value}))} rows={2} placeholder="لماذا هذه الإجابة صحيحة؟" />
            </div>
            <button type="submit" className="btn-primary submit-btn" disabled={uploading}>
              {uploading ? '⏳ جارٍ الحفظ...' : '✅ حفظ السؤال'}
            </button>
          </form>
        )}

        {/* ── قائمة الدروس ── */}
        {tab==='list-courses' && (
          <div className="list-section">
            <h2>الدروس المنشورة ({courses.length})</h2>
            {courses.length===0 ? <div className="empty-state">لا يوجد دروس بعد</div> : (
              <div className="items-list">
                {courses.map(c=>(
                  <div key={c.id} className="list-item">
                    <div className="li-info">
                      <div style={{display:'flex',gap:'6px',marginBottom:'6px'}}>
                        <span className="badge badge-navy">{c.section}</span>
                        <span className="badge badge-teal">{c.level}</span>
                        {c.isPublished && <span className="badge badge-gold">منشور</span>}
                      </div>
                      <div className="li-title">{c.title}</div>
                      <div className="li-desc">{c.description}</div>
                      {c.videoUrl && <div style={{fontSize:'12px',color:'var(--teal)',marginTop:'4px'}}>🎬 يحتوي على فيديو</div>}
                    </div>
                    <button className="delete-btn" onClick={()=>deleteCourse(c.id)}>🗑️</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── قائمة الأسئلة ── */}
        {tab==='list-questions' && (
          <div className="list-section">
            <h2>بنك الأسئلة ({questions.length})</h2>
            {questions.length===0 ? <div className="empty-state">لا يوجد أسئلة بعد</div> : (
              <div className="items-list">
                {questions.map(q=>(
                  <div key={q.id} className="list-item">
                    <div className="li-info">
                      <div style={{display:'flex',gap:'6px',marginBottom:'6px'}}>
                        <span className="badge badge-navy">{q.section}</span>
                        <span className={`badge ${q.difficulty==='hard'?'badge-crimson':q.difficulty==='easy'?'badge-teal':'badge-gold'}`}>
                          {q.difficulty==='hard'?'صعب':q.difficulty==='easy'?'سهل':'متوسط'}
                        </span>
                      </div>
                      <div className="li-title">{q.text}</div>
                      <div className="li-opts">
                        {q.options?.map((o,i)=>(
                          <span key={i} className={i===q.correct?'opt-correct':'opt-normal'}>
                            {String.fromCharCode(65+i)}: {o}
                          </span>
                        ))}
                      </div>
                    </div>
                    <button className="delete-btn" onClick={()=>deleteQuestion(q.id)}>🗑️</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        .admin-page { padding-top:64px;min-height:100vh;background:var(--gray-50); }
        .admin-header { background:linear-gradient(135deg,var(--navy),#0d2040);padding:48px 0;color:white;text-align:center; }
        .admin-header h1 { font-size:28px;font-weight:900;margin-bottom:6px; }
        .admin-header p { color:rgba(255,255,255,0.6); }
        .admin-stats { display:flex;gap:16px;margin:24px auto;flex-wrap:wrap; }
        .as-card { background:white;border-radius:var(--radius);padding:20px 28px;display:flex;flex-direction:column;align-items:center;gap:4px;flex:1;text-align:center;box-shadow:var(--shadow-sm); }
        .as-num { font-size:32px;font-weight:900;color:var(--navy); }
        .as-card>span:last-child { font-size:13px;color:var(--gray-600); }
        .admin-tabs { background:white;border-bottom:1px solid var(--gray-200);padding:12px 0;position:sticky;top:64px;z-index:100; }
        .admin-tab { padding:8px 18px;border-radius:100px;font-size:14px;font-weight:600;color:var(--gray-600);background:var(--gray-100);font-family:var(--font-arabic);display:inline-flex;align-items:center;gap:8px;transition:var(--transition); }
        .admin-tab:hover { background:var(--gray-200); }
        .admin-tab.active { background:var(--navy);color:white; }
        .tab-count { background:rgba(255,255,255,0.2);padding:1px 7px;border-radius:100px;font-size:11px; }
        .admin-tab:not(.active) .tab-count { background:var(--gray-200);color:var(--gray-600); }
        .admin-content { padding:32px 0 60px; }
        .alert { padding:14px 18px;border-radius:var(--radius-sm);margin-bottom:20px;font-weight:600; }
        .alert-success { background:#f0faf9;border:1px solid #1a9e8f40;color:#0d5c52; }
        .alert-error   { background:#fdf0f0;border:1px solid #b0303040;color:#6b1a1a; }
        .admin-form { background:white;border-radius:var(--radius-lg);padding:36px;box-shadow:var(--shadow-sm);max-width:800px; }
        .admin-form h2 { font-size:22px;font-weight:800;color:var(--navy);margin-bottom:24px; }
        .form-grid-2 { display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px; }
        .form-group { display:flex;flex-direction:column;gap:6px;margin-bottom:16px; }
        .form-group label { font-size:14px;font-weight:600;color:var(--navy); }
        .form-group input, .form-group select, .form-group textarea {
          padding:10px 14px;border:1.5px solid var(--gray-200);border-radius:var(--radius-sm);
          font-size:14px;font-family:var(--font-arabic);color:var(--navy);
          background:var(--gray-50);transition:border 0.2s;direction:rtl;
        }
        .form-group input:focus, .form-group select:focus, .form-group textarea:focus { outline:none;border-color:var(--navy);background:white; }
        .checkbox-group { flex-direction:row;align-items:center; }
        .checkbox-group label { display:flex;align-items:center;gap:8px;cursor:pointer;font-weight:500; }
        .options-form { margin-bottom:16px; }
        .options-form>label { font-size:14px;font-weight:600;color:var(--navy);display:block;margin-bottom:10px; }
        .option-input { display:flex;align-items:center;gap:10px;margin-bottom:10px; }
        .option-input input[type="radio"] { width:18px;height:18px;accent-color:var(--teal);flex-shrink:0; }
        .option-input input[type="text"] { flex:1;padding:10px 14px;border:1.5px solid var(--gray-200);border-radius:var(--radius-sm);font-size:14px;font-family:var(--font-arabic);direction:rtl; }
        .option-input input[type="text"]:focus { outline:none;border-color:var(--teal); }
        .opt-label { width:28px;height:28px;background:var(--gray-200);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;color:var(--navy);flex-shrink:0; }
        .submit-btn { width:100%;justify-content:center;padding:14px;font-size:15px; }
        .submit-btn:disabled { opacity:0.6;cursor:not-allowed;transform:none!important; }
        .list-section { background:white;border-radius:var(--radius-lg);padding:32px;box-shadow:var(--shadow-sm); }
        .list-section h2 { font-size:20px;font-weight:800;color:var(--navy);margin-bottom:20px; }
        .empty-state { text-align:center;padding:40px;color:var(--gray-400); }
        .items-list { display:flex;flex-direction:column;gap:12px; }
        .list-item { display:flex;align-items:flex-start;gap:12px;padding:16px;background:var(--gray-50);border-radius:var(--radius);border:1px solid var(--gray-200); }
        .li-info { flex:1; }
        .li-title { font-weight:700;color:var(--navy);font-size:15px;margin-bottom:4px; }
        .li-desc { font-size:13px;color:var(--gray-600); }
        .li-opts { display:flex;flex-direction:column;gap:4px;margin-top:6px; }
        .opt-correct { font-size:12px;color:var(--teal);font-weight:700; }
        .opt-normal  { font-size:12px;color:var(--gray-600); }
        .delete-btn { background:#fdf0f0;border:1px solid #b0303030;color:var(--crimson);padding:8px 12px;border-radius:var(--radius-sm);font-size:16px;cursor:pointer;transition:var(--transition);flex-shrink:0; }
        .delete-btn:hover { background:var(--crimson);color:white; }
        @media(max-width:768px){ .form-grid-2{grid-template-columns:1fr;} .admin-form{padding:20px;} }
      `}</style>
    </div>
  );
}
