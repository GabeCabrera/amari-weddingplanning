"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const CATEGORIES = [
  { value: "essentials", label: "Essentials" },
  { value: "planning", label: "Planning & Tracking" },
  { value: "people", label: "People & Seating" },
  { value: "day-of", label: "Day Of" },
  { value: "extras", label: "Extras" },
];

const TIMELINE_FILTERS = [
  { value: "12-months", label: "12+ Months Out" },
  { value: "9-months", label: "9-12 Months Out" },
  { value: "6-months", label: "6-9 Months Out" },
  { value: "3-months", label: "3-6 Months Out" },
  { value: "1-month", label: "1-3 Months Out" },
  { value: "week-of", label: "Week Of" },
];

const FIELD_TYPES = [
  { value: "text", label: "Text" },
  { value: "textarea", label: "Long Text" },
  { value: "number", label: "Number" },
  { value: "date", label: "Date" },
  { value: "checkbox", label: "Checkbox" },
  { value: "select", label: "Dropdown" },
  { value: "array", label: "Repeatable List" },
];

const ICONS = [
  "StickyNote", "FileText", "Calendar", "Clock", "Users", "Heart", 
  "DollarSign", "MapPin", "Camera", "Music", "Utensils", "Gift",
  "Plane", "Home", "Star", "CheckCircle", "List", "Clipboard"
];

interface TemplateField {
  key: string;
  label: string;
  type: string;
  required?: boolean;
  options?: string[];
  arrayItemSchema?: TemplateField[];
}

