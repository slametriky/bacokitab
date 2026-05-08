import { supabase } from '../lib/supabase.js';

const getAuthHeaders = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session ? { 'x-auth': `Bearer ${session.access_token}` } : {};
};

export const analyzeText = async (text) => {
  try {
    const baseUrl = import.meta.env.VITE_API_BASE_URL;
    const authHeaders = await getAuthHeaders();
    
    const response = await fetch(`${baseUrl}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error analyzing text:', error);
    throw error;
  }
};

export const getWordDetail = async (text) => {
  try {
    const baseUrl = import.meta.env.VITE_API_BASE_URL;
    const authHeaders = await getAuthHeaders();

    const response = await fetch(`${baseUrl}/detail`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting word detail:', error);
    throw error;
  }
};
