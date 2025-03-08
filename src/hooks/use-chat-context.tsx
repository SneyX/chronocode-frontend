
import { useState, useCallback } from 'react';
import { Commit, CommitType } from '@/types';

export type ChatContextFilter = {
  commitShas: string[];
  highlight: boolean;
  filterReason: string;
};

export function useChatContext() {
  const [contextFilter, setContextFilter] = useState<ChatContextFilter | null>(null);
  
  const filterCommitsByContext = useCallback((commits: Commit[]): Commit[] => {
    if (!contextFilter || !contextFilter.highlight || contextFilter.commitShas.length === 0) {
      return commits;
    }
    
    return commits.filter(commit => contextFilter.commitShas.includes(commit.sha));
  }, [contextFilter]);
  
  const clearContextFilter = useCallback(() => {
    setContextFilter(null);
  }, []);
  
  // This would be connected to an actual AI model in production
  const getRelatedCommits = useCallback((question: string, allCommits: Commit[]): string[] => {
    question = question.toLowerCase();
    
    // Simple keyword matching for demo purposes
    const keywords: Record<string, string[]> = {
      'authentication': ['2', '3', '6'],
      'security': ['6', '7'],
      'profile': ['4'],
      'performance': ['8'],
      'release': ['9'],
      'milestone': ['1', '9'],
      'dependencies': ['5'],
      'bug': ['3', '7'],
      'error': ['3'],
      'password': ['6']
    };
    
    let matchedCommits: Set<string> = new Set();
    
    // Check each keyword against the question
    Object.entries(keywords).forEach(([keyword, commits]) => {
      if (question.includes(keyword)) {
        commits.forEach(commit => matchedCommits.add(commit));
      }
    });
    
    // If we didn't find any keywords, look for commit types
    if (matchedCommits.size === 0) {
      const typeKeywords: Record<string, CommitType> = {
        'feature': 'FEATURE',
        'features': 'FEATURE',
        'bug': 'BUG',
        'bugs': 'BUG',
        'fix': 'BUG',
        'warning': 'WARNING',
        'security': 'WARNING',
        'milestone': 'MILESTONE',
        'chore': 'CHORE',
        'maintenance': 'CHORE'
      };
      
      Object.entries(typeKeywords).forEach(([keyword, type]) => {
        if (question.includes(keyword)) {
          allCommits.forEach(commit => {
            const analyses = commit.commit_analyses || commit.commit_analises || [];
            if (analyses.length > 0 && analyses[0].type === type) {
              matchedCommits.add(commit.sha);
            }
          });
        }
      });
    }
    
    return Array.from(matchedCommits);
  }, []);
  
  // Process a user question and set the context filter
  const processQuestion = useCallback((question: string, allCommits: Commit[]) => {
    const relatedCommits = getRelatedCommits(question, allCommits);
    
    if (relatedCommits.length > 0) {
      setContextFilter({
        commitShas: relatedCommits,
        highlight: true,
        filterReason: `Related to: "${question}"`
      });
      return true;
    }
    
    return false;
  }, [getRelatedCommits]);
  
  return {
    contextFilter,
    filterCommitsByContext,
    clearContextFilter,
    processQuestion
  };
}
