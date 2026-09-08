"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Plus, Filter } from "lucide-react";
import { MockTestCard } from "@/components/admin/mock-tests/MockTestCard";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { Button } from "@/components/ui/button";

interface MockTestListProps {
  mockTests: any[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onView: (id: string) => void;
  loading: boolean;
}

export function MockTestList({
  mockTests,
  onEdit,
  onDelete,
  onView,
  loading,
}: MockTestListProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-64 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse border border-gray-200 dark:border-gray-700" />
        ))}
      </div>
    );
  }

  if (mockTests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-4 text-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl bg-gray-50/50 dark:bg-gray-900/30">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-full shadow-sm mb-4">
          <Filter className="h-8 w-8 text-gray-400 dark:text-gray-500" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">No mock tests found</h3>
        <p className="text-gray-500 dark:text-gray-300 max-w-sm mx-auto mb-6">
          We couldn&apos;t find any mock tests matching your filters. Try adjusting your search or create a new mock test.
        </p>
        <Link href="/dashboard/admin/mock-tests/create">
          <Button className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create mock test
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
        {mockTests.map((mockTest, index) => (
          <MockTestCard
            key={mockTest.id}
            cardIndex={index}
            mockTest={mockTest}
            onEdit={onEdit}
            onDelete={() => setDeleteId(mockTest.id)}
            onView={onView}
            onViewResults={() => window.location.href = `/dashboard/admin/mock-tests/${mockTest.id}/analytics`}
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
        title="Delete Mock Test?"
        message="Are you sure you want to delete this mock test? This action cannot be undone."
        confirmText="Confirm Delete"
        variant="danger"
      />
    </>
  );
}
