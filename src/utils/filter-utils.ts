
import { Commit, CommitType, TimelineFilters } from '@/types';

/**
 * Filters commits based on the provided filters
 */
export const filterCommits = (commits: Commit[], filters: TimelineFilters): Commit[] => {
  return commits.filter(commit => {
    // Filter by type
    if (filters.types.length > 0) {
      // Check if any of the commit analyses match the filter types
      const hasMatchingType = commit.commit_analises.some(analysis => 
        filters.types.includes(analysis.type)
      );
      
      if (!hasMatchingType) return false;
    }
    
    // Filter by author
    if (filters.authors.length > 0 && !filters.authors.includes(commit.author)) {
      return false;
    }
    
    // Filter by date range
    const commitDate = new Date(commit.date);
    if (filters.dateRange.from && commitDate < filters.dateRange.from) {
      return false;
    }
    if (filters.dateRange.to && commitDate > filters.dateRange.to) {
      return false;
    }
    
    // Filter by search term
    if (filters.searchTerm) {
      const searchTermLower = filters.searchTerm.toLowerCase();
      const matchesMessage = commit.message.toLowerCase().includes(searchTermLower);
      const matchesDescription = commit.description.toLowerCase().includes(searchTermLower);
      const matchesAuthor = commit.author.toLowerCase().includes(searchTermLower);
      const matchesAnalysis = commit.commit_analises.some(analysis => 
        analysis.title.toLowerCase().includes(searchTermLower) ||
        analysis.idea.toLowerCase().includes(searchTermLower) ||
        analysis.description.toLowerCase().includes(searchTermLower)
      );
      
      if (!(matchesMessage || matchesDescription || matchesAuthor || matchesAnalysis)) {
        return false;
      }
    }
    
    return true;
  });
};

/**
 * Groups commits by the specified criterion
 */
export const groupCommits = (commits: Commit[], groupBy: 'type' | 'author' | 'date'): Record<string, Commit[]> => {
  const grouped: Record<string, Commit[]> = {};
  
  if (groupBy === 'type') {
    // Initialize groups for each commit type
    const types: CommitType[] = ['FEATURE', 'WARNING', 'MILESTONE', 'BUG', 'CHORE'];
    types.forEach(type => {
      grouped[type] = [];
    });
    
    // Group commits by their primary analysis type
    commits.forEach(commit => {
      if (commit.commit_analises.length > 0) {
        const primaryType = commit.commit_analises[0].type;
        grouped[primaryType].push(commit);
      } else {
        // If no analysis, put in CHORE category
        grouped['CHORE'].push(commit);
      }
    });
  } else if (groupBy === 'author') {
    commits.forEach(commit => {
      if (!grouped[commit.author]) {
        grouped[commit.author] = [];
      }
      grouped[commit.author].push(commit);
    });
  } else if (groupBy === 'date') {
    // Group by month and year
    commits.forEach(commit => {
      const date = new Date(commit.date);
      const monthYear = `${date.getFullYear()}-${date.getMonth() + 1}`;
      
      if (!grouped[monthYear]) {
        grouped[monthYear] = [];
      }
      grouped[monthYear].push(commit);
    });
  }
  
  return grouped;
};

/**
 * Gets all unique authors from the commits
 */
export const getUniqueAuthors = (commits: Commit[]): string[] => {
  const authors = new Set<string>();
  
  commits.forEach(commit => {
    authors.add(commit.author);
  });
  
  return Array.from(authors);
};

/**
 * Gets the commit type color class
 */
export const getCommitTypeColor = (type: CommitType): string => {
  switch (type) {
    case 'FEATURE':
      return 'bg-commit-feature text-white';
    case 'WARNING':
      return 'bg-commit-warning text-black';
    case 'MILESTONE':
      return 'bg-commit-milestone text-white';
    case 'BUG':
      return 'bg-commit-bug text-white';
    case 'CHORE':
      return 'bg-commit-chore text-white';
    default:
      return 'bg-gray-400 text-white';
  }
};

/**
 * Gets the commit type icon name
 */
export const getCommitTypeIcon = (type: CommitType): string => {
  switch (type) {
    case 'FEATURE':
      return 'sparkles';
    case 'WARNING':
      return 'alert-triangle';
    case 'MILESTONE':
      return 'milestone';
    case 'BUG':
      return 'bug';
    case 'CHORE':
      return 'tool';
    default:
      return 'git-commit';
  }
};
