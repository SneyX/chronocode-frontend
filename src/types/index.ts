
// Commit Types
export type CommitType = 'FEATURE' | 'WARNING' | 'MILESTONE' | 'BUG' | 'CHORE';

// Repository
export interface Repository {
  id: number;
  created_at: string;
  name: string;
  url: string;
}

// Commit Analysis
export interface CommitAnalysis {
  id: number;
  created_at: string;
  title: string;
  idea: string;
  description: string;
  commit_sha: string;
  type: CommitType;
  epic?: string; // Field for epic categorization
  files?: any; // JSON field for file information
}

// Commit
export interface Commit {
  sha: string;
  created_at: string;
  author: string;
  author_url: string;
  author_email: string;
  date: string;
  message: string;
  url: string;
  description: string;
  repo_id: number;
  files?: any; // JSON field for file information
  // Support both property names for backward compatibility
  commit_analyses?: CommitAnalysis[];
  commit_analises?: CommitAnalysis[];
}

// Repository Input
export interface RepositoryInput {
  url: string;
}

// Timeline Filters
export interface TimelineFilters {
  types: CommitType[];
  authors: string[];
  dateRange: {
    from: Date | null;
    to: Date | null;
  };
  searchTerm: string;
  epics: string[]; // Filter for epics
}

// Timeline View Options
export type TimeScale = 'day' | 'week' | 'month' | 'quarter' | 'year';
export type GroupBy = 'type' | 'author' | 'date' | 'epic'; // 'epic' as a grouping option

export interface TimelineViewOptions {
  timeScale: TimeScale;
  groupBy: GroupBy;
}

// API Response
export interface ApiResponse<T> {
  data: T;
  error: string | null;
  loading: boolean;
}
