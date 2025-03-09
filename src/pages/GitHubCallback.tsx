
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth-context';
import { Loader2 } from 'lucide-react';

const GitHubCallback: React.FC = () => {
  const { handleGitHubCallback } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processCallback = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');

        if (!code || !state) {
          setError('Invalid callback parameters');
          return;
        }

        await handleGitHubCallback(code, state);
        navigate('/timeline');
      } catch (err) {
        console.error('Error processing GitHub callback:', err);
        setError('Authentication failed. Please try again.');
      }
    };

    processCallback();
  }, [handleGitHubCallback, navigate]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-destructive text-xl mb-4">{error}</div>
        <button
          className="bg-primary text-white px-4 py-2 rounded"
          onClick={() => navigate('/')}
        >
          Return to Home
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Loader2 className="h-12 w-12 text-primary animate-spin" />
      <p className="mt-4 text-muted-foreground">Logging you in...</p>
    </div>
  );
};

export default GitHubCallback;