export default function NewTemplatePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    templateId: "",
    name: "",
    description: "",
    category: "extras",
    icon: "StickyNote",
    timelineFilters: [] as string[],
    isFree: false,
    isPublished: false,
  });
  
  const [fields, setFields] = useState<TemplateField[]>([
    { key: "", label: "", type: "text" }
  ]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleTimelineToggle = (filter: string) => {
    setFormData(prev => ({
      ...prev,
      timelineFilters: prev.timelineFilters.includes(filter)
        ? prev.timelineFilters.filter(f => f !== filter)
        : [...prev.timelineFilters, filter]
    }));
  };

  const handleFieldChange = (index: number, key: string, value: string | boolean) => {
    setFields(prev => prev.map((field, i) => 
      i === index ? { ...field, [key]: value } : field
    ));
  };

  const addField = () => {
    setFields(prev => [...prev, { key: "", label: "", type: "text" }]);
  };

  const removeField = (index: number) => {
    setFields(prev => prev.filter((_, i) => i !== index));
  };

  const generateKey = (label: string) => {
    return label.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.templateId || !formData.name || !formData.description) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (fields.some(f => !f.key || !f.label)) {
      toast.error("Please complete all field definitions");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/admin/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          fields,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create template");
      }

      toast.success("Template created!");
      router.push("/admin/templates");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-warm-50">
      {/* Header */}
      <header className="bg-white border-b border-warm-200">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/templates" className="text-warm-500 hover:text-warm-700 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-lg font-serif tracking-wider uppercase">New Template</h1>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Info */}
          <section className="bg-white border border-warm-200 p-6">
            <h2 className="text-sm font-medium tracking-wider uppercase text-warm-500 mb-6">
              Basic Information
            </h2>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Template Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Honeymoon Checklist"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="templateId">Template ID *</Label>
                <Input
                  id="templateId"
                  name="templateId"
                  value={formData.templateId}
                  onChange={handleChange}
                  placeholder="honeymoon-checklist"
                />
                <p className="text-xs text-warm-400">Lowercase, hyphens only. Must be unique.</p>
              </div>

              <div className="col-span-2 space-y-2">
                <Label htmlFor="description">Description *</Label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Plan and track your honeymoon details"
                  className="w-full px-3 py-2 border border-warm-300 text-sm focus:outline-none focus:border-warm-500"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-warm-300 text-sm focus:outline-none focus:border-warm-500"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="icon">Icon</Label>
                <select
                  id="icon"
                  name="icon"
                  value={formData.icon}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-warm-300 text-sm focus:outline-none focus:border-warm-500"
                >
                  {ICONS.map(icon => (
                    <option key={icon} value={icon}>{icon}</option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* Timeline Filters */}
          <section className="bg-white border border-warm-200 p-6">
            <h2 className="text-sm font-medium tracking-wider uppercase text-warm-500 mb-6">
              Timeline Filters
            </h2>
            <p className="text-sm text-warm-400 mb-4">
              When should this template be suggested to users?
            </p>
            <div className="flex flex-wrap gap-3">
              {TIMELINE_FILTERS.map(filter => (
                <label
                  key={filter.value}
                  className={`
                    px-4 py-2 border cursor-pointer transition-colors text-sm
                    ${formData.timelineFilters.includes(filter.value)
                      ? "border-warm-500 bg-warm-50 text-warm-700"
                      : "border-warm-200 text-warm-500 hover:border-warm-300"
                    }
                  `}
                >
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={formData.timelineFilters.includes(filter.value)}
                    onChange={() => handleTimelineToggle(filter.value)}
                  />
                  {filter.label}
                </label>
              ))}
            </div>
          </section>

          {/* Fields */}
          <section className="bg-white border border-warm-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm font-medium tracking-wider uppercase text-warm-500">
                Template Fields
              </h2>
              <Button type="button" variant="outline" size="sm" onClick={addField}>
                <Plus className="w-4 h-4 mr-2" />
                Add Field
              </Button>
            </div>

            <div className="space-y-4">
              {fields.map((field, index) => (
                <div key={index} className="flex gap-4 items-start p-4 bg-warm-50 border border-warm-200">
                  <div className="flex-1 grid grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <Label className="text-xs">Label</Label>
                      <Input
                        value={field.label}
                        onChange={(e) => {
                          handleFieldChange(index, "label", e.target.value);
                          if (!field.key || field.key === generateKey(field.label)) {
                            handleFieldChange(index, "key", generateKey(e.target.value));
                          }
                        }}
                        placeholder="Field Label"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Key</Label>
                      <Input
                        value={field.key}
                        onChange={(e) => handleFieldChange(index, "key", e.target.value)}
                        placeholder="field_key"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Type</Label>
                      <select
                        value={field.type}
                        onChange={(e) => handleFieldChange(index, "type", e.target.value)}
                        className="w-full px-3 py-2 border border-warm-300 text-sm focus:outline-none focus:border-warm-500"
                      >
                        {FIELD_TYPES.map(type => (
                          <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeField(index)}
                    className="p-2 text-warm-400 hover:text-red-500 transition-colors"
                    disabled={fields.length === 1}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Publishing Options */}
          <section className="bg-white border border-warm-200 p-6">
            <h2 className="text-sm font-medium tracking-wider uppercase text-warm-500 mb-6">
              Publishing Options
            </h2>
            
            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="isFree"
                  checked={formData.isFree}
                  onChange={handleChange}
                  className="w-4 h-4"
                />
                <div>
                  <p className="text-warm-700">Available to free users</p>
                  <p className="text-xs text-warm-400">Free users will have access to this template</p>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="isPublished"
                  checked={formData.isPublished}
                  onChange={handleChange}
                  className="w-4 h-4"
                />
                <div>
                  <p className="text-warm-700">Publish immediately</p>
                  <p className="text-xs text-warm-400">Template will be visible in the marketplace</p>
                </div>
              </label>
            </div>
          </section>

          {/* Submit */}
          <div className="flex justify-end gap-4">
            <Link href="/admin/templates">
              <Button type="button" variant="outline">Cancel</Button>
            </Link>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="bg-warm-600 hover:bg-warm-700 text-white"
            >
              {isLoading ? "Creating..." : "Create Template"}
            </Button>
          </div>
        </form>
      </div>
    </main>
  );
}
