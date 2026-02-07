// ========== تكوين Firebase ==========
// تم تحديث التكوين من مشروعك Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBaY75jwos44EbgZMlhIcU_YfrGeKY7r3w",
    authDomain: "naj7-7da9d.firebaseapp.com",
    projectId: "naj7-7da9d",
    storageBucket: "naj7-7da9d.firebasestorage.app",
    messagingSenderId: "72751584563",
    appId: "1:72751584563:web:8562f042882919d2c4da46",
    measurementId: "G-308H9HW0FP"
};

// استيراد Firebase modules
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { 
    getFirestore, 
    doc, 
    setDoc, 
    getDoc, 
    collection, 
    getDocs,
    updateDoc,
    query,
    where,
    orderBy
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { 
    getStorage, 
    ref, 
    getDownloadURL 
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js';

// تهيئة Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// ========== متغيرات عامة ==========
let currentUser = null;
let currentSubject = null;
let currentLesson = null;
let userProgress = {};

// ========== إدارة الصفحات ==========
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(pageId).classList.add('active');
}

function hideLoading() {
    document.getElementById('loading-screen').classList.add('hidden');
}

// ========== التسجيل وتسجيل الدخول ==========
document.addEventListener('DOMContentLoaded', () => {
    
    // التبديل بين تسجيل الدخول والتسجيل
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
            
            btn.classList.add('active');
            document.getElementById(`${tab}-form`).classList.add('active');
        });
    });

    // تسجيل حساب جديد
    document.getElementById('register-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const grade = document.getElementById('register-grade').value;
        const errorElement = document.getElementById('register-error');
        
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            await updateProfile(userCredential.user, { displayName: name });
            
            // إنشاء ملف المستخدم في Firestore
            await setDoc(doc(db, 'users', userCredential.user.uid), {
                name: name,
                email: email,
                grade: grade,
                points: 0,
                level: 1,
                completedLessons: [],
                isPremium: false,
                createdAt: new Date()
            });
            
            errorElement.textContent = '';
        } catch (error) {
            errorElement.textContent = getErrorMessage(error.code);
        }
    });

    // تسجيل الدخول
    document.getElementById('login-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const errorElement = document.getElementById('login-error');
        
        try {
            await signInWithEmailAndPassword(auth, email, password);
            errorElement.textContent = '';
        } catch (error) {
            errorElement.textContent = getErrorMessage(error.code);
        }
    });

    // تسجيل الخروج
    document.getElementById('logout-btn').addEventListener('click', async () => {
        await signOut(auth);
    });

    // مراقبة حالة المستخدم
    onAuthStateChanged(auth, async (user) => {
        hideLoading();
        
        if (user) {
            currentUser = user;
            await loadUserData();
            showPage('home-page');
            loadSubjects();
        } else {
            currentUser = null;
            showPage('auth-page');
        }
    });

    // التنقل
    document.getElementById('back-to-home').addEventListener('click', () => {
        showPage('home-page');
    });

    document.getElementById('back-to-subject').addEventListener('click', () => {
        showPage('subject-page');
        loadLessons(currentSubject);
    });

    document.getElementById('back-from-progress').addEventListener('click', () => {
        showPage('home-page');
    });

    // نافذة الاشتراك
    document.getElementById('upgrade-btn').addEventListener('click', () => {
        document.getElementById('subscription-modal').classList.add('active');
    });

    document.querySelector('.close-modal').addEventListener('click', () => {
        document.getElementById('subscription-modal').classList.remove('active');
    });

    document.getElementById('subscribe-btn').addEventListener('click', async () => {
        // هنا يمكنك إضافة تكامل مع بوابة الدفع
        alert('سيتم إضافة تكامل الدفع قريباً');
        
        // للتجربة فقط - تفعيل الاشتراك
        if (currentUser) {
            await updateDoc(doc(db, 'users', currentUser.uid), {
                isPremium: true
            });
            await loadUserData();
            document.getElementById('subscription-modal').classList.remove('active');
        }
    });
});

// ========== تحميل بيانات المستخدم ==========
async function loadUserData() {
    const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
    
    if (userDoc.exists()) {
        userProgress = userDoc.data();
        
        // تحديث واجهة المستخدم
        document.getElementById('user-name').textContent = userProgress.name;
        document.getElementById('total-points').textContent = userProgress.points || 0;
        document.getElementById('user-level').textContent = userProgress.level || 1;
        document.getElementById('completed-lessons').textContent = userProgress.completedLessons?.length || 0;
        document.getElementById('streak-days').textContent = userProgress.streakDays || 0;
        
        // إخفاء لافتة الاشتراك إذا كان المستخدم مشترك
        if (userProgress.isPremium) {
            document.getElementById('subscription-banner').classList.add('hidden');
        }
    }
}

