'use client';

import { ArrowLeft, FileText, Image, Send, Upload, X } from 'lucide-react';
import Link from 'next/link';
import { ReportSeverity } from '@/generated/graphql';
import { useI18n } from '@/i18n';

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
  onInputChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => void;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: (index: number) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const inputClass =
  'w-full px-4 py-3 bg-gray-50/80 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-300/50 dark:border-gray-600/30 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all duration-300';
const labelClass =
  'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2';

export function ReportForm({
  formData,
  uploadedImages,
  isSubmitting,
  onInputChange,
  onImageUpload,
  onRemoveImage,
  onSubmit,
}: ReportFormProps) {
  const { t } = useI18n();
  const reportT = t.pages.report;

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8 dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <Link
            href="/tenant/dashboard"
            className="group mb-6 inline-flex items-center gap-2 text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
            {t.common.backToDashboard}
          </Link>

          <div className="space-y-4 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-orange-200/50 bg-gradient-to-br from-orange-100/80 to-orange-200/60 shadow-lg dark:border-orange-500/20 dark:from-orange-500/20 dark:to-orange-600/30">
              <FileText className="h-8 w-8 text-orange-600 dark:text-orange-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 sm:text-4xl dark:text-white">
              {reportT.title}
            </h1>
            <p className="mx-auto max-w-md text-gray-600 dark:text-gray-400">
              {reportT.subtitle}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-orange-200/50 bg-white/90 p-5 shadow-2xl shadow-orange-200/40 backdrop-blur-xl sm:p-8 dark:border-orange-500/20 dark:bg-gray-900/60 dark:shadow-orange-500/25">
          <form onSubmit={onSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className={labelClass}>
                {reportT.emailLabel}
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={onInputChange}
                placeholder={reportT.emailPlaceholder}
                className={inputClass}
              />
              <p className="mt-1 text-xs text-gray-500">{reportT.emailHint}</p>
            </div>

            <div>
              <label htmlFor="title" className={labelClass}>
                {reportT.errorTitleLabel}
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={onInputChange}
                required
                placeholder={reportT.errorTitlePlaceholder}
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="severity" className={labelClass}>
                {reportT.severityLabel}
              </label>
              <select
                id="severity"
                name="severity"
                value={formData.severity}
                onChange={onInputChange}
                className={inputClass}
              >
                <option value={ReportSeverity.Low}>
                  {reportT.severityLowOption}
                </option>
                <option value={ReportSeverity.Medium}>
                  {reportT.severityMediumOption}
                </option>
                <option value={ReportSeverity.High}>
                  {reportT.severityHighOption}
                </option>
                <option value={ReportSeverity.Critical}>
                  {reportT.severityCriticalOption}
                </option>
                <option value={ReportSeverity.Urgent}>
                  {reportT.severityUrgentOption}
                </option>
              </select>
            </div>

            <div>
              <label htmlFor="section" className={labelClass}>
                {reportT.sectionLabel}
              </label>
              <input
                type="text"
                id="section"
                name="section"
                value={formData.section}
                onChange={onInputChange}
                placeholder={reportT.sectionPlaceholder}
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="description" className={labelClass}>
                {reportT.descriptionLabel}
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={onInputChange}
                required
                rows={4}
                placeholder={reportT.descriptionPlaceholder}
                className={`${inputClass} resize-none`}
              />
            </div>

            <div>
              <label htmlFor="steps" className={labelClass}>
                {reportT.stepsLabel}
              </label>
              <textarea
                id="steps"
                name="steps"
                value={formData.steps}
                onChange={onInputChange}
                rows={3}
                placeholder={reportT.stepsPlaceholder}
                className={`${inputClass} resize-none`}
              />
            </div>

            <div>
              <label className={labelClass}>{reportT.screenshotsLabel}</label>
              <div className="space-y-3">
                <label className="group flex w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300/50 bg-gray-50/30 px-6 py-8 transition-all duration-300 hover:border-orange-400/50 hover:bg-orange-50/30 dark:border-gray-600/30 dark:bg-gray-800/30 dark:hover:border-orange-500/50 dark:hover:bg-orange-900/20">
                  <div className="flex flex-col items-center space-y-3">
                    <div className="rounded-lg bg-orange-100/80 p-3 transition-transform duration-300 group-hover:scale-110 dark:bg-orange-500/20">
                      <Upload className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {reportT.clickToUpload}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        {reportT.uploadHint}
                      </p>
                    </div>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    multiple
                    onChange={onImageUpload}
                  />
                </label>

                {uploadedImages.length > 0 && (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {uploadedImages.map((file, index) => (
                      <div key={index} className="group relative">
                        <div className="rounded-lg border border-gray-200/50 bg-gray-100 p-3 dark:border-gray-700/50 dark:bg-gray-800">
                          <div className="flex items-center space-x-2">
                            <Image className="h-5 w-5 flex-shrink-0 text-orange-600 dark:text-orange-400" />
                            <span className="truncate text-xs text-gray-600 dark:text-gray-400">
                              {file.name}
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => onRemoveImage(index)}
                          className="absolute -top-2 -right-2 rounded-full bg-red-500 p-1 text-white opacity-0 transition-colors group-hover:opacity-100 hover:bg-red-600"
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
              disabled={
                isSubmitting || !formData.title || !formData.description
              }
              className="group flex w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4 font-semibold text-white shadow-lg shadow-orange-500/25 transition-all duration-300 hover:scale-105 hover:from-orange-600 hover:to-orange-700 hover:shadow-xl disabled:cursor-not-allowed disabled:from-gray-400 disabled:to-gray-500"
            >
              {isSubmitting ? (
                <>
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  {reportT.submitting}
                </>
              ) : (
                <>
                  <Send className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                  {reportT.submit}
                </>
              )}
            </button>
          </form>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-500">
            {reportT.footerNote}
          </p>
        </div>
      </div>
    </div>
  );
}
