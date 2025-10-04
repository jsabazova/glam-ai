import { useState, useRef } from 'react'
import { uploadFile } from '../services/api'

const FileUpload = ({ onFileUpload }) => {
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)
  const fileInputRef = useRef(null)

  const validateFile = (file) => {
    // Check file type
    if (!file.type.startsWith('image/')) {
      throw new Error('Please select an image file')
    }

    // Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      throw new Error('File size must be less than 10MB')
    }

    return true
  }

  const handleFileUpload = async (file) => {
    try {
      validateFile(file)
      setUploading(true)
      setError(null)

      const response = await uploadFile(file)
      onFileUpload(file, response.file_id)
    } catch (err) {
      console.error('Upload error:', err)
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = async (e) => {
    e.preventDefault()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      await handleFileUpload(files[0])
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files)
    if (files.length > 0) {
      await handleFileUpload(files[0])
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Privacy Notice */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <svg className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h4 className="text-green-800 font-semibold flex items-center">
              🔒 Privacy Protected
            </h4>
            <p className="text-green-700 text-sm mt-1">
              Your photos are analyzed instantly and <strong>deleted immediately</strong> after processing.
              We never store your images or personal data.
            </p>
          </div>
        </div>
      </div>

      {/* Upload Area */}
      <div
        className={`upload-area ${isDragging ? 'dragover' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={uploading}
        />

        {uploading ? (
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mb-4"></div>
            <p className="text-gray-600">Uploading your photo...</p>
          </div>
        ) : (
          <div className="text-center">
            <div className="text-4xl mb-4">📸</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Upload Your Selfie
            </h3>
            <p className="text-gray-600 mb-4">
              Drag and drop your photo here, or click to browse
            </p>
            <div className="text-sm text-gray-500 space-y-1">
              <p>• Accepted formats: JPG, PNG, WEBP</p>
              <p>• Maximum size: 10MB</p>
              <p>• Best results with clear, well-lit selfies</p>
            </div>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm text-center">{error}</p>
        </div>
      )}

      {/* Tips */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-semibold text-blue-900 mb-2">📝 Tips for Best Results:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Use natural lighting when possible</li>
          <li>• Face the camera directly</li>
          <li>• Remove sunglasses or hats</li>
          <li>• Choose a photo with minimal existing makeup</li>
        </ul>
      </div>
    </div>
  )
}

export default FileUpload