// ========== تحميل المواد الدراسية ==========
async function loadSubjects() {
    const subjectsGrid = document.getElementById('subjects-grid');
    subjectsGrid.innerHTML = '';
    
    // جلب المواد من Firestore
    const subjectsSnapshot = await getDocs(collection(db, 'subjects'));
    
    subjectsSnapshot.forEach((doc) => {
        const subject = doc.data();
        const subjectCard = createSubjectCard(doc.id, subject);
        subjectsGrid.appendChild(subjectCard);
    });
}

function createSubjectCard(subjectId, subject) {
    const card = document.createElement('div');
    card.className = 'subject-card';
    
    // قفل المادة إذا لم يكن مشترك ولم تكن مجانية
    if (!userProgress.isPremium && !subject.isFree) {
        card.classList.add('locked');
    }
    
    // حساب نسبة الإنجاز
    const completedCount = userProgress.completedLessons?.filter(l => 
        l.startsWith(subjectId)
    ).length || 0;
    const totalLessons = subject.lessonsCount || 0;
    const progress = totalLessons > 0 ? (completedCount / totalLessons * 100) : 0;
    
    card.innerHTML = `
        <div class="subject-icon">${subject.icon}</div>
        <div class="subject-info">
            <h3>${subject.name}</h3>
            <p>${subject.description}</p>
            <div class="subject-progress">
                <div class="progress-bar" style="width: ${progress}%"></div>
            </div>
            <div class="progress-text">${completedCount} من ${totalLessons} دروس</div>
        </div>
    `;
    
    card.addEventListener('click', () => {
        if (!userProgress.isPremium && !subject.isFree) {
            document.getElementById('subscription-modal').classList.add('active');
        } else {
            currentSubject = subjectId;
            document.getElementById('subject-title').textContent = subject.name;
            showPage('subject-page');
            loadLessons(subjectId);
        }
    });
    
    return card;
}

// ========== تحميل الدروس ==========
async function loadLessons(subjectId) {
    const lessonsGrid = document.getElementById('lessons-grid');
    lessonsGrid.innerHTML = '<div class="ai-loading"><div class="spinner-small"></div><p>جاري تحميل الدروس...</p></div>';
    
    // جلب الدروس من Firestore
    const lessonsQuery = query(
        collection(db, 'lessons'),
        where('subjectId', '==', subjectId),
        orderBy('order')
    );
    
    const lessonsSnapshot = await getDocs(lessonsQuery);
    lessonsGrid.innerHTML = '';
    
    lessonsSnapshot.forEach((doc) => {
        const lesson = doc.data();
        const lessonCard = createLessonCard(doc.id, lesson);
        lessonsGrid.appendChild(lessonCard);
    });
}

function createLessonCard(lessonId, lesson) {
    const card = document.createElement('div');
    card.className = 'lesson-card';
    
    const isCompleted = userProgress.completedLessons?.includes(lessonId);
    const isLocked = !userProgress.isPremium && !lesson.isFree;
    
    if (isLocked) {
        card.classList.add('locked');
    }
    
    let statusClass = 'locked';
    let statusText = '🔒 مقفل';
    
    if (!isLocked) {
        if (isCompleted) {
            statusClass = 'completed';
            statusText = '✅ مكتمل';
        } else {
            statusClass = 'in-progress';
            statusText = '▶️ ابدأ الدرس';
        }
    }
    
    card.innerHTML = `
        <div class="lesson-thumbnail">${lesson.icon || '📖'}</div>
        <div class="lesson-card-info">
            <h4>${lesson.title}</h4>
            <p>${lesson.description || ''}</p>
            <span class="lesson-status ${statusClass}">${statusText}</span>
        </div>
    `;
    
    if (!isLocked) {
        card.addEventListener('click', () => {
            currentLesson = lessonId;
            showPage('lesson-page');
            loadLesson(lessonId, lesson);
        });
    } else {
        card.addEventListener('click', () => {
            document.getElementById('subscription-modal').classList.add('active');
        });
    }
    
    return card;
}

