import Link from 'next/link'
import { Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-900">
      <div className="w-full max-w-md text-center space-y-6">
        {/* 404 Icon */}
        <div className="mx-auto w-20 h-20 bg-blue-900/20 rounded-full flex items-center justify-center">
          <span className="text-3xl font-bold text-blue-400">404</span>
        </div>
        
        {/* Error Message */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white">
            Page Not Found
          </h2>
          <p className="text-gray-300">
            The page you are looking for doesn't exist or has been moved.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link
            href="/"
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Home className="h-4 w-4" />
            Go Home
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-800 text-gray-300 rounded-md hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </button>
        </div>
      </div>
    </div>
  )
}