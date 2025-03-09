
import { createClient } from '@supabase/supabase-js';
import { Commit, Repository } from '@/types';

const supabaseUrl = "https://hdsvnvynqrkuqpjdathj.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhkc3ZudnlucXJrdXFwamRhdGhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAwMDg5OTAsImV4cCI6MjA1NTU4NDk5MH0.SPwd6UMuPayyAsIBsJ7P9-3sEX52SWXJnafBgydgGZ4";

export const supabase = createClient(supabaseUrl, supabaseKey);

export const fetchCommitsForRepo = async (repoName: string): Promise<Commit[]> => {
  try {
    console.log('Fetching commits for repo:', repoName);
    
    // First find the repository ID
    const { data: repositories, error: repoError } = await supabase
      .from('repositories')
      .select('*')
      .eq('name', repoName)
      .limit(1);
    
    if (repoError) {
      console.error('Supabase error finding repository:', repoError);
      throw repoError;
    }
    
    if (!repositories || repositories.length === 0) {
      console.error('Repository not found:', repoName);
      return [];
    }
    
    const repoId = repositories[0].id;
    
    // Then fetch commits using the repo_id
    const { data: commits, error } = await supabase
      .from('commits')
      .select(`
        *,
        commit_analyses(*)
      `)
      .eq('repo_id', repoId);
    
    if (error) {
      console.error('Supabase error fetching commits:', error);
      throw error;
    }
    
    console.log('Commits fetched from Supabase:', commits);
    return commits as Commit[];
  } catch (error) {
    console.error('Error fetching commits:', error);
    throw error;
  }
};

export const checkRepoExists = async (repoName: string): Promise<boolean> => {
  try {
    console.log('Checking if repo exists:', repoName);
    const { count, error } = await supabase
      .from('repositories')
      .select('*', { count: 'exact', head: true })
      .eq('name', repoName);
    
    if (error) {
      console.error('Supabase error checking repository:', error);
      throw error;
    }
    
    console.log('Repo check result:', count);
    return count !== null && count > 0;
  } catch (error) {
    console.error('Error checking if repo exists:', error);
    throw error;
  }
};

export const getRepositoryByName = async (repoName: string): Promise<Repository | null> => {
  try {
    const { data, error } = await supabase
      .from('repositories')
      .select('*')
      .eq('name', repoName)
      .limit(1);
      
    if (error) {
      console.error('Supabase error getting repository:', error);
      throw error;
    }
    
    return data && data.length > 0 ? data[0] as Repository : null;
  } catch (error) {
    console.error('Error getting repository:', error);
    throw error;
  }
};

export const extractRepoNameFromUrl = (url: string): string => {
  // Extract repo name from GitHub URL
  // Handle URLs with or without trailing slashes, .git, and query parameters
  const urlWithoutParams = url.split(/[?#]/)[0]; // Remove query parameters and fragments
  const cleanUrl = urlWithoutParams.replace(/\.git$/, ''); // Remove .git suffix if present
  
  const match = cleanUrl.match(/github\.com\/([^/]+\/[^/]+)/);
  return match ? match[1] : '';
};