// ========== تحميل محتوى الدرس ==========
async function loadLesson(lessonId, lessonData) {
    document.getElementById('lesson-title').textContent = lessonData.title;
    
    // تحميل الفيديو ديناميكياً من Firebase Storage
    const videoContainer = document.getElementById('video-container');
    const video = document.getElementById('lesson-video');
    
    if (lessonData.videoUrl) {
        try {
            const videoRef = ref(storage, lessonData.videoUrl);
            const videoUrl = await getDownloadURL(videoRef);
            video.src = videoUrl;
        } catch (error) {
            console.error('Error loading video:', error);
            videoContainer.innerHTML = '<p>عذراً، حدث خطأ في تحميل الفيديو</p>';
        }
    }
    
    // تحميل الصور ديناميكياً
    const imagesContainer = document.getElementById('lesson-images');
    imagesContainer.innerHTML = '';
    
    if (lessonData.images && lessonData.images.length > 0) {
        for (const imagePath of lessonData.images) {
            try {
                const imageRef = ref(storage, imagePath);
                const imageUrl = await getDownloadURL(imageRef);
                const img = document.createElement('img');
                img.src = imageUrl;
                img.alt = lessonData.title;
                imagesContainer.appendChild(img);
            } catch (error) {
                console.error('Error loading image:', error);
            }
        }
    }
    
    // توليد الملخص بواسطة AI
    generateAISummary(lessonData);
    
    // توليد التمارين بواسطة AI
    generateAIExercises(lessonData);
}

// ========== توليد الملخص بالذكاء الاصطناعي ==========
async function generateAISummary(lessonData) {
    const summaryContainer = document.getElementById('lesson-summary');
    
    try {
        // استدعاء Anthropic API
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-sonnet-4-20250514',
                max_tokens: 1000,
                messages: [{
                    role: 'user',
                    content: `أنت معلم متخصص للمرحلة المتوسطة. قم بإنشاء ملخص تعليمي مبسط ومفيد للدرس التالي:
                    
العنوان: ${lessonData.title}
الوصف: ${lessonData.description || ''}
المحتوى: ${lessonData.content || ''}

قدم الملخص بأسلوب واضح ومشوق للطلاب، مع استخدام أمثلة عملية وشرح المفاهيم الأساسية.`
                }]
            })
        });
        
        const data = await response.json();
        const summary = data.content[0].text;
        
        summaryContainer.innerHTML = `<p>${summary}</p>`;
        
    } catch (error) {
        console.error('Error generating summary:', error);
        summaryContainer.innerHTML = `
            <p>${lessonData.content || 'محتوى الدرس غير متوفر حالياً'}</p>
        `;
    }
}

// ========== توليد التمارين بالذكاء الاصطناعي ==========
async function generateAIExercises(lessonData) {
    const exercisesContainer = document.getElementById('exercises-container');
    
    try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-sonnet-4-20250514',
                max_tokens: 1000,
                messages: [{
                    role: 'user',
                    content: `أنشئ 5 تمارين متنوعة للدرس التالي:

العنوان: ${lessonData.title}
المحتوى: ${lessonData.description || ''}

قدم التمارين بصيغة JSON فقط (بدون أي نص إضافي) بالشكل التالي:
[
  {
    "type": "multiple_choice",
    "question": "السؤال هنا",
    "options": ["خيار 1", "خيار 2", "خيار 3", "خيار 4"],
    "correctAnswer": 0,
    "explanation": "شرح الإجابة"
  },
  {
    "type": "true_false",
    "question": "السؤال هنا",
    "correctAnswer": true,
    "explanation": "شرح الإجابة"
  }
]

تنوع بين اختيار من متعدد وصح/خطأ.`
                }]
            })
        });
        
        const data = await response.json();
        let exercisesText = data.content[0].text;
        
        // تنظيف النص من أي markdown
        exercisesText = exercisesText.replace(/```json/g, '').replace(/```/g, '').trim();
        
        const exercises = JSON.parse(exercisesText);
        
        exercisesContainer.innerHTML = '';
        exercises.forEach((exercise, index) => {
            const exerciseElement = createExerciseElement(exercise, index);
            exercisesContainer.appendChild(exerciseElement);
        });
        
    } catch (error) {
        console.error('Error generating exercises:', error);
        exercisesContainer.innerHTML = `
            <div class="exercise-item">
                <p>عذراً، حدث خطأ في توليد التمارين. يرجى المحاولة لاحقاً.</p>
            </div>
        `;
    }
}

