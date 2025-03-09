
import React from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

interface UserProfileProps {
  className?: string;
}

const UserProfile: React.FC<UserProfileProps> = ({ className }) => {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={className}>
        <Avatar className="h-9 w-9 cursor-pointer">
          <AvatarImage src={user.avatar_url} alt={user.login} />
          <AvatarFallback>{user.login.substring(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end">
        <div className="p-2 text-sm">
          <div className="font-medium">{user.name || user.login}</div>
          {user.email && <div className="text-xs text-muted-foreground">{user.email}</div>}
        </div>
        <DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserProfile;
