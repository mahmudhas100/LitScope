const LoadingSpinner = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <div className="text-xl font-semibold text-gray-700">Loading LitScope...</div>
        <div className="text-sm text-gray-500">Please Wait</div>
      </div>
    </div>
  )
}

export default LoadingSpinner
