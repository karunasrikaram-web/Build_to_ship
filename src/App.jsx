import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import StudentDashboard from './components/StudentDashboard';
import AdminDashboard from './components/AdminDashboard';
import SubmitComplaint from './components/SubmitComplaint';
import AuthPage from './components/AuthPage';

function MainApp() {
  const { user, profile, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Default to appropriate initial tab depending on user role
  const isAdmin = profile?.role === 'admin';
  const [activeTab, setActiveTab] = useState(isAdmin ? 'admin-dashboard' : 'student-dashboard');

  // Keep active tab aligned if profile finishes loading
  React.useEffect(() => {
    if (profile?.role === 'admin') {
      setActiveTab('admin-dashboard');
    } else if (profile?.role === 'student') {
      setActiveTab('student-dashboard');
    }
  }, [profile?.role]);

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--bg-main)',
        }}
      >
        <div style={{ fontWeight: 600, color: 'var(--primary)', fontSize: '1.1rem' }}>
          Loading CampusConnect...
        </div>
      </div>
    );
  }

  // Not signed in
  if (!user) {
    return <AuthPage />;
  }

  return (
    <div className="app-layout">
      {/* Sidebar navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      {/* Main body content area */}
      <div className="main-content">
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        <main className="content-body">
          {isAdmin ? (
            <AdminDashboard />
          ) : (
            <>
              {activeTab === 'student-dashboard' && (
                <StudentDashboard
                  onNewComplaintClick={() => setActiveTab('submit-complaint')}
                />
              )}
              {activeTab === 'submit-complaint' && (
                <SubmitComplaint
                  onSuccess={() => setActiveTab('student-dashboard')}
                />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

