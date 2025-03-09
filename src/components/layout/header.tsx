
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { GitBranch, Code, MenuIcon } from 'lucide-react';
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
        
        <nav className="hidden md:flex items-center space-x-6">
          <Link to="/" className="text-sm font-medium hover:text-primary transition-colors">Home</Link>
          <Link to="/timeline" className="text-sm font-medium hover:text-primary transition-colors">Timeline</Link>
          <Link to="/github" className="text-sm font-medium hover:text-primary transition-colors">GitHub</Link>
        </nav>
        
        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <UserProfile />
          ) : (
            <LoginButton className="hidden sm:flex items-center" />
          )}
          
          <Button variant="outline" size="sm" className="hidden sm:flex items-center" asChild>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer">
              <GitBranch className="h-4 w-4 mr-2" />
              GitHub
            </a>
          </Button>
          <Button variant="outline" size="icon" className="sm:hidden">
            <MenuIcon className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
