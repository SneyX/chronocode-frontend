
const BACKEND_URL = "http://127.0.0.1:8000";

export interface Repository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
  private: boolean;
}

export const getAuthenticatedUser = async (token: string) => {
  const response = await fetch(`${BACKEND_URL}/github/user`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch user data');
  }
  
  return response.json();
};

export const getUserRepositories = async (token: string) => {
  const response = await fetch(`${BACKEND_URL}/github/repos`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch repositories');
  }
  
  return response.json() as Promise<Repository[]>;
};
