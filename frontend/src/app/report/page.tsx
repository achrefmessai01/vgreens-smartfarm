'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Send, FileText, User, AlertTriangle, CheckCircle, Sparkles, Upload, X, Image } from 'lucide-react'
import Link from 'next/link'
import { CreateErrorReportInput, ReportSeverity } from '@/generated/graphql'
import { useCreateErrorReport } from '@/lib/hooks/use-error-reports'

export default function ReportPage() {
  const router = useRouter()
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    email: '',
    severity: 'medium' as ReportSeverity,
    section: '',
    steps: ''
  })
  const [uploadedImages, setUploadedImages] = useState<File[]>([])
  
  const [createErrorReport, { loading: isSubmitting }] = useCreateErrorReport()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      // For now, we'll just create the report without image uploads
      // Image upload functionality can be added later using the FilesModule
      const input: CreateErrorReportInput = {
        userEmail: formData.email,
        errorTitle: formData.title,
        errorDetails: formData.description,
        severity: formData.severity,
        reproductionSteps: formData.steps,
        expectedVsActual: formData.section,
        browserInfo: navigator.userAgent,
        // attachments: [] // Will be implemented with file upload later
      }
      
      await createErrorReport({
        variables: { input }
      })
      
      setIsSubmitted(true)
      
      // Auto redirect after 3 seconds
      setTimeout(() => {
        router.push('/tenant/dashboard')
      }, 3000)
    } catch (error) {
      console.error('Failed to submit error report:', error)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'))
      setUploadedImages(prev => [...prev, ...imageFiles].slice(0, 3)) // Limit to 3 images
    }
  }

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index))
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-gray-50 dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="relative w-full max-w-md bg-white/90 dark:bg-gray-900/60 backdrop-blur-xl border border-green-200/50 dark:border-green-500/20 rounded-2xl shadow-2xl shadow-green-200/40 dark:shadow-green-500/25 p-8">
          {/* Sparkle decoration */}
          <div className="absolute top-4 right-4">
            <Sparkles className="h-5 w-5 text-green-500 dark:text-green-400 animate-pulse" />
          </div>
          
          <div className="text-center space-y-8">
            {/* Success icon */}
            <div className="relative">
              <div className="mx-auto w-20 h-20 bg-gradient-to-br from-green-100/80 to-green-200/60 dark:from-green-500/20 dark:to-green-600/30 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg border border-green-200/50 dark:border-green-500/20 transform hover:scale-105 transition-transform duration-300">
                <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400 animate-pulse" />
              </div>
              <div className="absolute inset-0 w-20 h-20 mx-auto bg-gradient-to-br from-green-100/80 to-green-200/60 dark:from-green-500/20 dark:to-green-600/30 rounded-2xl blur-xl opacity-30 dark:opacity-50 -z-10"></div>
            </div>
            
            {/* Success message */}
            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white leading-tight">
                Report Submitted!
              </h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed max-w-sm mx-auto">
                Thank you for your report. Our team will review it and get back to you soon.
              </p>
            </div>

            {/* Automatic redirect notice */}
            <div className="text-sm text-gray-500 dark:text-gray-500">
              Redirecting to dashboard in 3 seconds...
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50 dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/tenant/dashboard"
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-6 group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform duration-300" />
            Back to Dashboard
          </Link>
          
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-orange-100/80 to-orange-200/60 dark:from-orange-500/20 dark:to-orange-600/30 rounded-2xl flex items-center justify-center shadow-lg border border-orange-200/50 dark:border-orange-500/20">
              <FileText className="h-8 w-8 text-orange-600 dark:text-orange-400" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Report an Error
            </h1>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
              Help us improve by reporting any issues you've encountered. Your feedback is valuable to us.
            </p>
          </div>
        </div>

        {/* Report Form */}
        <div className="bg-white/90 dark:bg-gray-900/60 backdrop-blur-xl border border-orange-200/50 dark:border-orange-500/20 rounded-2xl shadow-2xl shadow-orange-200/40 dark:shadow-orange-500/25 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Your Email (Optional)
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="your.email@example.com"
                className="w-full px-4 py-3 bg-gray-50/80 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-300/50 dark:border-gray-600/30 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all duration-300"
              />
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                We'll only use this to follow up on your report if needed.
              </p>
            </div>

            {/* Error Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Error Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                placeholder="Brief description of the issue"
                className="w-full px-4 py-3 bg-gray-50/80 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-300/50 dark:border-gray-600/30 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all duration-300"
              />
            </div>

            {/* Severity */}
            <div>
              <label htmlFor="severity" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Severity Level
              </label>
              <select
                id="severity"
                name="severity"
                value={formData.severity}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-50/80 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-300/50 dark:border-gray-600/30 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all duration-300"
              >
                <option value="low">Low - Minor inconvenience</option>
                <option value="medium">Medium - Affects functionality</option>
                <option value="high">High - Blocks important tasks</option>
                <option value="critical">Critical - System unusable</option>
              </select>
            </div>

            {/* Section */}
            <div>
              <label htmlFor="section" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Affected Section
              </label>
              <input
                type="text"
                id="section"
                name="section"
                value={formData.section}
                onChange={handleInputChange}
                placeholder="e.g., Dashboard, Harvest, Farm Overview"
                className="w-full px-4 py-3 bg-gray-50/80 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-300/50 dark:border-gray-600/30 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all duration-300"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Detailed Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows={4}
                placeholder="Describe what happened, what you expected, and what went wrong..."
                className="w-full px-4 py-3 bg-gray-50/80 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-300/50 dark:border-gray-600/30 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all duration-300 resize-none"
              />
            </div>

            {/* Steps to Reproduce */}
            <div>
              <label htmlFor="steps" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Steps to Reproduce (Optional)
              </label>
              <textarea
                id="steps"
                name="steps"
                value={formData.steps}
                onChange={handleInputChange}
                rows={3}
                placeholder="1. First I did...&#10;2. Then I clicked...&#10;3. The error occurred when..."
                className="w-full px-4 py-3 bg-gray-50/80 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-300/50 dark:border-gray-600/30 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all duration-300 resize-none"
              />
            </div>

            {/* Screenshots/Images */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Screenshots or Images (Optional)
              </label>
              <div className="space-y-3">
                {/* Upload Area */}
                <label className="group w-full flex flex-col items-center justify-center px-6 py-8 border-2 border-dashed border-gray-300/50 dark:border-gray-600/30 rounded-xl cursor-pointer hover:border-orange-400/50 dark:hover:border-orange-500/50 transition-all duration-300 bg-gray-50/30 dark:bg-gray-800/30 hover:bg-orange-50/30 dark:hover:bg-orange-900/20">
                  <div className="flex flex-col items-center space-y-3">
                    <div className="p-3 bg-orange-100/80 dark:bg-orange-500/20 rounded-lg group-hover:scale-110 transition-transform duration-300">
                      <Upload className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                        Click to upload images
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        Image up to 10MB (Max 3 files)
                      </p>
                    </div>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                  />
                </label>

                {/* Uploaded Images Preview */}
                {uploadedImages.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {uploadedImages.map((file, index) => (
                      <div key={index} className="relative group">
                        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 border border-gray-200/50 dark:border-gray-700/50">
                          <div className="flex items-center space-x-2">
                            <Image className="h-5 w-5 text-orange-600 dark:text-orange-400 flex-shrink-0" />
                            <span className="text-xs text-gray-600 dark:text-gray-400 truncate">
                              {file.name}
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || !formData.title || !formData.description}
              className="group w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl shadow-orange-500/25 border border-white/10"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                  Submit Report
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer Note */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Your report helps us improve the platform for everyone. Thank you for your feedback!
          </p>
        </div>
      </div>
    </div>
  )
}