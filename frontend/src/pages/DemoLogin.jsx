import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

const DemoLogin = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState('initializing'); // initializing, logging_in, success, error
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const initDemo = async () => {
      try {
        setStatus('logging_in');
        
        // Call demo initialization endpoint
        const API_URL = window.HELM_CONFIG?.API_URL || 'https://api.helm-analytics.com';
        const response = await fetch(`${API_URL}/auth/demo/init`, {
          method: 'POST',
          credentials: 'include', // Important for cookies
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Demo initialization failed');
        }

        const data = await response.json();
        setStatus('success');
        
        // Set demo flags
        localStorage.setItem('isDemo', 'true');
        localStorage.setItem('userEmail', data.email || 'demo@helm-analytics.com');
        
        // Short delay to show success state before redirect
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);

      } catch (err) {
        console.error("Demo init failed:", err);
        setErrorMessage(err.message || "Failed to initialize demo mode. Please try again.");
        setStatus('error');
      }
    };

    initDemo();
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 animate-in fade-in duration-500">
      <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl p-8 text-center">
        
        {/* Logo/Icon */}
        <div className="mb-6 flex justify-center">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors duration-500 ${
            status === 'error' ? 'bg-red-500/10 text-red-500' : 
            status === 'success' ? 'bg-green-500/10 text-green-500' : 
            'bg-accent/10 text-accent'
          }`}>
             {status === 'loading' || status === 'initializing' || status === 'logging_in' ? (
               <Loader2 className="w-8 h-8 animate-spin" />
             ) : status === 'success' ? (
               <CheckCircle2 className="w-8 h-8" />
             ) : (
               <AlertCircle className="w-8 h-8" />
             )}
          </div>
        </div>

        {/* Text Content */}
        <h2 className="text-2xl font-bold mb-2">
          {status === 'error' ? 'Demo Unavailable' : 
           status === 'success' ? 'Welcome Aboard' : 
           'Launching Demo'}
        </h2>
        
        <p className="text-muted-foreground text-sm mb-8">
          {status === 'initializing' && "Preparing environment..."}
          {status === 'logging_in' && "Authenticating as Guest User..."}
          {status === 'success' && "Redirecting you to the live dashboard..."}
          {status === 'error' && errorMessage}
        </p>

        {/* Actions */}
        {status === 'error' && (
          <div className="flex gap-3 justify-center">
             <button 
              onClick={() => navigate('/')}
              className="px-4 py-2 bg-secondary text-foreground rounded-lg font-medium hover:bg-secondary/80 transition-colors"
            >
              Back to Home
            </button>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-accent text-white rounded-lg font-medium hover:bg-accent/90 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}
        
        {status !== 'error' && (
          <div className="w-full bg-secondary/50 rounded-full h-1.5 overflow-hidden">
            <div className="h-full bg-accent animate-progress-indeterminate"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DemoLogin;
