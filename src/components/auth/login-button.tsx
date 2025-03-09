
import React from 'react';
import { Button } from '@/components/ui/button';
import { GitHubLogoIcon } from '@radix-ui/react-icons';
import { useAuth } from '@/contexts/auth-context';

interface LoginButtonProps {
  className?: string;
}

const LoginButton: React.FC<LoginButtonProps> = ({ className }) => {
  const { login, isAuthenticated, logout } = useAuth();

  return isAuthenticated ? (
    <Button 
      variant="outline" 
      className={className}
      onClick={logout}
    >
      Logout
    </Button>
  ) : (
    <Button 
      variant="outline" 
      className={className}
      onClick={login}
    >
      <GitHubLogoIcon className="h-4 w-4 mr-2" />
      Login with GitHub
    </Button>
  );
};

export default LoginButton;
