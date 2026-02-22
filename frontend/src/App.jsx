import React, { useState } from 'react'
import UploadScreen from './components/UploadScreen'
import InterviewScreen from './components/InterviewScreen'
import LoadingScreen from './components/LoadingScreen'
import PreviewScreen from './components/PreviewScreen'

function App() {
  const [currentScreen, setCurrentScreen] = useState('upload')
  const [sessionData, setSessionData] = useState(null)

  const handleStartInterview = (data) => {
    setSessionData(data)
    setCurrentScreen('interview')
  }

  const handleFinishInterview = () => {
    setCurrentScreen('loading')
  }

  const handleLoadingComplete = () => {
    setCurrentScreen('preview')
  }

  return (
    <div className="min-h-screen bg-memento-cream">
      {currentScreen === 'upload' && (
        <UploadScreen onStart={handleStartInterview} />
      )}
      {currentScreen === 'interview' && (
        <InterviewScreen
          sessionId={sessionData?.session_id}
          wsUrl={sessionData?.websocket_url}
          onFinish={handleFinishInterview}
        />
      )}
      {currentScreen === 'loading' && (
        <LoadingScreen onComplete={handleLoadingComplete} />
      )}
      {currentScreen === 'preview' && (
        <PreviewScreen
          sessionId={sessionData?.session_id}
          userEmail={sessionData?.user_email}
        />
      )}
    </div>
  )
}

export default App
