
import React, { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, GitBranch, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RepositoryInputProps {
  onSubmit: (url: string) => Promise<void>;
  isLoading?: boolean;
  className?: string;
}

const RepositoryInput: React.FC<RepositoryInputProps> = ({
  onSubmit,
  isLoading = false,
  className,
}) => {
  const [url, setUrl] = useState('');
  
  const validateUrl = (url: string): boolean => {
    // Basic validation to check if it's a GitHub repository URL
    const githubRegex = /^https?:\/\/(www\.)?github\.com\/[\w-]+\/[\w.-]+\/?$/;
    return githubRegex.test(url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim()) {
      toast.error('Please enter a repository URL');
      return;
    }
    
    if (!validateUrl(url)) {
      toast.error('Please enter a valid GitHub repository URL');
      return;
    }
    
    try {
      await onSubmit(url);
    } catch (error) {
      console.error('Error submitting repository URL:', error);
      toast.error('Failed to process repository. Please try again.');
    }
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className={cn(
        'w-full max-w-2xl mx-auto transition-all duration-300',
        className
      )}
    >
      <div className="glass-morphism rounded-xl overflow-hidden shadow-lg p-1 flex items-center">
        <div className="flex-1 flex items-center px-3">
          <GitBranch className="text-primary w-5 h-5 mr-3 flex-shrink-0" />
          <Input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://github.com/username/repository"
            className="border-0 bg-transparent shadow-none text-base py-6 focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </div>
        <Button
          type="submit"
          disabled={isLoading}
          className="text-white bg-primary hover:bg-primary/90 rounded-lg px-6 py-6 m-1 transition-all"
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <Search className="mr-2 h-5 w-5" />
          )}
          <span>Analyze</span>
        </Button>
      </div>
    </form>
  );
};

export default RepositoryInput;
