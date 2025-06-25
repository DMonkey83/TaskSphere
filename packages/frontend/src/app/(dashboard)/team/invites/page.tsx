"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BulkInviteForm } from "@/features/invites/components/bulk-invite-form";
import { InviteForm } from "@/features/invites/components/invite-form";
import { InvitesList } from "@/features/invites/components/invites-list";

const InvitesPage = () => {
  const [activeTab, setActiveTab] = useState("single");

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Team Invitations
            </h1>
            <p className="text-gray-600 mt-1">
              Invite new members to join your team and manage pending
              invitations
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Invite Forms */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Send Invitations</CardTitle>
                <CardDescription>
                  Invite team members to collaborate on your projects
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="single">Single Invite</TabsTrigger>
                    <TabsTrigger value="bulk">Bulk Invites</TabsTrigger>
                  </TabsList>

                  <TabsContent value="single" className="mt-6">
                    <InviteForm />
                  </TabsContent>

                  <TabsContent value="bulk" className="mt-6">
                    <BulkInviteForm />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Quick Stats */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Invitation Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Pending</span>
                  <span className="font-semibold text-yellow-600">5</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Accepted</span>
                  <span className="font-semibold text-green-600">12</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Expired</span>
                  <span className="font-semibold text-red-600">2</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Sent</span>
                  <span className="font-semibold text-blue-600">19</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  📋 Download CSV Template
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  🔄 Resend Failed Invites
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  🧹 Clean Expired Invites
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom Section - Invites List */}
        <Card>
          <CardHeader>
            <CardTitle>Manage Invitations</CardTitle>
            <CardDescription>
              View and manage all sent invitations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <InvitesList />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InvitesPage;
