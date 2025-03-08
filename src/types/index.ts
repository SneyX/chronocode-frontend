// Commit Types
export type CommitType = 'FEATURE' | 'WARNING' | 'MILESTONE' | 'BUG' | 'CHORE';

// Commit Analysis
export interface CommitAnalysis {
  id: string;
  created_at: string;
  repo_name: string;
  title: string;
  idea: string;
  description: string;
  commit_sha: string;
  type: CommitType;
}

// Commit
export interface Commit {
  sha: string;
  created_at: string;
  repo_name: string;
  author: string;
  author_url: string;
  author_email: string;
  date: string;
  message: string;
  url: string;
  description: string;
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
}

// Timeline View Options
export type TimeScale = 'day' | 'week' | 'month' | 'quarter' | 'year';
export type GroupBy = 'type' | 'author' | 'date';

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
