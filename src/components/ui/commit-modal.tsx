
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Commit } from '@/types';
import CommitCard from '@/components/ui/commit-card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { InfoIcon } from 'lucide-react';

interface CommitModalProps {
  isOpen: boolean;
  onClose: () => void;
  commits: Commit[];
  commitIds: string[];
  question: string | null;
}

const CommitModal = ({ isOpen, onClose, commits, commitIds, question }: CommitModalProps) => {
  const [expandedCommits, setExpandedCommits] = useState<Record<string, boolean>>({});

  const toggleExpand = (sha: string) => {
    setExpandedCommits(prev => ({
      ...prev,
      [sha]: !prev[sha]
    }));
  };

  // Filter commits based on the commitIds
  const filteredCommits = commits.filter(commit => 
    commitIds.includes(commit.sha)
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <InfoIcon className="h-5 w-5 text-primary" />
            Related Commits
          </DialogTitle>
          {question && (
            <DialogDescription className="text-sm mt-2 text-muted-foreground">
              For question: "{question}"
            </DialogDescription>
          )}
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden">
          {filteredCommits.length > 0 ? (
            <ScrollArea className="h-[60vh] pr-4">
              <div className="space-y-4 py-4">
                {filteredCommits.map(commit => (
                  <CommitCard
                    key={commit.sha}
                    commit={commit}
                    isExpanded={!!expandedCommits[commit.sha]}
                    onToggleExpand={() => toggleExpand(commit.sha)}
                  />
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              No commits found with the specified IDs.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CommitModal;
