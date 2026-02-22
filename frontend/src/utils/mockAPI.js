// frontend/src/utils/mockAPI.js

export const startSession = async (userEmail, images) => {
  console.log("Mock: Starting session for", userEmail, "with", images.length, "images");
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  return {
    session_id: "mock-session-id-" + Math.random().toString(36).substr(2, 9),
    websocket_url: "wss://echo.websocket.org", // Use echo for mock testing
    user_email: userEmail
  };
};

export const generateBiography = async (sessionId) => {
  console.log("Mock: Generating biography for", sessionId);
  await new Promise(resolve => setTimeout(resolve, 500));
  return { status: "processing" };
};

export const getPdfStatus = async (sessionId) => {
  console.log("Mock: Checking PDF status for", sessionId);
  await new Promise(resolve => setTimeout(resolve, 500));
  return {
    ready: true,
    url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
  };
};

export const sendEmail = async (sessionId) => {
  console.log("Mock: Sending email for", sessionId);
  await new Promise(resolve => setTimeout(resolve, 500));
  return { success: true };
};
