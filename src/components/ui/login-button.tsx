
import React from 'react';
import { Button } from '@/components/ui/button';
import { Github, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';

interface LoginButtonProps {
  variant?: 'default' | 'outline' | 'secondary' | 'destructive' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

const LoginButton: React.FC<LoginButtonProps> = ({ 
  variant = 'default',
  size = 'default',
  className 
}) => {
  const { login, loading } = useAuth();

  return (
    <Button
      onClick={login}
      variant={variant}
      size={size}
      className={className}
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Github className="mr-2 h-4 w-4" />
      )}
      Login with GitHub
    </Button>
  );
};

export default LoginButton;
