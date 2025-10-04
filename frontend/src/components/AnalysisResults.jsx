const AnalysisResults = ({ data }) => {
  const formatPercentage = (value) => {
    return `${Math.round(value * 100)}%`
  }

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-50'
    if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-50'
    return 'text-red-600 bg-red-50'
  }

  const getFeatureDescription = (feature, value) => {
    switch (feature) {
      case 'eye_distance_ratio':
        if (value < 0.3) return 'Close-set eyes'
        if (value > 0.4) return 'Wide-set eyes'
        return 'Perfectly spaced eyes'

      case 'lip_thickness_ratio':
        if (value < 0.02) return 'Thin lips'
        if (value > 0.04) return 'Full lips'
        return 'Medium lips'

      case 'nose_width_ratio':
        if (value < 0.2) return 'Narrow nose'
        if (value > 0.3) return 'Wide nose'
        return 'Proportionate nose'

      case 'face_symmetry':
        if (value >= 0.9) return 'Highly symmetrical'
        if (value >= 0.7) return 'Good symmetry'
        return 'Slight asymmetry'

      case 'eyebrow_arch_height':
        if (value < 0.4) return 'Low arch'
        if (value > 0.7) return 'High arch'
        return 'Medium arch'

      default:
        return `${formatPercentage(value)}`
    }
  }

  return (
    <div className="space-y-6">
      {/* Main Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
          <div className="text-2xl mb-2">👤</div>
          <h3 className="font-semibold text-gray-900">Face Shape</h3>
          <p className="text-purple-700 font-medium capitalize">{data.face_shape}</p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <div className="text-2xl mb-2">👁️</div>
          <h3 className="font-semibold text-gray-900">Eye Type</h3>
          <p className="text-blue-700 font-medium capitalize">{data.eye_type}</p>
        </div>

        <div className="bg-pink-50 border border-pink-200 rounded-lg p-4 text-center">
          <div className="text-2xl mb-2">🎨</div>
          <h3 className="font-semibold text-gray-900">Skin Tone</h3>
          <p className="text-pink-700 font-medium capitalize">{data.skin_tone}</p>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
          <div className="text-2xl mb-2">🌡️</div>
          <h3 className="font-semibold text-gray-900">Undertone</h3>
          <p className="text-orange-700 font-medium capitalize">{data.undertone}</p>
        </div>
      </div>

      {/* Detailed Measurements */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📏 Detailed Measurements</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Eye Distance */}
          <div className="bg-white rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Eye Spacing</span>
              <span className="text-sm text-gray-600">{formatPercentage(data.eye_distance_ratio)}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${data.eye_distance_ratio * 100}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-600 mt-1">
              {getFeatureDescription('eye_distance_ratio', data.eye_distance_ratio)}
            </p>
          </div>

          {/* Lip Thickness */}
          <div className="bg-white rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Lip Fullness</span>
              <span className="text-sm text-gray-600">{formatPercentage(data.lip_thickness_ratio)}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-pink-600 h-2 rounded-full"
                style={{ width: `${data.lip_thickness_ratio * 100}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-600 mt-1">
              {getFeatureDescription('lip_thickness_ratio', data.lip_thickness_ratio)}
            </p>
          </div>

          {/* Nose Width */}
          <div className="bg-white rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Nose Width</span>
              <span className="text-sm text-gray-600">{formatPercentage(data.nose_width_ratio)}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-purple-600 h-2 rounded-full"
                style={{ width: `${data.nose_width_ratio * 100}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-600 mt-1">
              {getFeatureDescription('nose_width_ratio', data.nose_width_ratio)}
            </p>
          </div>

          {/* Face Symmetry */}
          <div className="bg-white rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Symmetry</span>
              <span className="text-sm text-gray-600">{formatPercentage(data.face_symmetry)}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full"
                style={{ width: `${data.face_symmetry * 100}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-600 mt-1">
              {getFeatureDescription('face_symmetry', data.face_symmetry)}
            </p>
          </div>
        </div>
      </div>

      {/* Additional Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-2">✨ Special Features</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Prominent Cheekbones</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                data.has_prominent_cheekbones
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {data.has_prominent_cheekbones ? 'Yes' : 'No'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Eyebrow Arch</span>
              <span className="text-sm text-gray-600">
                {getFeatureDescription('eyebrow_arch_height', data.eyebrow_arch_height)}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-2">🎯 Analysis Quality</h4>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Confidence Score</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(data.analysis_confidence)}`}>
              {formatPercentage(data.analysis_confidence)}
            </span>
          </div>
          <p className="text-xs text-gray-600 mt-2">
            {data.analysis_confidence >= 0.8
              ? 'Excellent image quality for analysis'
              : data.analysis_confidence >= 0.6
              ? 'Good image quality, reliable results'
              : 'Lower confidence - consider retaking photo'
            }
          </p>
        </div>
      </div>
    </div>
  )
}

export default AnalysisResults