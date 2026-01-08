"use client";

import React, { useState } from "react";
import { Plus, Search, Filter, X } from "lucide-react";
import { AssessmentCard } from "@/components/admin/assessments/AssessmentCard";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";

interface AssessmentListProps {
  assessments: any[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onView: (id: string) => void;
  onPublish: (id: string) => void;
  loading: boolean;
}

export function AssessmentList({
  assessments,
  onEdit,
  onDelete,
  onView,
  onPublish,
  loading,
}: AssessmentListProps) {
  const [publishId, setPublishId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-64 rounded-xl bg-gray-100 animate-pulse border border-gray-200" />
        ))}
      </div>
    );
  }

  if (assessments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-4 text-center border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
        <div className="bg-white p-4 rounded-full shadow-sm mb-4">
          <Filter className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">No assessments found</h3>
        <p className="text-gray-500 max-w-sm mx-auto mb-6">
          We couldn't find any assessments matching your filters. Try adjusting your search or create a new one.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
        {assessments.map((assessment) => (
          <AssessmentCard
            key={assessment.id}
            assessment={assessment}
            onEdit={onEdit}
            onDelete={() => setDeleteId(assessment.id)}
            onView={onView}
            onPublish={() => setPublishId(assessment.id)}
          />
        ))}
      </div>

      <ConfirmationModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={async () => {
          if (deleteId) {
            onDelete(deleteId);
            setDeleteId(null);
          }
        }}
        title="Delete Assessment?"
        message="Are you sure you want to delete this assessment? This action cannot be undone."
        confirmText="Confirm Delete"
        variant="danger"
      />

      <ConfirmationModal
        isOpen={!!publishId}
        onClose={() => setPublishId(null)}
        onConfirm={async () => {
          if (publishId) {
            onPublish(publishId);
            setPublishId(null);
          }
        }}
        title="Publish to Solviq AI?"
        message="This will lock the assessment configuration and send the test structure to Solviq AI for question generation. You cannot add or remove rounds after publishing."
        confirmText="Confirm Publish"
        variant="info"
      />
    </>
  );
}

