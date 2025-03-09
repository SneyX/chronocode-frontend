
import React, { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, GitBranch, Loader2, ChevronDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { extractRepoNameFromUrl, checkRepoExists } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth-context';
import { getUserRepositories, Repository } from '@/services/github-service';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';

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
  const [url, setUrl] = useState('');
  const [checkingRepo, setCheckingRepo] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [repos, setRepos] = useState<Repository[]>([]);
  const [filteredRepos, setFilteredRepos] = useState<Repository[]>([]);
  const [searchValue, setSearchValue] = useState('');
  const [isLoadingRepos, setIsLoadingRepos] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  const { isAuthenticated, token } = useAuth();
  
  useEffect(() => {
    if (isAuthenticated && token && dropdownOpen) {
      fetchUserRepositories();
    }
  }, [isAuthenticated, token, dropdownOpen]);
  
  useEffect(() => {
    if (searchValue.trim() === '') {
      setFilteredRepos(repos);
    } else {
      const filtered = repos.filter(repo => 
        repo.name.toLowerCase().includes(searchValue.toLowerCase()) ||
        repo.full_name.toLowerCase().includes(searchValue.toLowerCase())
      );
      setFilteredRepos(filtered);
    }
  }, [searchValue, repos]);
  
  const fetchUserRepositories = async () => {
    if (!token) return;
    
    try {
      setIsLoadingRepos(true);
      const userRepos = await getUserRepositories(token);
      setRepos(userRepos);
      setFilteredRepos(userRepos);
    } catch (error) {
      console.error('Error fetching repositories:', error);
      toast.error('Failed to fetch your repositories');
    } finally {
      setIsLoadingRepos(false);
    }
  };
  
  const validateUrl = (url: string): boolean => {
    // Basic validation to check if it's a GitHub repository URL
    const githubRegex = /^https?:\/\/(www\.)?github\.com\/[\w-]+\/[\w.-]+\/?.*$/;
    return githubRegex.test(url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim()) {
      toast.error('Please select a repository');
      return;
    }
    
    if (!validateUrl(url)) {
      toast.error('Please select a valid GitHub repository');
      return;
    }
    
    const repoName = extractRepoNameFromUrl(url);
    console.log('Extracted repo name:', repoName);
    
    if (!repoName) {
      toast.error('Could not extract repository name from URL');
      return;
    }
    
    try {
      // Check if repo exists in Supabase before submitting
      setCheckingRepo(true);
      const exists = await checkRepoExists(repoName);
      setCheckingRepo(false);
      
      console.log('Repository exists:', exists);
      
      await onSubmit(url, repoName, exists);
    } catch (error) {
      console.error('Error submitting repository URL:', error);
      toast.error('Failed to process repository. Please try again.');
      setCheckingRepo(false);
    }
  };
  
  const handleRepositorySelect = (repo: Repository) => {
    const repoUrl = repo.html_url;
    setUrl(repoUrl);
    setDropdownOpen(false);
  };
  
  const handleClearInput = (e: React.MouseEvent) => {
    e.stopPropagation();
    setUrl('');
  };

  const handleToggleDropdown = () => {
    if (isAuthenticated && token) {
      setDropdownOpen(!dropdownOpen);
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
        <div className="flex-1 flex items-center px-3 relative">
          <GitBranch className="text-primary w-5 h-5 mr-3 flex-shrink-0" />
          
          {isAuthenticated ? (
            <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
              <DropdownMenuTrigger asChild>
                <div className="flex-1 flex items-center cursor-pointer" onClick={handleToggleDropdown}>
                  <div className="flex-1 relative">
                    <Input
                      type="text"
                      value={url}
                      readOnly={true}
                      placeholder="Select a repository"
                      className="border-0 bg-transparent shadow-none text-base py-6 focus-visible:ring-0 focus-visible:ring-offset-0 flex-1 cursor-pointer"
                    />
                  </div>
                  {url ? (
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 mr-1" 
                      onClick={handleClearInput}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground mr-1" />
                  )}
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                className="w-[96%] bg-card border border-card-border shadow-md rounded-md" 
                align="start" 
                side="bottom" 
                sideOffset={8}
                onCloseAutoFocus={(e) => e.preventDefault()}
              >
                <div className="p-2 sticky top-0 bg-card z-10 border-b">
                  <Input
                    ref={searchInputRef}
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    placeholder="Search repositories..."
                    className="w-full h-9"
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
                <ScrollArea className="max-h-[300px] overflow-y-auto">
                  {isLoadingRepos ? (
                    <div className="flex items-center justify-center py-6">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : filteredRepos.length > 0 ? (
                    filteredRepos.map((repo) => (
                      <DropdownMenuItem 
                        key={repo.id} 
                        className="py-3 px-3 cursor-pointer"
                        onClick={() => handleRepositorySelect(repo)}
                      >
                        <div className="flex flex-col w-full">
                          <div className="font-medium">{repo.name}</div>
                          <div className="text-xs text-muted-foreground mt-1 flex justify-between items-center">
                            <span>{repo.full_name}</span>
                            <div className="flex items-center space-x-2 text-xs">
                              <span>⭐ {repo.stargazers_count}</span>
                              <span>🍴 {repo.forks_count}</span>
                            </div>
                          </div>
                        </div>
                      </DropdownMenuItem>
                    ))
                  ) : (
                    <div className="py-4 px-3 text-center text-muted-foreground">
                      {searchValue ? 'No repositories found' : 'No repositories available'}
                    </div>
                  )}
                </ScrollArea>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://github.com/username/repository"
              className="border-0 bg-transparent shadow-none text-base py-6 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          )}
        </div>
        <Button
          type="submit"
          disabled={isLoading || checkingRepo}
          className="text-white bg-primary hover:bg-primary/90 rounded-lg px-6 py-6 m-1 transition-all"
        >
          {isLoading || checkingRepo ? (
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
