
import React, { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, GitBranch, Loader2, ChevronDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { extractRepoNameFromUrl, checkRepoExists, getRepositoryByName } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth-context';
import { getUserRepositories, Repository, analyzeRepository } from '@/services/github-service';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent, 
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';

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
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [showAnalysisDialog, setShowAnalysisDialog] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownTriggerRef = useRef<HTMLButtonElement>(null);
  
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

  // Progress simulation when analysis is running
  useEffect(() => {
    let intervalId: number;
    
    if (isAnalyzing && showAnalysisDialog) {
      // Start with 5% to show immediate feedback
      setAnalysisProgress(5);
      
      // Simulate gradual progress, but never reaching 100%
      // The final 100% will be set when the analysis completes
      intervalId = window.setInterval(() => {
        setAnalysisProgress(current => {
          if (current >= 95) {
            return 95; // Never automatically reach 100%
          }
          // Slower progress as we get closer to the end
          const increment = 100 - current > 50 ? 5 : 2;
          return current + increment;
        });
      }, 5000); // Update every 5 seconds
    }
    
    return () => {
      if (intervalId) window.clearInterval(intervalId);
    };
  }, [isAnalyzing, showAnalysisDialog]);
  
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
      toast.error('Please enter a repository URL');
      return;
    }
    
    if (!validateUrl(url)) {
      toast.error('Please enter a valid GitHub repository URL');
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
      
      if (exists) {
        // If repository already exists in Supabase, navigate to its timeline
        await onSubmit(url, repoName, exists);
      } else {
        // Repository doesn't exist, we need to trigger analysis
        setShowAnalysisDialog(true);
        setIsAnalyzing(true);
        
        try {
          // Start the repository analysis
          await analyzeRepository(url, token || undefined);
          
          // Set progress to 100% to indicate completion
          setAnalysisProgress(100);
          
          toast.success('Repository analysis completed!');
          
          // Slight delay to show the 100% progress before closing
          setTimeout(() => {
            setShowAnalysisDialog(false);
            setIsAnalyzing(false);
            
            // Check if repo exists now after analysis
            checkRepoExists(repoName).then(nowExists => {
              if (nowExists) {
                onSubmit(url, repoName, true);
              } else {
                toast.error('Analysis completed but repository data was not found');
              }
            });
          }, 1500);
        } catch (error) {
          console.error('Analysis error:', error);
          setShowAnalysisDialog(false);
          setIsAnalyzing(false);
          toast.error('Failed to analyze repository', {
            description: error instanceof Error ? error.message : 'Please try again later',
          });
        }
      }
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
  
  const handleClearInput = () => {
    setUrl('');
  };

  const handleDropdownToggle = () => {
    setDropdownOpen(!dropdownOpen);
    if (!dropdownOpen) {
      setSearchValue('');
    }
  };

  const handleCloseDropdown = () => {
    setDropdownOpen(false);
  };

  const cancelAnalysis = () => {
    setShowAnalysisDialog(false);
    setIsAnalyzing(false);
    // Note: The backend will continue processing, but we won't wait for the result
    toast.info('Analysis will continue in the background');
  };

  return (
    <>
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
              <div className="flex-1 flex items-center">
                <Input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Enter repository URL or select from dropdown"
                  className="border-0 bg-transparent shadow-none text-base py-6 focus-visible:ring-0 focus-visible:ring-offset-0 flex-1"
                />
                {url && (
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 mr-1" 
                    onClick={handleClearInput}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
                <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      ref={dropdownTriggerRef}
                      type="button" 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8" 
                      onClick={handleDropdownToggle}
                    >
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent 
                    className="w-[96%] bg-card border border-border shadow-md" 
                    align="start" 
                    side="bottom" 
                    sideOffset={8}
                    onEscapeKeyDown={handleCloseDropdown}
                    onInteractOutside={(e) => {
                      // Don't close dropdown if clicking on the search input
                      const target = e.target as Node;
                      if (searchInputRef.current && !searchInputRef.current.contains(target)) {
                        handleCloseDropdown();
                      }
                    }}
                  >
                    <div className="p-2 sticky top-0 bg-card z-10 border-b">
                      <Input
                        ref={searchInputRef}
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        placeholder="Search repositories..."
                        className="w-full h-9"
                        autoFocus
                        // Prevent dropdown from closing when clicking the input
                        onClick={(e) => e.stopPropagation()}
                        // Prevent form submission when pressing Enter in search
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                          }
                        }}
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
              </div>
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
            disabled={isLoading || checkingRepo || isAnalyzing}
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

      {/* Analysis Progress Dialog */}
      <Dialog open={showAnalysisDialog} onOpenChange={setShowAnalysisDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Analyzing Repository</DialogTitle>
            <DialogDescription>
              This may take several minutes depending on the repository size and complexity.
              You can wait or continue browsing - the analysis will continue in the background.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-6">
            <div className="mb-2 flex justify-between text-sm">
              <span>Analysis in progress...</span>
              <span>{Math.round(analysisProgress)}%</span>
            </div>
            <Progress value={analysisProgress} className="h-2" />
            
            <p className="text-xs text-muted-foreground mt-4">
              We're analyzing commits, code changes, and patterns in the repository.
              Larger repositories with many commits will take longer to analyze.
            </p>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={cancelAnalysis}>
              Continue in background
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RepositoryInput;
