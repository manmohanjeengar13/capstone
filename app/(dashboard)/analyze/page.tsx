'use client';
import { useState } from 'react';
import { AnalysisForm } from '@/components/analyze/AnalysisForm';
import { AnalysisProgress } from '@/components/analyze/AnalysisProgress';
import { useAnalysisStore } from '@/store/useAnalysisStore';
import { useAnalysis } from '@/hooks/useAnalysis';

export default function AnalyzePage() {
  const [submitting, setSubmitting] = useState(false);
  const { submitRepo, cancelJob } = useAnalysis();
  const { jobId, status, progress, currentStep } = useAnalysisStore();

  const isActive = jobId !== null && (status === 'PENDING' || status === 'RUNNING');

  const handleSubmit = async (repoUrl: string) => {
    setSubmitting(true);
    try {
      await submitRepo(repoUrl);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-full flex items-start justify-center px-4 py-12">
      {isActive ? (
        <AnalysisProgress
          progress={progress}
          currentStep={currentStep}
          status={status ?? ''}
          onCancel={cancelJob}
        />
      ) : (
        <AnalysisForm onSubmit={handleSubmit} isLoading={submitting} />
      )}
    </div>
  );
}
