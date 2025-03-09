
import { Commit, CommitType, TimelineFilters } from '@/types';

/**
 * Filters commits based on the provided filters
 */
export const filterCommits = (commits: Commit[], filters: TimelineFilters): Commit[] => {
  return commits.filter(commit => {
    // Get analyses from either property name
    const analyses = commit.commit_analyses || commit.commit_analises || [];
    
    // Filter by type
    if (filters.types.length > 0) {
      // Check if any of the commit analyses match the filter types
      const hasMatchingType = analyses.some(analysis => 
        filters.types.includes(analysis.type)
      );
      
      if (!hasMatchingType) return false;
    }
    
    // Filter by epic
    if (filters.epics && filters.epics.length > 0) {
      // Check if any of the commit analyses match the filter epics
      const hasMatchingEpic = analyses.some(analysis => 
        analysis.epic && filters.epics.includes(analysis.epic)
      );
      
      if (!hasMatchingEpic) return false;
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
      const matchesEpic = analyses.some(analysis => 
        analysis.epic?.toLowerCase().includes(searchTermLower)
      );
      const matchesAnalysis = analyses.some(analysis => 
        analysis.title?.toLowerCase().includes(searchTermLower) ||
        analysis.idea?.toLowerCase().includes(searchTermLower) ||
        analysis.description?.toLowerCase().includes(searchTermLower)
      );
      
      if (!(matchesMessage || matchesDescription || matchesAuthor || matchesAnalysis || matchesEpic)) {
        return false;
      }
    }
    
    return true;
  });
};

/**
 * Groups commits by the specified criterion
 */
export const groupCommits = (commits: Commit[], groupBy: 'type' | 'author' | 'date' | 'epic'): Record<string, Commit[]> => {
  const grouped: Record<string, Commit[]> = {};
  
  if (groupBy === 'type') {
    // Initialize groups for each commit type that exists in the commits
    const uniqueTypes = getUniqueCommitTypes(commits);
    uniqueTypes.forEach(type => {
      grouped[type] = [];
    });
    
    // Group commits by their primary analysis type
    commits.forEach(commit => {
      // Support both property names
      const analyses = commit.commit_analyses || commit.commit_analises || [];
      
      if (analyses && analyses.length > 0) {
        const primaryType = analyses[0].type;
        if (primaryType && grouped[primaryType]) {
          grouped[primaryType].push(commit);
        } else {
          // If analysis type is invalid, put in CHORE category
          if (grouped['CHORE']) {
            grouped['CHORE'].push(commit);
          } else if (uniqueTypes.length > 0) {
            // Fallback to first available type if CHORE doesn't exist
            grouped[uniqueTypes[0]].push(commit);
          }
        }
      } else {
        // If no analysis, put in CHORE category if it exists
        if (grouped['CHORE']) {
          grouped['CHORE'].push(commit);
        } else if (uniqueTypes.length > 0) {
          // Fallback to first available type if CHORE doesn't exist
          grouped[uniqueTypes[0]].push(commit);
        }
      }
    });
  } else if (groupBy === 'author') {
    // Initialize the grouped object before adding items
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
  } else if (groupBy === 'epic') {
    // Group by epic category
    const epicGroups = new Set<string>();
    
    // First identify all unique epics
    commits.forEach(commit => {
      const analyses = commit.commit_analyses || commit.commit_analises || [];
      
      if (analyses && analyses.length > 0) {
        const epic = analyses[0].epic || 'Uncategorized';
        epicGroups.add(epic);
      } else {
        epicGroups.add('Uncategorized');
      }
    });
    
    // Initialize epic groups
    epicGroups.forEach(epic => {
      grouped[epic] = [];
    });
    
    // Now assign commits to their epic groups
    commits.forEach(commit => {
      const analyses = commit.commit_analyses || commit.commit_analises || [];
      
      if (analyses && analyses.length > 0) {
        const epic = analyses[0].epic || 'Uncategorized';
        grouped[epic].push(commit);
      } else {
        grouped['Uncategorized'].push(commit);
      }
    });
  }
  
  return grouped;
};

/**
 * Gets all unique commit types that actually exist in the commits
 */
export const getUniqueCommitTypes = (commits: Commit[]): CommitType[] => {
  const types = new Set<CommitType>();
  
  commits.forEach(commit => {
    const analyses = commit.commit_analyses || commit.commit_analises || [];
    
    if (analyses && analyses.length > 0) {
      const type = analyses[0].type;
      if (type) {
        types.add(type as CommitType);
      }
    }
  });
  
  return Array.from(types);
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
    case 'REFACTOR':
      return 'bg-blue-500 text-white';
    case 'DOCS':
      return 'bg-purple-500 text-white';
    default:
      return 'bg-gray-400 text-white';
  }
};

/**
 * Gets the commit type icon
 */
export const getCommitTypeIcon = (type: CommitType) => {
  switch (type) {
    case 'FEATURE':
      return 'sparkles';
    case 'WARNING':
      return 'alert-triangle';
    case 'MILESTONE':
      return 'trophy';
    case 'BUG':
      return 'bug';
    case 'CHORE':
      return 'tool';
    case 'REFACTOR':
      return 'refresh-cw';
    case 'DOCS':
      return 'file-text';
    default:
      return 'git-commit';
  }
};

/**
 * Gets all unique epics from the commits
 */
export const getUniqueEpics = (commits: Commit[]): string[] => {
  const epics = new Set<string>();
  
  commits.forEach(commit => {
    const analyses = commit.commit_analyses || commit.commit_analises || [];
    
    if (analyses && analyses.length > 0) {
      const epic = analyses[0].epic;
      if (epic) {
        epics.add(epic);
      }
    }
  });
  
  return Array.from(epics);
};

/**
 * Gets a color class for an epic
 */
export const getEpicColor = (epic: string): string => {
  // Create a deterministic color based on the epic name
  const colors = [
    'bg-blue-500 text-white',
    'bg-emerald-500 text-white',
    'bg-amber-500 text-white',
    'bg-rose-500 text-white',
    'bg-violet-500 text-white',
    'bg-fuchsia-500 text-white',
    'bg-cyan-500 text-white',
    'bg-lime-500 text-white',
    'bg-orange-500 text-white',
    'bg-indigo-500 text-white',
  ];
  
  // Generate a simple hash from the epic name
  let hash = 0;
  for (let i = 0; i < epic.length; i++) {
    hash = (hash << 5) - hash + epic.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  
  // Get a positive index within the colors array range
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};
