"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Star, GripVertical, User, Users as UsersIcon, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { type RendererWithAllPagesProps, type Task } from "./types";
import { POST_IT_COLORS, POST_IT_SHADOWS, SUGGESTED_TASKS_BY_CATEGORY } from "./shared";

export function TaskBoardRenderer({ page, fields, updateField, allPages }: RendererWithAllPagesProps) {
  const partner1Name = (fields.partner1Name as string) || "Partner 1";
  const partner2Name = (fields.partner2Name as string) || "Partner 2";
  const tasks = (fields.tasks as Task[]) || [];

  // Memoize stable rotation values for each task to prevent jitter
  const taskRotations = useMemo(() => {
    const rotations: Record<string, number> = {};
    tasks.forEach(task => {
      // Use task ID to generate a stable "random" rotation
      const hash = task.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      rotations[task.id] = ((hash % 100) - 50) / 50 * 2; // Range: -2 to 2 degrees
    });
    return rotations;
  }, [tasks.map(t => t.id).join(',')]);

  // Drag and drop state
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<Task["status"] | null>(null);

  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [showAddTask, setShowAddTask] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskAssignee, setNewTaskAssignee] = useState<Task["assignee"]>("unassigned");
  const [newTaskColor, setNewTaskColor] = useState<Task["color"]>("yellow");
  const [filterAssignee, setFilterAssignee] = useState<Task["assignee"] | "all">("all");

  // Get budget categories from budget page
  const budgetPage = allPages.find(p => p.templateId === "budget");
  const budgetFields = (budgetPage?.fields || {}) as Record<string, unknown>;
  const budgetItems = (budgetFields.items as Record<string, unknown>[]) || [];
  const budgetCategories = [...new Set(budgetItems.map(item => item.category as string).filter(Boolean))];

  // Get suggested tasks based on budget categories
  const getSuggestedTasks = () => {
    const suggestions: { category: string; tasks: string[] }[] = [];
    const existingTaskTitles = tasks.map(t => t.title.toLowerCase());
    
    budgetCategories.forEach(category => {
      const categoryTasks = SUGGESTED_TASKS_BY_CATEGORY[category] || [];
      const newSuggestions = categoryTasks.filter(
        task => !existingTaskTitles.includes(task.toLowerCase())
      );
      if (newSuggestions.length > 0) {
        suggestions.push({ category, tasks: newSuggestions });
      }
    });
    
    return suggestions;
  };

  const suggestedTasks = getSuggestedTasks();

  // Generate unique ID
  const generateId = () => `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Group tasks by status
  const todoTasks = tasks.filter(t => t.status === "todo" && (filterAssignee === "all" || t.assignee === filterAssignee));
  const inProgressTasks = tasks.filter(t => t.status === "in-progress" && (filterAssignee === "all" || t.assignee === filterAssignee));
  const doneTasks = tasks.filter(t => t.status === "done" && (filterAssignee === "all" || t.assignee === filterAssignee));

  const addTask = () => {
    if (!newTaskTitle.trim()) return;
    
    const newTask: Task = {
      id: generateId(),
      title: newTaskTitle.trim(),
      assignee: newTaskAssignee,
      status: "todo",
      color: newTaskColor,
    };
    
    updateField("tasks", [...tasks, newTask]);
    setNewTaskTitle("");
    setShowAddTask(false);
  };

  // Add a suggested task
  const addSuggestedTask = (title: string, category: string) => {
    // Assign a color based on category
    const colorMap: Record<string, Task["color"]> = {
      "Venue": "blue",
      "Catering": "green",
      "Photography": "purple",
      "Videography": "purple",
      "Florist": "pink",
      "Music / DJ": "yellow",
      "Wedding Attire": "pink",
      "Hair & Makeup": "pink",
      "Invitations & Stationery": "yellow",
      "Wedding Cake": "green",
      "Decorations": "purple",
      "Transportation": "blue",
      "Officiant": "blue",
      "Wedding Rings": "yellow",
      "Favors & Gifts": "green",
      "Honeymoon": "blue",
    };

    const newTask: Task = {
      id: generateId(),
      title,
      assignee: "unassigned",
      status: "todo",
      color: colorMap[category] || "yellow",
    };
    
    updateField("tasks", [...tasks, newTask]);
    toast.success(`Added: ${title}`);
  };

  // Add all suggested tasks from a category
  const addAllFromCategory = (category: string, categoryTasks: string[]) => {
    const colorMap: Record<string, Task["color"]> = {
      "Venue": "blue",
      "Catering": "green",
      "Photography": "purple",
      "Videography": "purple",
      "Florist": "pink",
      "Music / DJ": "yellow",
      "Wedding Attire": "pink",
      "Hair & Makeup": "pink",
      "Invitations & Stationery": "yellow",
      "Wedding Cake": "green",
      "Decorations": "purple",
      "Transportation": "blue",
      "Officiant": "blue",
      "Wedding Rings": "yellow",
      "Favors & Gifts": "green",
      "Honeymoon": "blue",
    };

    const newTasks: Task[] = categoryTasks.map(title => ({
      id: generateId(),
      title,
      assignee: "unassigned" as const,
      status: "todo" as const,
      color: colorMap[category] || "yellow",
    }));
    
    updateField("tasks", [...tasks, ...newTasks]);
    toast.success(`Added ${categoryTasks.length} tasks from ${category}`);
  };

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    const updated = tasks.map(t => 
      t.id === taskId ? { ...t, ...updates } : t
    );
    updateField("tasks", updated);
  };

  const deleteTask = (taskId: string) => {
    updateField("tasks", tasks.filter(t => t.id !== taskId));
  };

  const moveTask = (taskId: string, newStatus: Task["status"]) => {
    updateTask(taskId, { status: newStatus });
  };

  const getAssigneeName = (assignee: Task["assignee"]) => {
    switch (assignee) {
      case "partner1": return partner1Name;
      case "partner2": return partner2Name;
      case "both": return "Both";
      default: return "Unassigned";
    }
  };

  const getAssigneeIcon = (assignee: Task["assignee"]) => {
    switch (assignee) {
      case "partner1":
      case "partner2":
        return <User className="w-3 h-3" />;
      case "both":
        return <UsersIcon className="w-3 h-3" />;
      default:
        return null;
    }
  };

  // Stats
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === "done").length;
  const partner1Tasks = tasks.filter(t => t.assignee === "partner1" && t.status !== "done").length;
  const partner2Tasks = tasks.filter(t => t.assignee === "partner2" && t.status !== "done").length;

  // Drag handlers
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', taskId);
    setTimeout(() => {
      (e.target as HTMLElement).style.opacity = '0.5';
    }, 0);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setDraggedTaskId(null);
    setDragOverColumn(null);
    (e.target as HTMLElement).style.opacity = '1';
  };

  const handleDragOver = (e: React.DragEvent, status: Task["status"]) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverColumn(status);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = (e: React.DragEvent, newStatus: Task["status"]) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId && draggedTaskId) {
      moveTask(taskId, newStatus);
    }
    setDraggedTaskId(null);
    setDragOverColumn(null);
  };

  // Post-it card component
  const PostItCard = ({ task }: { task: Task }) => {
    const isEditing = editingTask === task.id;
    const [editTitle, setEditTitle] = useState(task.title);
    const rotation = taskRotations[task.id] || 0;
    const isDragging = draggedTaskId === task.id;

    return (
      <div
        draggable={!isEditing}
        onDragStart={(e) => handleDragStart(e, task.id)}
        onDragEnd={handleDragEnd}
        className={`
          relative p-4 pb-10 border-2 rounded-sm
          ${POST_IT_COLORS[task.color]}
          shadow-md ${POST_IT_SHADOWS[task.color]}
          transition-all duration-200
          group
          ${isDragging ? 'opacity-50 scale-105' : ''}
          ${!isEditing ? 'cursor-grab active:cursor-grabbing' : ''}
        `}
        style={{ 
          transform: `rotate(${rotation}deg)`,
          minHeight: '160px'
        }}
      >
        {/* Drag handle */}
        <div className="absolute top-1 right-1 text-warm-400 opacity-0 group-hover:opacity-50 transition-opacity cursor-grab">
          <GripVertical className="w-4 h-4" />
        </div>

        {/* Delete button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            deleteTask(task.id);
          }}
          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs shadow-md hover:bg-red-600 z-10"
        >
          ×
        </button>

        {/* Task content */}
        {isEditing ? (
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onBlur={() => {
              updateTask(task.id, { title: editTitle });
              setEditingTask(null);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                updateTask(task.id, { title: editTitle });
                setEditingTask(null);
              }
            }}
            className="w-full bg-transparent border-none font-medium text-warm-800 focus:outline-none"
            autoFocus
          />
        ) : (
          <p
            onClick={() => setEditingTask(task.id)}
            className="font-medium text-warm-800 cursor-text min-h-[40px]"
          >
            {task.title}
          </p>
        )}

        {/* Task metadata */}
        <div className="mt-3 pt-2 border-t border-warm-200/50 flex items-center justify-between">
          {/* Assignee */}
          <div className="flex items-center gap-1 text-xs text-warm-600">
            {getAssigneeIcon(task.assignee)}
            <span>{getAssigneeName(task.assignee)}</span>
          </div>
        </div>

        {/* Quick actions */}
        <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {task.status !== "todo" && (
            <button
              onClick={() => moveTask(task.id, "todo")}
              className="w-6 h-6 bg-warm-200 rounded text-warm-600 text-xs hover:bg-warm-300 flex items-center justify-center"
              title="Move to To Do"
            >
              ←
            </button>
          )}
          {task.status !== "in-progress" && (
            <button
              onClick={() => moveTask(task.id, "in-progress")}
              className="w-6 h-6 bg-amber-200 rounded text-amber-700 text-xs hover:bg-amber-300 flex items-center justify-center"
              title="Move to In Progress"
            >
              ●
            </button>
          )}
          {task.status !== "done" && (
            <button
              onClick={() => moveTask(task.id, "done")}
              className="w-6 h-6 bg-green-200 rounded text-green-700 text-xs hover:bg-green-300 flex items-center justify-center"
              title="Mark Done"
            >
              <Check className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Color picker */}
        <div className="absolute top-2 left-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {(["yellow", "pink", "blue", "green", "purple"] as const).map((color) => (
            <button
              key={color}
              onClick={() => updateTask(task.id, { color })}
              className={`w-4 h-4 rounded-full border-2 border-white shadow-sm ${
                color === "yellow" ? "bg-yellow-300" :
                color === "pink" ? "bg-pink-300" :
                color === "blue" ? "bg-blue-300" :
                color === "green" ? "bg-green-300" :
                "bg-purple-300"
              } ${task.color === color ? "ring-2 ring-warm-400" : ""}`}
            />
          ))}
        </div>

        {/* Assignee picker */}
        <select
          value={task.assignee}
          onChange={(e) => updateTask(task.id, { assignee: e.target.value as Task["assignee"] })}
          className="absolute bottom-2 left-2 text-xs bg-white/50 border border-warm-200 rounded px-1 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <option value="unassigned">Unassigned</option>
          <option value="partner1">{partner1Name}</option>
          <option value="partner2">{partner2Name}</option>
          <option value="both">Both</option>
        </select>
      </div>
    );
  };

  // Column component
  const Column = ({ 
    title, 
    tasks: columnTasks, 
    status, 
    headerColor 
  }: { 
    title: string; 
    tasks: Task[]; 
    status: Task["status"];
    headerColor: string;
  }) => {
    const isDropTarget = dragOverColumn === status;
    
    return (
      <div className="flex-1 min-w-[280px]">
        <div className={`${headerColor} rounded-t-lg px-4 py-3 flex items-center justify-between`}>
          <h3 className="font-medium text-warm-800">{title}</h3>
          <span className="text-sm text-warm-600 bg-white/50 px-2 py-0.5 rounded-full">
            {columnTasks.length}
          </span>
        </div>
        <div 
          className={`
            bg-warm-100/50 rounded-b-lg p-4 min-h-[400px] space-y-4
            transition-colors duration-200
            ${isDropTarget ? 'bg-warm-200/70 ring-2 ring-warm-400 ring-inset' : ''}
          `}
          onDragOver={(e) => handleDragOver(e, status)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, status)}
        >
          {columnTasks.map((task) => (
            <PostItCard key={task.id} task={task} />
          ))}
          {columnTasks.length === 0 && (
            <p className={`text-center text-sm py-8 italic ${isDropTarget ? 'text-warm-600' : 'text-warm-400'}`}>
              {isDropTarget ? 'Drop here!' : 'No tasks here yet'}
            </p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white shadow-lg p-8 md:p-12">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-serif font-light tracking-wide">
            {page.title}
          </h2>
          <div className="w-10 h-px bg-warm-400 mx-auto mt-4" />
        </div>

        {/* Partner Names Setup */}
        <div className="mb-8 p-6 bg-warm-50 border border-warm-200 rounded-lg">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Label className="text-sm text-warm-600 whitespace-nowrap">Partner 1:</Label>
              <Input
                value={partner1Name === "Partner 1" ? "" : partner1Name}
                onChange={(e) => updateField("partner1Name", e.target.value || "Partner 1")}
                placeholder="Partner 1"
                className="w-32 text-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-sm text-warm-600 whitespace-nowrap">Partner 2:</Label>
              <Input
                value={partner2Name === "Partner 2" ? "" : partner2Name}
                onChange={(e) => updateField("partner2Name", e.target.value || "Partner 2")}
                placeholder="Partner 2"
                className="w-32 text-sm"
              />
            </div>
            <div className="flex-1" />
            {suggestedTasks.length > 0 && (
              <Button
                variant="outline"
                onClick={() => setShowSuggestions(true)}
                className="mr-2"
              >
                <Star className="w-4 h-4 mr-2" />
                Get Suggestions ({suggestedTasks.reduce((acc, cat) => acc + cat.tasks.length, 0)})
              </Button>
            )}
            <Button
              onClick={() => setShowAddTask(true)}
              className="bg-warm-600 hover:bg-warm-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Task
            </Button>
          </div>
        </div>

        {/* Stats & Filter */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-2xl font-light text-warm-700">{totalTasks}</p>
              <p className="text-xs tracking-wider uppercase text-warm-500">Total</p>
            </div>
            <div className="h-8 w-px bg-warm-200" />
            <div className="text-center">
              <p className="text-xl font-light text-green-600">{completedTasks}</p>
              <p className="text-xs tracking-wider uppercase text-warm-500">Done</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-light text-warm-600">{partner1Tasks}</p>
              <p className="text-xs tracking-wider uppercase text-warm-500">{partner1Name}</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-light text-warm-600">{partner2Tasks}</p>
              <p className="text-xs tracking-wider uppercase text-warm-500">{partner2Name}</p>
            </div>
          </div>

          {/* Filter */}
          <div className="flex items-center gap-2">
            <Label className="text-sm text-warm-500">Filter:</Label>
            <select
              value={filterAssignee}
              onChange={(e) => setFilterAssignee(e.target.value as Task["assignee"] | "all")}
              className="px-3 py-1.5 border border-warm-300 text-sm rounded bg-white"
            >
              <option value="all">All Tasks</option>
              <option value="partner1">{partner1Name}</option>
              <option value="partner2">{partner2Name}</option>
              <option value="both">Both</option>
              <option value="unassigned">Unassigned</option>
            </select>
          </div>
        </div>

        {/* Task Board Columns */}
        <div className="flex gap-6 overflow-x-auto pb-4">
          <Column
            title="To Do"
            tasks={todoTasks}
            status="todo"
            headerColor="bg-warm-200"
          />
          <Column
            title="In Progress"
            tasks={inProgressTasks}
            status="in-progress"
            headerColor="bg-amber-200"
          />
          <Column
            title="Done"
            tasks={doneTasks}
            status="done"
            headerColor="bg-green-200"
          />
        </div>
      </div>

      {/* Add Task Dialog */}
      <Dialog open={showAddTask} onOpenChange={setShowAddTask}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
            <DialogDescription>
              Create a new task and assign it to yourself or your partner.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            {/* Task title */}
            <div className="space-y-2">
              <Label>What needs to be done?</Label>
              <Input
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="e.g., Book photographer"
                onKeyDown={(e) => e.key === "Enter" && addTask()}
                autoFocus
              />
            </div>

            {/* Assignee */}
            <div className="space-y-2">
              <Label>Who&apos;s responsible?</Label>
              <div className="flex gap-2">
                {(["unassigned", "partner1", "partner2", "both"] as const).map((assignee) => (
                  <button
                    key={assignee}
                    onClick={() => setNewTaskAssignee(assignee)}
                    className={`flex-1 px-3 py-2 border rounded-lg text-sm transition-colors ${
                      newTaskAssignee === assignee
                        ? "border-warm-500 bg-warm-50 text-warm-700"
                        : "border-warm-200 hover:border-warm-300"
                    }`}
                  >
                    {assignee === "partner1" ? partner1Name :
                     assignee === "partner2" ? partner2Name :
                     assignee === "both" ? "Both" : "Unassigned"}
                  </button>
                ))}
              </div>
            </div>

            {/* Color */}
            <div className="space-y-2">
              <Label>Post-it color</Label>
              <div className="flex gap-3">
                {(["yellow", "pink", "blue", "green", "purple"] as const).map((color) => (
                  <button
                    key={color}
                    onClick={() => setNewTaskColor(color)}
                    className={`w-10 h-10 rounded-lg border-2 transition-all ${
                      color === "yellow" ? "bg-yellow-200 border-yellow-300" :
                      color === "pink" ? "bg-pink-200 border-pink-300" :
                      color === "blue" ? "bg-blue-200 border-blue-300" :
                      color === "green" ? "bg-green-200 border-green-300" :
                      "bg-purple-200 border-purple-300"
                    } ${newTaskColor === color ? "ring-2 ring-warm-500 ring-offset-2" : "hover:scale-105"}`}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-warm-200">
            <Button variant="outline" onClick={() => setShowAddTask(false)} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={addTask}
              disabled={!newTaskTitle.trim()}
              className="flex-1 bg-warm-600 hover:bg-warm-700 text-white"
            >
              Add Task
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Suggestions Dialog */}
      <Dialog open={showSuggestions} onOpenChange={setShowSuggestions}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500" />
              Suggested Tasks
            </DialogTitle>
            <DialogDescription>
              Based on your budget items, here are some tasks you might want to add.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-6">
            {suggestedTasks.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-warm-500">No suggestions available.</p>
                <p className="text-sm text-warm-400 mt-2">
                  Add vendors to your budget to get task suggestions!
                </p>
              </div>
            ) : (
              suggestedTasks.map(({ category, tasks: categoryTasks }) => (
                <div key={category} className="border border-warm-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-warm-700">{category}</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => addAllFromCategory(category, categoryTasks)}
                      className="text-xs"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Add All ({categoryTasks.length})
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {categoryTasks.map((task) => (
                      <div
                        key={task}
                        className="flex items-center justify-between py-2 px-3 bg-warm-50 rounded hover:bg-warm-100 group"
                      >
                        <span className="text-sm text-warm-600">{task}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => addSuggestedTask(task, category)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity h-7 px-2"
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="flex gap-3 pt-4 border-t border-warm-200">
            <Button
              variant="outline"
              onClick={() => setShowSuggestions(false)}
              className="flex-1"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
