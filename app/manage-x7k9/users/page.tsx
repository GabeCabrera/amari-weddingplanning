"use client";

import { useState, useEffect } from "react";
import {
  Search,
  RefreshCw,
  Users,
  Crown,
  Mail,
  MailOff,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Filter,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  emailOptIn: boolean;
  unsubscribedAt: string | null;
  createdAt: string;
  tenant: {
    id: string;
    displayName: string;
    slug: string;
    plan: string;
    weddingDate: string | null;
    onboardingComplete: boolean;
  };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState<string>("");

  const fetchUsers = async (page = 1) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "20",
      });
      if (search) params.set("search", search);
      if (planFilter) params.set("plan", planFilter);

      const response = await fetch(`/api/manage-x7k9/users?${params}`);
      if (!response.ok) throw new Error("Failed to fetch users");
      
      const data = await response.json();
      setUsers(data.users);
      setPagination(data.pagination);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [planFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers(1);
  };

  const exportToCSV = () => {
    const headers = ["Email", "Name", "Plan", "Wedding Date", "Email Opt-In", "Created"];
    const rows = users.map((u) => [
      u.email,
      u.name || "",
      u.tenant.plan,
      u.tenant.weddingDate || "",
      u.emailOptIn ? "Yes" : "No",
      new Date(u.createdAt).toLocaleDateString(),
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `aisle-users-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const timeAgo = (date: string) => {
    const now = new Date();
    const d = new Date(date);
    const seconds = Math.floor((now.getTime() - d.getTime()) / 1000);

    if (seconds < 60) return "just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return formatDate(date);
  };

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-serif tracking-wider uppercase text-warm-800">
          Users
        </h1>
        <p className="text-warm-500 mt-1">
          Manage and view all registered customers
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-warm-200 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-light text-warm-800">{pagination.total}</p>
              <p className="text-xs text-warm-500">Total Users</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white border border-warm-200 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Crown className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-light text-warm-800">
                {users.filter((u) => u.tenant.plan === "complete").length}
              </p>
              <p className="text-xs text-warm-500">Paid (this page)</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-warm-200 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Mail className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-light text-warm-800">
                {users.filter((u) => u.emailOptIn).length}
              </p>
              <p className="text-xs text-warm-500">Subscribed (this page)</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-warm-200 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Calendar className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-light text-warm-800">
                {users.filter((u) => u.tenant.weddingDate).length}
              </p>
              <p className="text-xs text-warm-500">With Date Set (this page)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white border border-warm-200 rounded-lg mb-6">
        <div className="p-4 flex items-center gap-4">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by email, name, or wedding name..."
                className="w-full pl-10 pr-4 py-2 border border-warm-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-warm-500"
              />
            </div>
          </form>

          {/* Plan Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-warm-400" />
            <select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
              className="px-3 py-2 border border-warm-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-warm-500 text-sm"
            >
              <option value="">All Plans</option>
              <option value="free">Free</option>
              <option value="complete">Complete</option>
            </select>
          </div>

          {/* Actions */}
          <Button variant="outline" size="sm" onClick={() => fetchUsers(pagination.page)}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          
          <Button variant="outline" size="sm" onClick={exportToCSV}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-warm-200 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-warm-50 border-b border-warm-200">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-medium text-warm-500 uppercase tracking-wider">
                User
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-warm-500 uppercase tracking-wider">
                Wedding
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-warm-500 uppercase tracking-wider">
                Plan
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-warm-500 uppercase tracking-wider">
                Email
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-warm-500 uppercase tracking-wider">
                Joined
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-warm-100">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-warm-400">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                  Loading users...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-warm-400">
                  No users found
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-warm-50 transition-colors">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-warm-800">{user.name || "—"}</p>
                      <p className="text-sm text-warm-500">{user.email}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-warm-800">{user.tenant.displayName}</p>
                      {user.tenant.weddingDate && (
                        <p className="text-xs text-warm-500">
                          <Calendar className="w-3 h-3 inline mr-1" />
                          {formatDate(user.tenant.weddingDate)}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                        user.tenant.plan === "complete"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-warm-100 text-warm-600"
                      }`}
                    >
                      {user.tenant.plan === "complete" && <Crown className="w-3 h-3" />}
                      {user.tenant.plan}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {user.emailOptIn ? (
                      <span className="inline-flex items-center gap-1 text-green-600 text-sm">
                        <Mail className="w-4 h-4" />
                        Subscribed
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-warm-400 text-sm">
                        <MailOff className="w-4 h-4" />
                        {user.unsubscribedAt ? "Unsubscribed" : "Not opted in"}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-warm-600" title={formatDate(user.createdAt)}>
                      {timeAgo(user.createdAt)}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="px-4 py-3 border-t border-warm-200 flex items-center justify-between bg-warm-50">
            <p className="text-sm text-warm-500">
              Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
              {pagination.total} users
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchUsers(pagination.page - 1)}
                disabled={pagination.page === 1 || isLoading}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm text-warm-600 px-3">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchUsers(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages || isLoading}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
