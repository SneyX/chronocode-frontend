
import React from 'react';
import { Button } from '@/components/ui/button';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import RepositoriesList from '@/components/github/repositories-list';
import { useAuth } from '@/contexts/auth-context';
import LoginButton from '@/components/auth/login-button';

const GitHub: React.FC = () => {
  const { isAuthenticated, isLoading, user } = useAuth();

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-4">GitHub Integration</h1>
          
          {isLoading ? (
            <div className="text-center py-8">
              <p>Loading...</p>
            </div>
          ) : isAuthenticated ? (
            <div>
              <p className="mb-4">
                Welcome, <span className="font-medium">{user?.name || user?.login}</span>!
                You're now connected to GitHub.
              </p>
            </div>
          ) : (
            <div className="py-4">
              <p className="mb-4">Connect to GitHub to see your repositories</p>
              <LoginButton />
            </div>
          )}
        </div>
        
        <div className="mt-8">
          <h2 className="text-2xl font-bold tracking-tight mb-4">Your Repositories</h2>
          <RepositoriesList />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default GitHub;
