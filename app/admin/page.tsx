import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { db } from "@/lib/db";
import { customTemplates } from "@/lib/db/schema";
import { templates } from "@/lib/templates/registry";
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Settings,
  Plus,
  ArrowLeft
} from "lucide-react";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  
  // Get custom templates from database
  const dbTemplates = await db.select().from(customTemplates);
  
  const stats = {
    builtInTemplates: templates.length,
    customTemplates: dbTemplates.length,
    publishedCustom: dbTemplates.filter(t => t.isPublished).length,
  };

  return (
    <main className="min-h-screen bg-warm-50">
      {/* Header */}
      <header className="bg-white border-b border-warm-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-warm-500 hover:text-warm-700 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-lg font-serif tracking-wider uppercase">Admin Panel</h1>
          </div>
          <p className="text-sm text-warm-500">{session?.user?.email}</p>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white border border-warm-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <FileText className="w-5 h-5 text-warm-400" />
              <span className="text-sm text-warm-500 uppercase tracking-wider">Built-in Templates</span>
            </div>
            <p className="text-3xl font-light text-warm-700">{stats.builtInTemplates}</p>
          </div>
          
          <div className="bg-white border border-warm-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <Plus className="w-5 h-5 text-warm-400" />
              <span className="text-sm text-warm-500 uppercase tracking-wider">Custom Templates</span>
            </div>
            <p className="text-3xl font-light text-warm-700">{stats.customTemplates}</p>
          </div>
          
          <div className="bg-white border border-warm-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <LayoutDashboard className="w-5 h-5 text-warm-400" />
              <span className="text-sm text-warm-500 uppercase tracking-wider">Published</span>
            </div>
            <p className="text-3xl font-light text-warm-700">{stats.publishedCustom}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-12">
          <h2 className="text-sm font-medium tracking-wider uppercase text-warm-500 mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href="/admin/templates"
              className="bg-white border border-warm-200 p-6 hover:border-warm-400 transition-colors flex items-center gap-4"
            >
              <div className="w-12 h-12 bg-warm-100 flex items-center justify-center">
                <FileText className="w-6 h-6 text-warm-500" />
              </div>
              <div>
                <h3 className="font-medium text-warm-700">Manage Templates</h3>
                <p className="text-sm text-warm-500">Create, edit, and publish templates</p>
              </div>
            </Link>
            
            <Link
              href="/admin/templates/new"
              className="bg-warm-600 text-white p-6 hover:bg-warm-700 transition-colors flex items-center gap-4"
            >
              <div className="w-12 h-12 bg-warm-500 flex items-center justify-center">
                <Plus className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-medium">Create New Template</h3>
                <p className="text-sm text-warm-200">Add a template to the marketplace</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Built-in Templates List */}
        <div>
          <h2 className="text-sm font-medium tracking-wider uppercase text-warm-500 mb-4">
            Built-in Templates
          </h2>
          <div className="bg-white border border-warm-200">
            <div className="grid grid-cols-4 gap-4 p-4 border-b border-warm-200 text-xs uppercase tracking-wider text-warm-500">
              <span>Name</span>
              <span>Category</span>
              <span>Free</span>
              <span>Status</span>
            </div>
            {templates.filter(t => t.id !== "cover").map((template) => (
              <div key={template.id} className="grid grid-cols-4 gap-4 p-4 border-b border-warm-100 last:border-0">
                <span className="text-warm-700">{template.name}</span>
                <span className="text-warm-500 capitalize">{template.category}</span>
                <span className="text-warm-500">{template.isFree ? "Yes" : "No"}</span>
                <span className="text-green-600 text-sm">Active</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
