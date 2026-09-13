import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getSession, onAuthStateChange } from '../../services/authService';

export default function ProtectedRoute({ children }) {
  const [session, setSession] = useState(undefined);
  const location = useLocation();

  useEffect(() => {
    // Initial session check
    getSession().then((sess) => {
      setSession(sess);
    });

    // Listen to live auth changes (e.g. sign out)
    const { data: authListener } = onAuthStateChange((_event, sess) => {
      setSession(sess);
    });

    return () => {
      if (authListener?.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  // Loading state
  if (session === undefined) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#F8F9FC',
          fontFamily: 'Inter, sans-serif',
          color: '#6B7280',
          fontSize: '0.9rem'
        }}
      >
        Authenticating...
      </div>
    );
  }

  // If unauthenticated, redirect to login
  if (!session) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children;
}
