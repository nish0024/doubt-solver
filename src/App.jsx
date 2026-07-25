import { useState, useRef, useEffect } from 'react'
import { solveDoubt } from './aiService'
import './App.css'

function App() {
  const [isHindi, setIsHindi] = useState(true)
  const [selectedImage, setSelectedImage] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [answer, setAnswer] = useState(null)
  const [history, setHistory] = useState([])
  const [isSpeaking, setIsSpeaking] = useState(false)
  
  const fileInputRef = useRef(null)

  useEffect(() => {
    // Load history from local storage on mount
    const saved = localStorage.getItem('doubt_history')
    if (saved) {
      try {
        setHistory(JSON.parse(saved))
      } catch (e) {
        console.error('Failed to parse history', e)
      }
    }
  }, [])

  const saveToHistory = (item) => {
    const newHistory = [item, ...history].slice(0, 10); // keep last 10
    setHistory(newHistory)
    localStorage.setItem('doubt_history', JSON.stringify(newHistory))
  }

  const toggleLanguage = () => setIsHindi(!isHindi)

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setSelectedImage(reader.result)
        setAnswer(null) 
        stopSpeaking()
      }
      reader.readAsDataURL(file)
    }
  }

  const resetImage = () => {
    setSelectedImage(null)
    setAnswer(null)
    stopSpeaking()
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSolve = async () => {
    if (!selectedImage) return;
    
    setIsLoading(true)
    try {
      const result = await solveDoubt(selectedImage)
      setAnswer(result)
      saveToHistory({
        id: Date.now(),
        image: selectedImage,
        answer: result,
        timestamp: new Date().toLocaleDateString()
      })
    } catch (error) {
      alert(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const loadFromHistory = (item) => {
    setSelectedImage(item.image)
    setAnswer(item.answer)
    stopSpeaking()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const speak = (text) => {
    if ('speechSynthesis' in window) {
      if (isSpeaking) {
        stopSpeaking();
        return;
      }
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = isHindi ? 'hi-IN' : 'en-IN';
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Text-to-speech is not supported in your browser.");
    }
  }

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }

  const formatText = (text) => {
    if (!text) return null;
    return text.split('\n').map((line, idx) => (
      <p key={idx} style={{ marginBottom: '8px' }}>{line}</p>
    ));
  }

  return (
    <div className="app-container">
      <div className="language-toggle">
        <button onClick={toggleLanguage}>
          {isHindi ? 'Switch to English' : 'हिंदी में देखें'}
        </button>
      </div>
      
      <header className="header">
        <h1>{isHindi ? 'डब्ट सॉल्वर' : 'Doubt Solver'}</h1>
        <p>{isHindi ? 'क्लास 6 होमवर्क हेल्प' : 'Class 6 Homework Help'}</p>
      </header>

      <main className="main-content">
        {!selectedImage ? (
          <>
            <div className="upload-container">
              <input
                type="file"
                accept="image/*"
                capture="environment"
                id="camera-input"
                onChange={handleImageChange}
                ref={fileInputRef}
                style={{ display: 'none' }}
              />
              <label htmlFor="camera-input" className="btn-primary">
                <span className="icon">📷</span>
                {isHindi ? 'फ़ोटो खींचें' : 'Take a photo'}
              </label>
            </div>

            {history.length > 0 && (
              <div className="history-section">
                <h2>{isHindi ? 'पुराने सवाल' : 'Recent Doubts'}</h2>
                <div className="history-list">
                  {history.map(item => (
                    <div key={item.id} className="history-item" onClick={() => loadFromHistory(item)}>
                      <img src={item.image} alt="past doubt" />
                      <div className="history-details">
                        <p className="history-date">{item.timestamp}</p>
                        <p className="history-snippet">
                          {isHindi ? item.answer.hindi.substring(0, 40) : item.answer.english.substring(0, 40)}...
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="preview-container">
            <img src={selectedImage} alt="Selected doubt" className="image-preview" />
            
            {!answer && !isLoading && (
              <div className="action-buttons">
                <button className="btn-secondary" onClick={resetImage}>
                  {isHindi ? 'फिर से खींचें' : 'Retake'}
                </button>
                <button className="btn-primary" onClick={handleSolve}>
                  {isHindi ? 'उत्तर दिखाएं' : 'Show Answer'}
                </button>
              </div>
            )}

            {isLoading && (
              <div className="loading-state">
                <p className="loading-text">
                  {isHindi ? 'कृपया प्रतीक्षा करें, उत्तर तैयार हो रहा है...' : 'Please wait, preparing the answer...'}
                </p>
                <div className="spinner"></div>
              </div>
            )}

            {answer && !isLoading && (
              <div className="answer-container">
                <div className="answer-header">
                  <button 
                    className={`btn-tts ${isSpeaking ? 'speaking' : ''}`}
                    onClick={() => speak(isHindi ? answer.hindi : answer.english)}
                  >
                    🔊 {isSpeaking ? (isHindi ? 'रोकें' : 'Stop') : (isHindi ? 'सुनें' : 'Read Aloud')}
                  </button>
                </div>
                
                <div className="answer-content">
                  {isHindi ? formatText(answer.hindi) : formatText(answer.english)}
                </div>
                
                <button className="btn-secondary" onClick={resetImage} style={{ marginTop: '20px' }}>
                  {isHindi ? 'अगला सवाल पूछें' : 'Ask another doubt'}
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

export default App
