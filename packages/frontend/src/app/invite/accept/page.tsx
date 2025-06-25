"use client";

import { Suspense } from "react";

import { InviteAcceptanceCard } from "@/features/auth/components/invite-acceptance-card";

const InviteAcceptPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Suspense
          fallback={
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading invitation...</p>
            </div>
          }
        >
          <InviteAcceptanceCard />
        </Suspense>
      </div>
    </div>
  );
};

export default InviteAcceptPage;
