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

export const sendChatMessage = async (text) => {
  try {
    const baseUrl = import.meta.env.VITE_API_BASE_URL;
    const authHeaders = await getAuthHeaders();

    const response = await fetch(`${baseUrl}/chat`, {
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

    // Since the n8n response could be plain text or JSON, we handle both
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      // Handle array or object structure depending on n8n output
      if (Array.isArray(data) && data.length > 0 && data[0].output) return data[0].output;
      if (data.output) return data.output;
      if (data.text) return data.text;
      return JSON.stringify(data);
    } else {
      return await response.text();
    }
  } catch (error) {
    console.error('Error sending chat message:', error);
    throw error;
  }
};
