import { useState } from 'react'

const RecommendationResults = ({ recommendations, onExportPDF, onPremiumUpgrade }) => {
  const [activeTab, setActiveTab] = useState(0)

  const difficultyColors = {
    'Beginner': 'bg-green-100 text-green-800',
    'Intermediate': 'bg-yellow-100 text-yellow-800',
    'Advanced': 'bg-red-100 text-red-800'
  }

  return (
    <div className="space-y-8">
      {/* Makeup Looks Tabs */}
      <div>
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {recommendations.recommended_looks.map((look, index) => (
              <button
                key={index}
                onClick={() => setActiveTab(index)}
                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === index
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                ✨ {look.look_name}
              </button>
            ))}
          </nav>
        </div>

        {/* Active Look Details */}
        <div className="mt-6">
          {recommendations.recommended_looks.map((look, index) => (
            <div
              key={index}
              className={`${activeTab === index ? 'block' : 'hidden'} space-y-6`}
            >
              {/* Look Header */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{look.look_name}</h3>
                    <p className="text-gray-700">{look.description}</p>
                  </div>
                  <div className="mt-4 md:mt-0 flex flex-col items-start md:items-end space-y-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${difficultyColors[look.difficulty_level] || 'bg-gray-100 text-gray-800'}`}>
                      {look.difficulty_level}
                    </span>
                    <span className="text-sm text-gray-600">👑 {look.occasion}</span>
                  </div>
                </div>
              </div>

              {/* Makeup Instructions Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Foundation */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    🏺 Foundation
                  </h4>
                  <ul className="space-y-1 text-sm text-gray-700">
                    {look.foundation_tips.map((tip, i) => (
                      <li key={i} className="flex items-start">
                        <span className="text-primary-500 mr-2">•</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Contouring */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    🎨 Contouring
                  </h4>
                  <ul className="space-y-1 text-sm text-gray-700">
                    {look.contour_tips.map((tip, i) => (
                      <li key={i} className="flex items-start">
                        <span className="text-primary-500 mr-2">•</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Eyes */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    👁️ Eyes
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-gray-900">Eyeshadow Colors:</span>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {look.eyeshadow_colors.map((color, i) => (
                          <span key={i} className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                            {color}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-900">Eyeliner:</span>
                      <p className="text-sm text-gray-700">{look.eyeliner_style}</p>
                    </div>
                  </div>
                </div>

                {/* Lips */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    💋 Lips
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-gray-900">Recommended Colors:</span>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {look.lip_colors.map((color, i) => (
                          <span key={i} className="px-2 py-1 bg-pink-100 text-pink-800 text-xs rounded-full">
                            {color}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Blush */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    🌸 Blush
                  </h4>
                  <p className="text-sm text-gray-700">{look.blush_placement}</p>
                </div>

                {/* Things to Avoid */}
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-semibold text-red-900 mb-3 flex items-center">
                    ⚠️ Avoid
                  </h4>
                  <ul className="space-y-1 text-sm text-red-700">
                    {look.avoid.map((item, i) => (
                      <li key={i} className="flex items-start">
                        <span className="text-red-500 mr-2">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* General Tips Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">💡 Personalized Tips for You</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Face Shape Tips */}
          <div>
            <h4 className="font-semibold text-blue-900 mb-2">Face Shape</h4>
            <ul className="space-y-1 text-sm text-blue-800">
              {recommendations.face_shape_tips.map((tip, i) => (
                <li key={i} className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          {/* Eye Shape Tips */}
          <div>
            <h4 className="font-semibold text-blue-900 mb-2">Eye Shape</h4>
            <ul className="space-y-1 text-sm text-blue-800">
              {recommendations.eye_shape_tips.map((tip, i) => (
                <li key={i} className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          {/* Skin Tone Tips */}
          <div>
            <h4 className="font-semibold text-blue-900 mb-2">Skin Tone</h4>
            <ul className="space-y-1 text-sm text-blue-800">
              {recommendations.skin_tone_tips.map((tip, i) => (
                <li key={i} className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Color Palette */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">🎨 Your Personal Color Palette</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(recommendations.color_palette).map(([category, colors]) => (
            <div key={category} className="text-center">
              <h4 className="font-semibold text-gray-900 mb-2 capitalize">{category}</h4>
              <div className="space-y-1">
                {colors.map((color, i) => (
                  <div key={i} className="px-3 py-2 bg-gray-100 rounded-lg text-sm text-gray-700">
                    {color}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tools & Priority Tip */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recommended Tools */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-900 mb-4">🛠️ Recommended Tools</h3>
          <div className="grid grid-cols-2 gap-2">
            {recommendations.recommended_tools.map((tool, i) => (
              <div key={i} className="px-3 py-2 bg-white rounded-lg text-sm text-gray-700 text-center">
                {tool}
              </div>
            ))}
          </div>
        </div>

        {/* Top Priority Tip */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-green-900 mb-4">⭐ Top Priority</h3>
          <p className="text-green-800 font-medium">{recommendations.top_priority_tip}</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6 border-t border-gray-200">
        <button
          onClick={onExportPDF}
          className="btn-primary"
        >
          📄 Export Recommendations
        </button>
        <button
          onClick={onPremiumUpgrade}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg"
        >
          ✨ Get Premium Features
        </button>
      </div>
    </div>
  )
}

export default RecommendationResults