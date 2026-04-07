import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './utils/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import SectionsPage from './pages/SectionsPage';
import SectionDetailPage from './pages/SectionDetailPage';
import CoursePage from './pages/CoursePage';
import MockExamPage from './pages/MockExamPage';
import DashboardPage from './pages/DashboardPage';
import AdminPage from './pages/AdminPage';
import LeaderboardPage from './pages/LeaderboardPage';
import MyCoursesPage from './pages/MyCoursesPage';
import { LoginPage, RegisterPage } from './pages/AuthPages';

function NotFound() {
  return (
    <div style={{ textAlign: 'center', padding: '80px 20px', paddingTop: 'calc(64px + 80px)', minHeight: '100vh', background: '#f8f9fa' }}>
      <div style={{ fontSize: '72px', marginBottom: '16px' }}>🔍</div>
      <h2 style={{ fontSize: '26px', fontWeight: '900', color: '#0a1628', marginBottom: '8px' }}>الصفحة غير موجودة</h2>
      <p style={{ color: '#6b7280', marginBottom: '28px' }}>يبدو أن هذه الصفحة غير متاحة</p>
      <a href="/" style={{ background: 'linear-gradient(135deg, #c9a84c, #e8c97a)', color: '#0a1628', padding: '12px 28px', borderRadius: '8px', fontWeight: '700', textDecoration: 'none' }}>
        العودة للرئيسية
      </a>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/sections" element={<SectionsPage />} />
            <Route path="/sections/:sectionId" element={<SectionDetailPage />} />
            <Route path="/course/:courseId" element={<CoursePage />} />
            <Route path="/my-courses" element={<MyCoursesPage />} />
            <Route path="/mock-exams" element={<MockExamPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </BrowserRouter>
    </AuthProvider>
  );
}
