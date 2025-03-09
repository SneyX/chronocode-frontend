
import React, { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Search, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { checkRepoExists } from '@/lib/supabase';
import RepositoryDropdown from '@/components/github/repository-dropdown';
import { useAuth } from '@/contexts/auth-context';

interface RepositoryInputProps {
  onSubmit: (url: string, repoName: string, repoExists?: boolean) => Promise<void>;
  isLoading?: boolean;
  className?: string;
}

const RepositoryInput: React.FC<RepositoryInputProps> = ({
  onSubmit,
  isLoading = false,
  className,
}) => {
  const { isAuthenticated } = useAuth();
  const [checkingRepo, setCheckingRepo] = useState(false);
  
  const handleRepositorySelect = async (url: string, repoName: string) => {
    if (!url || !repoName) {
      toast.error('Please select a repository or enter a valid URL');
      return;
    }
    
    try {
      setCheckingRepo(true);
      console.log('Checking if repository exists:', repoName);
      const exists = await checkRepoExists(repoName);
      setCheckingRepo(false);
      
      console.log('Repository exists:', exists);
      await onSubmit(url, repoName, exists);
    } catch (error) {
      console.error('Error processing repository:', error);
      toast.error('Failed to process repository. Please try again.');
      setCheckingRepo(false);
    }
  };

  return (
    <div className={cn(
      'w-full max-w-2xl mx-auto transition-all duration-300',
      className
    )}>
      <div className="glass-morphism rounded-xl overflow-hidden shadow-lg p-3 flex flex-col space-y-3">
        <RepositoryDropdown 
          onSelect={handleRepositorySelect}
          className="w-full"
        />
        
        <Button
          onClick={() => {}} // This button is now more of a visual confirmation
          disabled={isLoading || checkingRepo}
          className="w-full text-white bg-primary hover:bg-primary/90 rounded-lg px-6 py-6 transition-all"
        >
          {isLoading || checkingRepo ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <Search className="mr-2 h-5 w-5" />
          )}
          <span>Analyze Repository</span>
        </Button>
      </div>
    </div>
  );
};

export default RepositoryInput;
