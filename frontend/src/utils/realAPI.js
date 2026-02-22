// frontend/src/utils/realAPI.js

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export const startSession = async (userEmail, images) => {
  // images are already base64 strings or Blobs that need to be converted to base64
  const base64Images = await Promise.all(images.map(async (img) => {
    if (typeof img === 'string') return img;
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result.split(',')[1]);
      reader.readAsDataURL(img);
    });
  }));

  const response = await fetch(`${API_BASE_URL}/start-session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_email: userEmail, images: base64Images })
  });

  if (!response.ok) throw new Error('Failed to start session');
  const data = await response.json();
  return { ...data, user_email: userEmail };
};

export const generateBiography = async (sessionId) => {
  const response = await fetch(`${API_BASE_URL}/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id: sessionId })
  });
  if (!response.ok) throw new Error('Failed to generate biography');
  return response.json();
};

export const getPdfStatus = async (sessionId) => {
  const response = await fetch(`${API_BASE_URL}/pdf-status/${sessionId}`);
  if (!response.ok) throw new Error('Failed to check PDF status');
  return response.json();
};

export const sendEmail = async (sessionId) => {
  const response = await fetch(`${API_BASE_URL}/send-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id: sessionId })
  });
  if (!response.ok) throw new Error('Failed to send email');
  return response.json();
};
