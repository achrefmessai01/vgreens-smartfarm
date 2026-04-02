'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CreateErrorReportInput, ReportSeverity } from '@/generated/graphql';
import { useCreateErrorReport } from '@/lib/hooks/use-error-reports';
import { ReportSuccessScreen } from '@/components/error-reports/report-success-screen';
import { ReportForm } from '@/components/error-reports/report-form';

export default function ReportPage() {
  const router = useRouter();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [reportId, setReportId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    email: '',
    severity: ReportSeverity.Medium,
    section: '',
    steps: '',
  });
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [createErrorReport, { loading: isSubmitting }] = useCreateErrorReport();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const input: CreateErrorReportInput = {
        userEmail: formData.email,
        errorTitle: formData.title,
        errorDetails: formData.description,
        severity: formData.severity,
        reproductionSteps: formData.steps,
        expectedVsActual: formData.section,
        browserInfo: navigator.userAgent,
      };
      const result = await createErrorReport({ variables: { input } });
      const createdReportId = result.data?.createErrorReport?.id;
      setReportId(createdReportId || null);
      setIsSubmitted(true);
      setTimeout(() => {
        router.push(
          createdReportId
            ? `/report-status?id=${createdReportId}`
            : '/tenant/dashboard',
        );
      }, 3000);
    } catch (error) {
      console.error('Failed to submit error report:', error);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const imageFiles = Array.from(files).filter((f) =>
        f.type.startsWith('image/'),
      );
      setUploadedImages((prev) => [...prev, ...imageFiles].slice(0, 3));
    }
  };

  const handleRemoveImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };

  if (isSubmitted) {
    return <ReportSuccessScreen reportId={reportId} />;
  }

  return (
    <ReportForm
      formData={formData}
      uploadedImages={uploadedImages}
      isSubmitting={isSubmitting}
      onInputChange={handleInputChange}
      onImageUpload={handleImageUpload}
      onRemoveImage={handleRemoveImage}
      onSubmit={handleSubmit}
    />
  );
}
