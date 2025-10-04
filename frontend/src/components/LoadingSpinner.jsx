const LoadingSpinner = () => {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      {/* Spinner */}
      <div className="relative">
        {/* Outer ring */}
        <div className="w-16 h-16 border-4 border-primary-200 rounded-full"></div>
        {/* Spinning ring */}
        <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-primary-600 rounded-full animate-spin"></div>
      </div>

      {/* Loading dots */}
      <div className="flex space-x-1 mt-4">
        <div className="w-2 h-2 bg-primary-600 rounded-full animate-pulse"></div>
        <div className="w-2 h-2 bg-primary-600 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
        <div className="w-2 h-2 bg-primary-600 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
      </div>

      {/* Loading text */}
      <div className="mt-4 text-center">
        <p className="text-gray-600 animate-pulse">
          AI is working its magic...
        </p>
      </div>
    </div>
  )
}

export default LoadingSpinner