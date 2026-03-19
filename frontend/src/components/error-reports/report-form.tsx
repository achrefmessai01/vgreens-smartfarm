import { ArrowLeft, FileText, Image, Send, Upload, X } from 'lucide-react';
import Link from 'next/link';
import { ReportSeverity } from '@/generated/graphql';

interface ReportFormData {
  title: string;
  description: string;
  email: string;
  severity: ReportSeverity;
  section: string;
  steps: string;
}

interface ReportFormProps {
  formData: ReportFormData;
  uploadedImages: File[];
  isSubmitting: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: (index: number) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const inputClass =
  'w-full px-4 py-3 bg-gray-50/80 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-300/50 dark:border-gray-600/30 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all duration-300';
const labelClass = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2';

export function ReportForm({
  formData,
  uploadedImages,
  isSubmitting,
  onInputChange,
  onImageUpload,
  onRemoveImage,
  onSubmit,
}: ReportFormProps) {
  return (
    <div className="min-h-screen p-4 sm:p-8 bg-gray-50 dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-2xl mx-auto">
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
            <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 dark:text-white">Report an Error</h1>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
              Help us improve by reporting any issues you've encountered.
            </p>
          </div>
        </div>

        <div className="bg-white/90 dark:bg-gray-900/60 backdrop-blur-xl border border-orange-200/50 dark:border-orange-500/20 rounded-2xl shadow-2xl shadow-orange-200/40 dark:shadow-orange-500/25 p-5 sm:p-8">
          <form onSubmit={onSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className={labelClass}>Your Email (Optional)</label>
              <input type="email" id="email" name="email" value={formData.email} onChange={onInputChange} placeholder="your.email@example.com" className={inputClass} />
              <p className="text-xs text-gray-500 mt-1">We'll only use this to follow up if needed.</p>
            </div>

            <div>
              <label htmlFor="title" className={labelClass}>Error Title</label>
              <input type="text" id="title" name="title" value={formData.title} onChange={onInputChange} required placeholder="Brief description of the issue" className={inputClass} />
            </div>

            <div>
              <label htmlFor="severity" className={labelClass}>Severity Level</label>
              <select id="severity" name="severity" value={formData.severity} onChange={onInputChange} className={inputClass}>
                <option value={ReportSeverity.Low}>Low - Minor inconvenience</option>
                <option value={ReportSeverity.Medium}>Medium - Affects functionality</option>
                <option value={ReportSeverity.High}>High - Blocks important tasks</option>
                <option value={ReportSeverity.Critical}>Critical - System unusable</option>
                <option value={ReportSeverity.Urgent}>Urgent - Immediate attention required</option>
              </select>
            </div>

            <div>
              <label htmlFor="section" className={labelClass}>Affected Section</label>
              <input type="text" id="section" name="section" value={formData.section} onChange={onInputChange} placeholder="e.g., Dashboard, Harvest, Farm Overview" className={inputClass} />
            </div>

            <div>
              <label htmlFor="description" className={labelClass}>Detailed Description</label>
              <textarea id="description" name="description" value={formData.description} onChange={onInputChange} required rows={4} placeholder="Describe what happened, what you expected, and what went wrong..." className={`${inputClass} resize-none`} />
            </div>

            <div>
              <label htmlFor="steps" className={labelClass}>Steps to Reproduce (Optional)</label>
              <textarea id="steps" name="steps" value={formData.steps} onChange={onInputChange} rows={3} placeholder={'1. First I did...\n2. Then I clicked...\n3. The error occurred when...'} className={`${inputClass} resize-none`} />
            </div>

            <div>
              <label className={labelClass}>Screenshots or Images (Optional)</label>
              <div className="space-y-3">
                <label className="group w-full flex flex-col items-center justify-center px-6 py-8 border-2 border-dashed border-gray-300/50 dark:border-gray-600/30 rounded-xl cursor-pointer hover:border-orange-400/50 dark:hover:border-orange-500/50 transition-all duration-300 bg-gray-50/30 dark:bg-gray-800/30 hover:bg-orange-50/30 dark:hover:bg-orange-900/20">
                  <div className="flex flex-col items-center space-y-3">
                    <div className="p-3 bg-orange-100/80 dark:bg-orange-500/20 rounded-lg group-hover:scale-110 transition-transform duration-300">
                      <Upload className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Click to upload images</p>
                      <p className="text-xs text-gray-500 mt-1">Image up to 10MB (Max 3 files)</p>
                    </div>
                  </div>
                  <input type="file" className="hidden" accept="image/*" multiple onChange={onImageUpload} />
                </label>

                {uploadedImages.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {uploadedImages.map((file, index) => (
                      <div key={index} className="relative group">
                        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 border border-gray-200/50 dark:border-gray-700/50">
                          <div className="flex items-center space-x-2">
                            <Image className="h-5 w-5 text-orange-600 dark:text-orange-400 flex-shrink-0" />
                            <span className="text-xs text-gray-600 dark:text-gray-400 truncate">{file.name}</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => onRemoveImage(index)}
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

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Your report helps us improve the platform for everyone. Thank you for your feedback!
          </p>
        </div>
      </div>
    </div>
  );
}
