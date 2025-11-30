"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { PageSidebarItem } from "./page-sidebar-item";
import { PageRenderer } from "./page-renderer";
import { type Page } from "@/lib/db/schema";
import { validatePage } from "@/lib/templates/validation";
import {
  LogOut,
  Plus,
  ChevronLeft,
  ChevronRight,
  Home,
} from "lucide-react";
import { toast } from "sonner";

interface PlannerEditorProps {
  plannerId: string;
  initialPages: Page[];
  displayName: string;
}

export function PlannerEditor({ plannerId, initialPages, displayName }: PlannerEditorProps) {
  const [pages, setPages] = useState<Page[]>(initialPages);
  const [selectedPageId, setSelectedPageId] = useState<string | null>(
    initialPages[0]?.id ?? null
  );
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const selectedPage = pages.find((p) => p.id === selectedPageId);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = pages.findIndex((p) => p.id === active.id);
      const newIndex = pages.findIndex((p) => p.id === over.id);

      const newPages = arrayMove(pages, oldIndex, newIndex);
      setPages(newPages);

      // Save new order to database
      try {
        await fetch("/api/planner/reorder", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            plannerId,
            pageIds: newPages.map((p) => p.id),
          }),
        });
      } catch (error) {
        toast.error("Failed to save page order");
        setPages(pages); // Revert on error
      }
    }
  };

  const handleFieldChange = useCallback(
    async (pageId: string, fields: Record<string, unknown>) => {
      // Optimistic update
      setPages((prev) =>
        prev.map((p) =>
          p.id === pageId ? { ...p, fields, updatedAt: new Date() } : p
        )
      );

      setIsSaving(true);

      try {
        await fetch("/api/planner/pages/update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pageId, fields }),
        });
      } catch (error) {
        toast.error("Failed to save changes");
      } finally {
        setIsSaving(false);
      }
    },
    []
  );

  const handleDeletePage = async (pageId: string) => {
    if (pages.length <= 1) {
      toast.error("You must have at least one page");
      return;
    }

    const confirmed = window.confirm("Are you sure you want to delete this page?");
    if (!confirmed) return;

    // If deleting selected page, select another
    if (pageId === selectedPageId) {
      const currentIndex = pages.findIndex((p) => p.id === pageId);
      const newSelectedId = pages[currentIndex - 1]?.id ?? pages[currentIndex + 1]?.id;
      setSelectedPageId(newSelectedId);
    }

    setPages((prev) => prev.filter((p) => p.id !== pageId));

    try {
      await fetch("/api/planner/pages/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pageId }),
      });
      toast.success("Page deleted");
    } catch (error) {
      toast.error("Failed to delete page");
    }
  };

  return (
    <div className="min-h-screen flex bg-warm-50">
      {/* Sidebar */}
      <motion.aside
        animate={{ width: sidebarCollapsed ? 60 : 280 }}
        className="bg-white border-r border-warm-200 flex flex-col"
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-warm-200 flex items-center justify-between">
          {!sidebarCollapsed && (
            <Link href="/" className="text-lg font-serif tracking-widest uppercase">
              Aisle
            </Link>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-1 hover:bg-warm-100 rounded transition-colors"
          >
            {sidebarCollapsed ? (
              <ChevronRight className="w-4 h-4 text-warm-500" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-warm-500" />
            )}
          </button>
        </div>

        {/* Page List */}
        <div className="flex-1 overflow-y-auto p-2">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={pages.map((p) => p.id)}
              strategy={verticalListSortingStrategy}
            >
              {pages.map((page) => {
                const validation = validatePage(page);
                return (
                  <PageSidebarItem
                    key={page.id}
                    page={page}
                    isSelected={page.id === selectedPageId}
                    isComplete={validation.isComplete}
                    collapsed={sidebarCollapsed}
                    onClick={() => setSelectedPageId(page.id)}
                    onDelete={() => handleDeletePage(page.id)}
                  />
                );
              })}
            </SortableContext>
          </DndContext>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-warm-200 space-y-2">
          {!sidebarCollapsed && (
            <>
              <Link href="/templates" className="block">
                <Button variant="outline" size="sm" className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Page
                </Button>
              </Link>
              <Link href="/" className="block">
                <Button variant="ghost" size="sm" className="w-full">
                  <Home className="w-4 h-4 mr-2" />
                  Home
                </Button>
              </Link>
            </>
          )}
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className={`flex items-center gap-2 text-xs tracking-wider uppercase text-warm-500 hover:text-warm-600 transition-colors ${
              sidebarCollapsed ? "justify-center w-full" : ""
            }`}
          >
            <LogOut className="w-4 h-4" />
            {!sidebarCollapsed && "Sign Out"}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Top Bar */}
        <header className="bg-white border-b border-warm-200 px-6 py-3 flex items-center justify-between sticky top-0 z-10">
          <span className="text-sm text-warm-500">{displayName}</span>
          <div className="flex items-center gap-4">
            {isSaving && (
              <span className="text-xs text-warm-400 animate-pulse">Saving...</span>
            )}
            {selectedPage && (
              <span className="text-sm font-medium">{selectedPage.title}</span>
            )}
          </div>
        </header>

        {/* Page Content */}
        <div className="p-8">
          <AnimatePresence mode="wait">
            {selectedPage && (
              <motion.div
                key={selectedPage.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <PageRenderer
                  page={selectedPage}
                  onFieldChange={(fields) => handleFieldChange(selectedPage.id, fields)}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
