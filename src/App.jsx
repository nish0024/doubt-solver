import { useState, useRef, useEffect } from 'react'
import { solveDoubt } from './aiService'
import Visualizer from './Visualizer'
import './App.css'

function App() {
  const [isHindi, setIsHindi] = useState(true)
  const [selectedImage, setSelectedImage] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  
  // answer is now a structured JSON object
  const [answer, setAnswer] = useState(null)
  const [history, setHistory] = useState([])
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [currentStepIndex, setCurrentStepIndex] = useState(-1)
  
  const fileInputRef = useRef(null)

  useEffect(() => {
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
    const newHistory = [item, ...history].slice(0, 10);
    setHistory(newHistory)
    localStorage.setItem('doubt_history', JSON.stringify(newHistory))
  }

  const toggleLanguage = () => {
    setIsHindi(!isHindi)
    stopSpeaking()
  }

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
      // By default show all steps if not speaking
      setCurrentStepIndex(result.steps ? result.steps.length - 1 : -1)
      
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
    setCurrentStepIndex(item.answer.steps ? item.answer.steps.length - 1 : -1)
    stopSpeaking()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const speak = () => {
    if (!('speechSynthesis' in window)) {
      alert("Text-to-speech is not supported in your browser.");
      return;
    }

    if (isSpeaking) {
      stopSpeaking();
      // Show all steps if stopped manually
      setCurrentStepIndex(answer.steps.length - 1);
      return;
    }
    
    window.speechSynthesis.cancel();
    setIsSpeaking(true);
    setCurrentStepIndex(-1); // Hide everything initially

    const lang = isHindi ? 'hi-IN' : 'en-IN';
    
    // Create an utterance for the summary
    const summaryText = isHindi ? answer.summaryHindi : answer.summaryEnglish;
    const utterances = [];

    if (summaryText) {
      const u = new SpeechSynthesisUtterance(summaryText);
      u.lang = lang;
      u.onstart = () => setCurrentStepIndex(-1); // -1 means only summary is shown
      utterances.push(u);
    }

    // Create utterances for each step
    if (answer.steps && answer.steps.length > 0) {
      answer.steps.forEach((step, index) => {
        const text = isHindi ? step.hindiText : step.englishText;
        if (text) {
          const u = new SpeechSynthesisUtterance(text);
          u.lang = lang;
          u.onstart = () => setCurrentStepIndex(index);
          // When the very last utterance finishes, reset state
          if (index === answer.steps.length - 1) {
            u.onend = () => setIsSpeaking(false);
          }
          utterances.push(u);
        }
      });
    }

    utterances.forEach(u => {
      u.onerror = (e) => {
        console.error("Speech error", e);
        setIsSpeaking(false);
      }
      window.speechSynthesis.speak(u);
    });
  }

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }

  // Fallback for older history format (which was raw string)
  const isOldHistoryFormat = answer && answer.hindi && typeof answer.hindi === 'string';

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
                          {isHindi 
                            ? (item.answer.summaryHindi || (item.answer.hindi && item.answer.hindi.substring(0, 40))) 
                            : (item.answer.summaryEnglish || (item.answer.english && item.answer.english.substring(0, 40)))}...
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
                {isOldHistoryFormat ? (
                  // Handle old history structure
                  <div className="answer-content">
                    <p style={{color: 'red', fontSize: '0.9rem'}}>Legacy Answer Format</p>
                    {isHindi ? answer.hindi : answer.english}
                  </div>
                ) : (
                  // Handle new JSON structure
                  <>
                    <div className="answer-header">
                      <button 
                        className={`btn-tts ${isSpeaking ? 'speaking' : ''}`}
                        onClick={speak}
                      >
                        🔊 {isSpeaking ? (isHindi ? 'रोकें' : 'Stop') : (isHindi ? 'सुनें' : 'Read Aloud')}
                      </button>
                    </div>
                    
                    <div className="answer-content">
                      <h3 className="answer-summary">
                        {isHindi ? answer.summaryHindi : answer.summaryEnglish}
                      </h3>
                      
                      {answer.steps && answer.steps.map((step, idx) => {
                        const isVisible = idx <= currentStepIndex;
                        const isActive = idx === currentStepIndex;
                        
                        if (!isVisible) return null;
                        
                        return (
                          <div key={idx} className={`step-container ${isActive ? 'active-step' : ''}`}>
                            <p className="step-text">
                              <strong>{idx + 1}.</strong> {isHindi ? step.hindiText : step.englishText}
                            </p>
                            <Visualizer 
                              visualType={step.visualType} 
                              visualData={step.visualData} 
                              isActive={isActive || (!isSpeaking && isVisible)} 
                            />
                          </div>
                        )
                      })}
                    </div>
                  </>
                )}
                
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
