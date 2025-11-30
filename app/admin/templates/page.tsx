import Link from "next/link";
import { db } from "@/lib/db";
import { customTemplates } from "@/lib/db/schema";
import { templates } from "@/lib/templates/registry";
import { desc } from "drizzle-orm";
import { 
  ArrowLeft, 
  Plus, 
  Edit, 
  Eye, 
  EyeOff,
  Trash2 
} from "lucide-react";

export default async function AdminTemplatesPage() {
  // Get custom templates from database
  const dbTemplates = await db
    .select()
    .from(customTemplates)
    .orderBy(desc(customTemplates.createdAt));

  return (
    <main className="min-h-screen bg-warm-50">
      {/* Header */}
      <header className="bg-white border-b border-warm-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-warm-500 hover:text-warm-700 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-lg font-serif tracking-wider uppercase">Manage Templates</h1>
          </div>
          <Link
            href="/admin/templates/new"
            className="flex items-center gap-2 px-4 py-2 bg-warm-600 text-white text-sm uppercase tracking-wider hover:bg-warm-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Template
          </Link>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Custom Templates */}
        <div className="mb-12">
          <h2 className="text-sm font-medium tracking-wider uppercase text-warm-500 mb-4">
            Custom Templates ({dbTemplates.length})
          </h2>
          
          {dbTemplates.length === 0 ? (
            <div className="bg-white border border-warm-200 p-12 text-center">
              <p className="text-warm-500 mb-4">No custom templates yet.</p>
              <Link
                href="/admin/templates/new"
                className="inline-flex items-center gap-2 px-4 py-2 bg-warm-600 text-white text-sm uppercase tracking-wider hover:bg-warm-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create Your First Template
              </Link>
            </div>
          ) : (
            <div className="bg-white border border-warm-200">
              <div className="grid grid-cols-6 gap-4 p-4 border-b border-warm-200 text-xs uppercase tracking-wider text-warm-500">
                <span className="col-span-2">Name</span>
                <span>Category</span>
                <span>Free</span>
                <span>Status</span>
                <span>Actions</span>
              </div>
              {dbTemplates.map((template) => (
                <div key={template.id} className="grid grid-cols-6 gap-4 p-4 border-b border-warm-100 last:border-0 items-center">
                  <div className="col-span-2">
                    <p className="text-warm-700 font-medium">{template.name}</p>
                    <p className="text-xs text-warm-400">{template.templateId}</p>
                  </div>
                  <span className="text-warm-500 capitalize">{template.category}</span>
                  <span className="text-warm-500">{template.isFree ? "Yes" : "No"}</span>
                  <span className={template.isPublished ? "text-green-600" : "text-warm-400"}>
                    {template.isPublished ? "Published" : "Draft"}
                  </span>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/templates/${template.id}/edit`}
                      className="p-2 text-warm-500 hover:text-warm-700 transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <form action={`/api/admin/templates/${template.id}/toggle`} method="POST">
                      <button
                        type="submit"
                        className="p-2 text-warm-500 hover:text-warm-700 transition-colors"
                        title={template.isPublished ? "Unpublish" : "Publish"}
                      >
                        {template.isPublished ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Built-in Templates Reference */}
        <div>
          <h2 className="text-sm font-medium tracking-wider uppercase text-warm-500 mb-4">
            Built-in Templates ({templates.filter(t => t.id !== "cover").length})
          </h2>
          <p className="text-sm text-warm-400 mb-4">
            These templates are defined in code. To modify them, edit the template registry.
          </p>
          <div className="bg-white border border-warm-200">
            <div className="grid grid-cols-5 gap-4 p-4 border-b border-warm-200 text-xs uppercase tracking-wider text-warm-500">
              <span className="col-span-2">Name</span>
              <span>Category</span>
              <span>Free</span>
              <span>Fields</span>
            </div>
            {templates.filter(t => t.id !== "cover").map((template) => (
              <div key={template.id} className="grid grid-cols-5 gap-4 p-4 border-b border-warm-100 last:border-0">
                <div className="col-span-2">
                  <p className="text-warm-700">{template.name}</p>
                  <p className="text-xs text-warm-400">{template.id}</p>
                </div>
                <span className="text-warm-500 capitalize">{template.category}</span>
                <span className="text-warm-500">{template.isFree ? "Yes" : "No"}</span>
                <span className="text-warm-500">{template.fields.length}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
