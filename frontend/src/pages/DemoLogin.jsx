import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { Loader2 } from 'lucide-react';

const DemoLogin = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');

  useEffect(() => {
    const initDemo = async () => {
      try {
        // Attempt to login as demo user
        // Ideally these credentials should be env vars or similar, 
        // but for this specific request we'll use a standard demo account
        await api.login('demo@helm-analytics.com', 'demo123');
        
        // Set demo flag
        localStorage.setItem('isDemo', 'true');
        localStorage.setItem('userEmail', 'demo@helm-analytics.com');
        
        // Redirect to dashboard
        navigate('/dashboard');
      } catch (err) {
        console.error("Demo login failed:", err);
        setError("Failed to initialize demo mode. Please try again later.");
        // Optional: Redirect to login or signup if demo fails
        // navigate('/login'); 
      }
    };

    initDemo();
  }, [navigate]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center text-rose-500 bg-rose-50 p-6 rounded-xl border border-rose-200">
          <p className="font-bold mb-2">Demo Initialization Failed</p>
          <p className="text-sm">{error}</p>
          <button 
            onClick={() => navigate('/')}
            className="mt-4 px-4 py-2 bg-white border border-border rounded-lg text-sm font-medium hover:bg-secondary transition-colors"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background space-y-4">
      <Loader2 className="w-12 h-12 text-primary animate-spin" />
      <h2 className="text-xl font-heading font-bold animate-pulse">Initializing Live Demo environment...</h2>
      <p className="text-muted-foreground text-sm">Loading sample datasets and configuring dashboard.</p>
    </div>
  );
};

export default DemoLogin;