// ========== إنشاء عنصر تمرين ==========
function createExerciseElement(exercise, index) {
    const div = document.createElement('div');
    div.className = 'exercise-item';
    
    let optionsHtml = '';
    
    if (exercise.type === 'multiple_choice') {
        optionsHtml = `
            <div class="exercise-options">
                ${exercise.options.map((option, i) => `
                    <button class="option-btn" data-index="${i}">${option}</button>
                `).join('')}
            </div>
        `;
    } else if (exercise.type === 'true_false') {
        optionsHtml = `
            <div class="exercise-options">
                <button class="option-btn" data-index="true">✓ صحيح</button>
                <button class="option-btn" data-index="false">✗ خطأ</button>
            </div>
        `;
    }
    
    div.innerHTML = `
        <div class="exercise-question">${index + 1}. ${exercise.question}</div>
        ${optionsHtml}
        <button class="submit-exercise-btn" data-exercise="${index}">تحقق من الإجابة</button>
        <div class="exercise-feedback" style="display: none;"></div>
    `;
    
    // معالجة اختيار الخيارات
    div.querySelectorAll('.option-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            div.querySelectorAll('.option-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
        });
    });
    
    // معالجة التحقق من الإجابة
    div.querySelector('.submit-exercise-btn').addEventListener('click', () => {
        const selected = div.querySelector('.option-btn.selected');
        if (!selected) {
            alert('الرجاء اختيار إجابة');
            return;
        }
        
        const userAnswer = selected.dataset.index;
        const feedback = div.querySelector('.exercise-feedback');
        let isCorrect = false;
        
        if (exercise.type === 'multiple_choice') {
            isCorrect = parseInt(userAnswer) === exercise.correctAnswer;
        } else {
            isCorrect = (userAnswer === 'true') === exercise.correctAnswer;
        }
        
        // تعطيل الأزرار
        div.querySelectorAll('.option-btn').forEach(btn => btn.disabled = true);
        div.querySelector('.submit-exercise-btn').disabled = true;
        
        // عرض النتيجة
        if (isCorrect) {
            selected.classList.add('correct');
            feedback.className = 'exercise-feedback correct';
            feedback.innerHTML = `✅ إجابة صحيحة! ${exercise.explanation}`;
            updatePoints(10);
        } else {
            selected.classList.add('incorrect');
            feedback.className = 'exercise-feedback incorrect';
            feedback.innerHTML = `❌ إجابة خاطئة. ${exercise.explanation}`;
            
            // إظهار الإجابة الصحيحة
            if (exercise.type === 'multiple_choice') {
                div.querySelectorAll('.option-btn')[exercise.correctAnswer].classList.add('correct');
            } else {
                const correctBtn = div.querySelector(`.option-btn[data-index="${exercise.correctAnswer}"]`);
                correctBtn.classList.add('correct');
            }
        }
        
        feedback.style.display = 'block';
    });
    
    return div;
}

// ========== تحديث النقاط ==========
async function updatePoints(points) {
    if (!currentUser) return;
    
    const newPoints = (userProgress.points || 0) + points;
    const newLevel = Math.floor(newPoints / 100) + 1;
    
    await updateDoc(doc(db, 'users', currentUser.uid), {
        points: newPoints,
        level: newLevel
    });
    
    userProgress.points = newPoints;
    userProgress.level = newLevel;
    
    document.getElementById('total-points').textContent = newPoints;
    document.getElementById('user-level').textContent = newLevel;
    
    // إظهار رسالة تحفيزية
    showToast(`🎉 رائع! حصلت على ${points} نقطة`);
}

// ========== رسائل التحفيز ==========
function showToast(message) {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #10B981;
        color: white;
        padding: 16px 24px;
        border-radius: 8px;
        font-weight: 600;
        z-index: 10000;
        animation: slideDown 0.3s;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideUp 0.3s';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ========== رسائل الأخطاء ==========
function getErrorMessage(errorCode) {
    const errorMessages = {
        'auth/email-already-in-use': 'البريد الإلكتروني مستخدم بالفعل',
        'auth/invalid-email': 'البريد الإلكتروني غير صالح',
        'auth/weak-password': 'كلمة المرور ضعيفة (8 أحرف على الأقل)',
        'auth/user-not-found': 'البريد الإلكتروني غير مسجل',
        'auth/wrong-password': 'كلمة المرور غير صحيحة',
        'auth/too-many-requests': 'محاولات كثيرة جداً، حاول لاحقاً'
    };
    
    return errorMessages[errorCode] || 'حدث خطأ، يرجى المحاولة مرة أخرى';
}

// ========== تصدير للاستخدام العام ==========
window.appFunctions = {
    showPage,
    loadSubjects,
    loadLessons,
    updatePoints
};
