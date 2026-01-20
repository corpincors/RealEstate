import { API_BASE_URL } from '../config';

export const getImageUrl = (url: string | undefined): string => {
  if (!url) return 'https://via.placeholder.com/800x600?text=No+Image';
  if (url.startsWith('data:') || url.startsWith('http') || url.startsWith('blob:')) return url;
  
  // Ensure no double slashes if API_BASE_URL ends with /
  const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
  const cleanUrl = url.startsWith('/') ? url : `/${url}`;
  
  return `${baseUrl}${cleanUrl}`;
};
