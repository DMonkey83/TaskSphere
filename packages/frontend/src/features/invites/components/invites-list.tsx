"use client";

import {
  MoreHorizontal,
  Mail,
  RefreshCw,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useGetInvites,
  useResendInvite,
  useRevokeInvite,
} from "@/lib/queries/useInvites";

const STATUS_ICONS = {
  pending: <Clock className="h-4 w-4 text-yellow-500" />,
  accepted: <CheckCircle className="h-4 w-4 text-green-500" />,
  expired: <XCircle className="h-4 w-4 text-red-500" />,
  revoked: <AlertTriangle className="h-4 w-4 text-gray-500" />,
};

const STATUS_COLORS = {
  pending: "bg-yellow-100 text-yellow-800",
  accepted: "bg-green-100 text-green-800",
  expired: "bg-red-100 text-red-800",
  revoked: "bg-gray-100 text-gray-800",
};

export const InvitesList = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);

  const {
    data: invitesData,
    isLoading,
    error,
  } = useGetInvites({
    page,
    limit: 10,
    email: search || undefined,
    status: statusFilter === "all" ? undefined : statusFilter,
  });

  const { mutate: resendInvite } = useResendInvite();
  const { mutate: revokeInvite } = useRevokeInvite();

  const handleResend = (inviteId: string) => {
    resendInvite(inviteId);
  };

  const handleRevoke = (inviteId: string) => {
    revokeInvite(inviteId);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex space-x-4">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Failed to load invitations</p>
        <Button
          variant="outline"
          onClick={() => window.location.reload()}
          className="mt-2"
        >
          Try Again
        </Button>
      </div>
    );
  }

  const invites = invitesData?.invites || [];
  const pagination = invitesData?.pagination;

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex space-x-4">
        <Input
          placeholder="Search by email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="accepted">Accepted</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
            <SelectItem value="revoked">Revoked</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {invites.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Mail className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>No invitations found</p>
          {search || statusFilter !== "all" ? (
            <Button
              variant="outline"
              onClick={() => {
                setSearch("");
                setStatusFilter("all");
              }}
              className="mt-2"
            >
              Clear Filters
            </Button>
          ) : null}
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Sent</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invites.map((invite) => (
                <TableRow key={invite.id}>
                  <TableCell className="font-medium">{invite.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{invite.role}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {STATUS_ICONS[invite.status as keyof typeof STATUS_ICONS]}
                      <Badge
                        variant="secondary"
                        className={
                          STATUS_COLORS[
                            invite.status as keyof typeof STATUS_COLORS
                          ]
                        }
                      >
                        {invite.status}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {new Date(invite.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {new Date(invite.expiresAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {invite.status === "pending" && (
                          <>
                            <DropdownMenuItem
                              onClick={() => handleResend(invite.id)}
                            >
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Resend
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleRevoke(invite.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Revoke
                            </DropdownMenuItem>
                          </>
                        )}
                        {invite.status === "expired" && (
                          <DropdownMenuItem
                            onClick={() => handleResend(invite.id)}
                          >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Resend
                          </DropdownMenuItem>
                        )}
                        {(invite.status === "accepted" ||
                          invite.status === "revoked") && (
                          <DropdownMenuItem disabled>
                            No actions available
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
            {pagination.total} results
          </p>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page - 1)}
              disabled={page <= 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={page >= pagination.totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
