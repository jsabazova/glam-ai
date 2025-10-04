import { useState, useEffect } from 'react'

const ImagePreview = ({ file, onAnalyze, onStartOver }) => {
  const [imageUrl, setImageUrl] = useState(null)

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file)
      setImageUrl(url)

      // Cleanup URL when component unmounts
      return () => {
        URL.revokeObjectURL(url)
      }
    }
  }, [file])

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Image Preview */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Image */}
        <div className="flex-1">
          <div className="relative bg-gray-100 rounded-lg overflow-hidden">
            {imageUrl && (
              <img
                src={imageUrl}
                alt="Uploaded selfie preview"
                className="w-full h-auto max-h-96 object-contain mx-auto"
              />
            )}
          </div>
        </div>

        {/* File Info */}
        <div className="flex-shrink-0 lg:w-64">
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-gray-900">📋 File Details</h3>

            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-600">Name:</span>
                <p className="font-medium text-gray-900 truncate" title={file?.name}>
                  {file?.name}
                </p>
              </div>

              <div>
                <span className="text-gray-600">Size:</span>
                <p className="font-medium text-gray-900">
                  {file ? formatFileSize(file.size) : '0 Bytes'}
                </p>
              </div>

              <div>
                <span className="text-gray-600">Type:</span>
                <p className="font-medium text-gray-900">
                  {file?.type || 'Unknown'}
                </p>
              </div>
            </div>

            {/* Analysis Preview */}
            <div className="pt-3 border-t border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-2">🔍 What we'll analyze:</h4>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• Face shape and proportions</li>
                <li>• Eye shape and size</li>
                <li>• Skin tone and undertones</li>
                <li>• Facial symmetry</li>
                <li>• Lip shape and fullness</li>
                <li>• Cheekbone prominence</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={onStartOver}
          className="btn-secondary"
        >
          ← Choose Different Photo
        </button>

        <button
          onClick={onAnalyze}
          className="btn-primary"
        >
          ✨ Analyze & Get Recommendations
        </button>
      </div>

      {/* Privacy Notice */}
      <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-start space-x-2">
          <div className="text-green-600 mt-0.5">🔒</div>
          <div>
            <h4 className="font-semibold text-green-900">Privacy Protected</h4>
            <p className="text-sm text-green-800 mt-1">
              Your photo is processed securely and automatically deleted after analysis.
              We never store your images or share them with third parties.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ImagePreview