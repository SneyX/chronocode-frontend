
import React, { useEffect, useState } from 'react';
import { Check, ChevronDown, Loader2, GitBranch, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useAuth } from '@/contexts/auth-context';
import { getUserRepositories, Repository } from '@/services/github-service';
import { cn } from '@/lib/utils';
import { extractRepoNameFromUrl } from '@/lib/supabase';
import { toast } from 'sonner';

interface RepositoryDropdownProps {
  onSelect: (url: string, repoName: string) => void;
  className?: string;
}

const RepositoryDropdown: React.FC<RepositoryDropdownProps> = ({ 
  onSelect,
  className 
}) => {
  const { token, isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selected, setSelected] = useState<Repository | null>(null);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    if (isAuthenticated && token && open) {
      fetchRepositories();
    }
  }, [isAuthenticated, token, open]);

  const fetchRepositories = async () => {
    if (!isAuthenticated || !token) return;
    
    setIsLoading(true);
    try {
      const repos = await getUserRepositories(token);
      setRepositories(repos);
    } catch (error) {
      console.error('Failed to fetch repositories:', error);
      toast.error('Failed to load repositories');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = (repo: Repository) => {
    setSelected(repo);
    setOpen(false);
    const repoUrl = repo.html_url;
    const repoName = extractRepoNameFromUrl(repoUrl);
    onSelect(repoUrl, repoName);
  };

  const handleInputSubmit = () => {
    if (!inputValue) return;
    
    // Check if it's a GitHub URL
    const isGithubUrl = /^https?:\/\/(www\.)?github\.com\/[\w-]+\/[\w.-]+\/?.*$/.test(inputValue);
    
    if (isGithubUrl) {
      const repoName = extractRepoNameFromUrl(inputValue);
      if (repoName) {
        onSelect(inputValue, repoName);
        setInputValue('');
      } else {
        toast.error('Invalid GitHub repository URL');
      }
    } else {
      toast.error('Please enter a valid GitHub repository URL');
    }
  };

  return (
    <div className={cn("w-full flex flex-col md:flex-row gap-2", className)}>
      {isAuthenticated ? (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="justify-between w-full md:w-auto md:flex-1"
            >
              {selected ? (
                <div className="flex items-center">
                  <GitBranch className="mr-2 h-4 w-4" />
                  <span>{selected.full_name}</span>
                </div>
              ) : (
                <span>Select a repository</span>
              )}
              <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0" align="start">
            <Command>
              <CommandInput placeholder="Search repositories..." />
              <CommandEmpty>
                {isLoading ? (
                  <div className="flex items-center justify-center py-6">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  "No repositories found."
                )}
              </CommandEmpty>
              <CommandGroup className="max-h-80 overflow-auto">
                {repositories.map((repo) => (
                  <CommandItem
                    key={repo.id}
                    value={repo.full_name}
                    onSelect={() => handleSelect(repo)}
                  >
                    <div className="flex items-center">
                      <GitBranch className="mr-2 h-4 w-4" />
                      <span>{repo.full_name}</span>
                    </div>
                    <Check
                      className={cn(
                        "ml-auto h-4 w-4",
                        selected?.id === repo.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      ) : null}

      <div className="relative flex-1 flex">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Or enter repository URL manually"
          className="w-full pr-10 pl-3 py-2 text-base border border-input rounded-md"
        />
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute right-1 top-1/2 transform -translate-y-1/2"
          onClick={handleInputSubmit}
        >
          <Search className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default RepositoryDropdown;
