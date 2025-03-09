import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useWindowSize } from '@uidotdev/usehooks';
import { useIsMobile } from '@/hooks/use-mobile';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import CommitTimeline from '@/components/timeline/commit-timeline';
import CommitSidebar from '@/components/timeline/commit-sidebar';
import SidebarChat from '@/components/ui/sidebar-chat';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { useToast } from "@/components/ui/use-toast"
import { cn } from '@/lib/utils';
import { getRepositoryByName } from '@/lib/supabase';
import { Commit, Repository } from '@/types';
import { Filter } from 'lucide-react';

const Timeline = () => {
  const [searchParams] = useSearchParams();
  const [repository, setRepository] = useState<Repository | null>(null);
  const [commits, setCommits] = useState<Commit[]>([]);
  const [filteredCommits, setFilteredCommits] = useState<Commit[]>([]);
  const [selectedCommitTypes, setSelectedCommitTypes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const { width } = useWindowSize();
  const isMobile = useIsMobile();
  const exampleMode = searchParams.get('example') === 'true';
  const { toast } = useToast()
  
  useEffect(() => {
    const repoName = searchParams.get('repo');
    
    if (!repoName) {
      toast({
        title: "Error",
        description: "Repository name is missing from the URL.",
      })
      return;
    }
    
    const fetchRepositoryData = async () => {
      setIsLoading(true);
      try {
        const repoData = await getRepositoryByName(repoName);
        if (repoData) {
          setRepository(repoData);
          setCommits(repoData.commits || []);
        } else {
          toast({
            title: "Error",
            description: "Failed to fetch repository data.",
          })
        }
      } catch (error) {
        console.error('Error fetching repository data:', error);
        toast({
          title: "Error",
          description: "Failed to fetch repository data.",
        })
      } finally {
        setIsLoading(false);
      }
    };
    
    if (!exampleMode) {
      fetchRepositoryData();
    } else {
      setIsLoading(false);
    }
  }, [searchParams, toast, exampleMode]);
  
  const filterCommits = useCallback(() => {
    if (selectedCommitTypes.length === 0) {
      setFilteredCommits(commits);
    } else {
      const filtered = commits.filter(commit => {
        return commit.commit_analyses.some(analysis => selectedCommitTypes.includes(analysis.type));
      });
      setFilteredCommits(filtered);
    }
  }, [commits, selectedCommitTypes]);
  
  useEffect(() => {
    filterCommits();
  }, [filterCommits]);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow pt-20 pb-24 relative">
        <CommitTimeline 
          commits={filteredCommits}
          isLoading={isLoading}
        />
        
        {/* Chat integration */}
        <SidebarChat 
          repoName={repository?.name || searchParams.get('repo') || undefined}
          repoId={repository?.id?.toString()} // Pass the repoId from the repository
          commits={filteredCommits} 
          className={cn(
            "top-20 bottom-0 right-0 w-[450px] z-40 transition-transform duration-300 ease-in-out",
            isMobile && isChatOpen ? "translate-x-0" : "",
            isMobile && !isChatOpen ? "translate-x-full" : ""
          )}
          isExample={exampleMode} // Pass isExample flag to determine API call vs mock data
        />
        
        {/* Floating button */}
        {width > 768 && (
          <Button
            variant="outline"
            className="fixed top-24 left-4 z-50 border-2 bg-popover text-popover-foreground shadow-md hover:bg-popover/80"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
          >
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Timeline;
