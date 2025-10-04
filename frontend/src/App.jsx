import { useState } from 'react'
import FileUpload from './components/FileUpload'
import ImagePreview from './components/ImagePreview'
import AnalysisResults from './components/AnalysisResults'
import RecommendationResults from './components/RecommendationResults'
import LoadingSpinner from './components/LoadingSpinner'
import { analyzeAndRecommend } from './services/api'

function App() {
  const [uploadedFile, setUploadedFile] = useState(null)
  const [fileId, setFileId] = useState(null)
  const [analysisData, setAnalysisData] = useState(null)
  const [recommendations, setRecommendations] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [currentStep, setCurrentStep] = useState('upload') // upload, preview, analysis, results

  const handleFileUpload = (file, id) => {
    setUploadedFile(file)
    setFileId(id)
    setCurrentStep('preview')
    setError(null)
  }

  const handleAnalyze = async () => {
    if (!fileId) return

    setLoading(true)
    setError(null)
    setCurrentStep('analysis')

    try {
      const result = await analyzeAndRecommend(fileId)
      setAnalysisData(result.analysis)
      setRecommendations(result.recommendations)
      setCurrentStep('results')
    } catch (err) {
      console.error('Analysis failed:', err)
      setError(err.message || 'Analysis failed. Please try again.')
      setCurrentStep('preview')
    } finally {
      setLoading(false)
    }
  }

  const handleStartOver = () => {
    setUploadedFile(null)
    setFileId(null)
    setAnalysisData(null)
    setRecommendations(null)
    setError(null)
    setCurrentStep('upload')
  }

  const handleExportPDF = () => {
    // TODO: Implement PDF export
    alert('PDF export feature coming soon!')
  }

  const handlePremiumUpgrade = () => {
    // TODO: Implement Stripe checkout
    alert('Premium upgrade coming soon!')
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            ✨ GlamAI
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            AI-powered makeup recommendations tailored to your unique features.
            Upload a selfie and discover your perfect look!
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-center">{error}</p>
          </div>
        )}

        {/* Main Content */}
        <div className="space-y-8">
          {/* Step 1: File Upload */}
          {currentStep === 'upload' && (
            <div className="card animate-fade-in">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
                📸 Upload Your Selfie
              </h2>
              <FileUpload onFileUpload={handleFileUpload} />
            </div>
          )}

          {/* Step 2: Preview & Analyze */}
          {currentStep === 'preview' && uploadedFile && (
            <div className="card animate-slide-up">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
                Preview & Analyze
              </h2>
              <ImagePreview
                file={uploadedFile}
                onAnalyze={handleAnalyze}
                onStartOver={handleStartOver}
              />
            </div>
          )}

          {/* Step 3: Analysis in Progress */}
          {currentStep === 'analysis' && loading && (
            <div className="card text-center animate-fade-in">
              <LoadingSpinner />
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Analyzing Your Features...
              </h2>
              <p className="text-gray-600">
                Our AI is studying your facial features and determining the best makeup recommendations for you.
              </p>
            </div>
          )}

          {/* Step 4: Results */}
          {currentStep === 'results' && analysisData && recommendations && (
            <div className="space-y-8 animate-slide-up">
              {/* Analysis Results */}
              <div className="card">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
                  🔍 Your Facial Analysis
                </h2>
                <AnalysisResults data={analysisData} />
              </div>

              {/* Recommendations */}
              <div className="card">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
                  💄 Personalized Makeup Recommendations
                </h2>
                <RecommendationResults
                  recommendations={recommendations}
                  onExportPDF={handleExportPDF}
                  onPremiumUpgrade={handlePremiumUpgrade}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={handleStartOver}
                  className="btn-secondary"
                >
                  📸 Try Another Photo
                </button>
                <button
                  onClick={handleExportPDF}
                  className="btn-primary"
                >
                  📄 Export to PDF
                </button>
                <button
                  onClick={handlePremiumUpgrade}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg"
                >
                  ✨ Upgrade to Premium
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-16 text-center text-gray-500 text-sm">
          <p>Made with ❤️ using Claude AI • MediaPipe • React</p>
        </div>
      </div>
    </div>
  )
}

export default App
