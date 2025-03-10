
import React from 'react';
import { Link } from 'react-router-dom';
import { Code } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/auth-context';
import LoginButton from '@/components/auth/login-button';
import UserProfile from '@/components/auth/user-profile';

interface HeaderProps {
  className?: string;
}

const Header: React.FC<HeaderProps> = ({ className }) => {
  const { isAuthenticated } = useAuth();

  return (
    <header className={cn(
      'w-full border-b bg-background/80 backdrop-blur-md sticky top-0 z-10',
      className
    )}>
      <div className="container mx-auto py-4 px-6 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2 transition-colors hover:text-primary">
          <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center text-white">
            <Code className="h-6 w-6" />
          </div>
          <span className="text-xl font-semibold">Chronocode</span>
        </Link>
        
        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <UserProfile />
          ) : (
            <LoginButton className="sm:flex items-center" />
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
