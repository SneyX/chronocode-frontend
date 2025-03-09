
import React from 'react';
import { Button } from '@/components/ui/button';
import { Github } from 'lucide-react';
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
      <Github className="h-4 w-4 mr-2" />
      Login with GitHub
    </Button>
  );
};

export default LoginButton;
