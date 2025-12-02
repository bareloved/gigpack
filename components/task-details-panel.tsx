"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Maximize2,
  MoreHorizontal,
  Clock3,
  PenSquare,
  X,
  Calendar,
  ArrowUp,
  ArrowDown,
  Minus,
} from "lucide-react";

// ============================================================================
// Types
// ============================================================================

export type TaskStatus = "todo" | "in-progress" | "done" | "blocked";
export type TaskPriority = "low" | "medium" | "high";

export interface TaskAssignee {
  name: string;
  avatarUrl?: string;
}

export interface TaskTag {
  label: string;
  color: "purple" | "green" | "blue" | "amber" | "pink";
}

export interface TaskDetailsPanelProps {
  /** Whether the panel is open */
  open: boolean;
  /** Callback when panel should close */
  onOpenChange: (open: boolean) => void;
  /** Task title */
  title: string;
  /** Assigned user */
  assignee?: TaskAssignee;
  /** Current status */
  status: TaskStatus;
  /** Due date as string (e.g., "31 May 2025") */
  dueDate?: string;
  /** Priority level */
  priority: TaskPriority;
  /** Tags/labels */
  tags?: TaskTag[];
  /** Number of comments */
  commentsCount?: number;
  /** Number of attachments */
  attachmentsCount?: number;
  /** Callback when edit is clicked */
  onEdit?: () => void;
  /** Callback when a comment is submitted */
  onSubmitComment?: (comment: string) => void;
}

// ============================================================================
// Status Config
// ============================================================================

const statusConfig: Record<TaskStatus, { label: string; color: string }> = {
  todo: { label: "To Do", color: "bg-slate-400" },
  "in-progress": { label: "In progress", color: "bg-amber-400" },
  done: { label: "Done", color: "bg-emerald-400" },
  blocked: { label: "Blocked", color: "bg-red-400" },
};

// ============================================================================
// Priority Config
// ============================================================================

const priorityConfig: Record<
  TaskPriority,
  { label: string; color: string; Icon: typeof ArrowUp }
> = {
  low: { label: "Low", color: "text-blue-400", Icon: ArrowDown },
  medium: { label: "Medium", color: "text-amber-400", Icon: Minus },
  high: { label: "High", color: "text-red-400", Icon: ArrowUp },
};

// ============================================================================
// Custom Tabs Component (styled for this panel)
// ============================================================================

interface TabItem {
  id: string;
  label: string;
  count?: number;
}

interface PanelTabsProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

function PanelTabs({ tabs, activeTab, onTabChange }: PanelTabsProps) {
  return (
    <div className="flex items-center gap-1 border-b border-neutral-800">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "relative px-4 py-3 text-sm font-medium transition-colors",
              "flex items-center gap-2",
              isActive
                ? "text-white"
                : "text-neutral-500 hover:text-neutral-300"
            )}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={cn(
                  "inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-semibold rounded-md",
                  isActive
                    ? "bg-violet-600 text-white"
                    : "bg-neutral-800 text-neutral-400"
                )}
              >
                {tab.count}
              </span>
            )}
            {/* Active indicator line */}
            {isActive && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-500 rounded-full" />
            )}
          </button>
        );
      })}
    </div>
  );
}

// ============================================================================
// Metadata Row Component
// ============================================================================

interface MetadataRowProps {
  label: string;
  children: React.ReactNode;
}

function MetadataRow({ label, children }: MetadataRowProps) {
  return (
    <div className="flex items-center gap-4">
      <span className="w-24 shrink-0 text-xs font-medium uppercase tracking-wide text-neutral-500">
        {label}
      </span>
      <div className="flex items-center gap-2">{children}</div>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function TaskDetailsPanel({
  open,
  onOpenChange,
  title,
  assignee,
  status,
  dueDate,
  priority,
  tags = [],
  commentsCount = 0,
  attachmentsCount = 0,
  onEdit,
  onSubmitComment,
}: TaskDetailsPanelProps) {
  const [activeTab, setActiveTab] = React.useState("comments");
  const [commentText, setCommentText] = React.useState("");

  const statusInfo = statusConfig[status];
  const priorityInfo = priorityConfig[priority];
  const PriorityIcon = priorityInfo.Icon;

  const tabs: TabItem[] = [
    { id: "description", label: "Description" },
    { id: "comments", label: "Comments", count: commentsCount },
    { id: "attachments", label: "Attachments", count: attachmentsCount },
    { id: "activities", label: "Activities" },
  ];

  const handleSubmit = () => {
    if (commentText.trim() && onSubmitComment) {
      onSubmitComment(commentText.trim());
      setCommentText("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      handleSubmit();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "w-full max-w-[640px] p-0 gap-0 overflow-hidden",
          "bg-[#111119] border-neutral-800 rounded-2xl",
          "shadow-2xl shadow-black/50",
          // Remove the default close button
          "[&>button]:hidden"
        )}
      >
        {/* Accessible title (visually hidden but required for a11y) */}
        <DialogTitle className="sr-only">{title}</DialogTitle>

        {/* Panel Content */}
        <div className="flex flex-col max-h-[85vh]">
          {/* ================================================================
              Top Icon Bar
              ================================================================ */}
          <div className="flex items-center justify-between px-5 pt-4 pb-2">
            {/* Left: Expand icon */}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800/50"
            >
              <Maximize2 className="h-4 w-4" />
            </Button>

            {/* Right: Action icons */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800/50"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800/50"
              >
                <Clock3 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onEdit}
                className="h-8 w-8 text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800/50"
              >
                <PenSquare className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange(false)}
                className="h-8 w-8 text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800/50"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* ================================================================
              Scrollable Content Area
              ================================================================ */}
          <div className="flex-1 overflow-y-auto px-6 pb-4">
            {/* Title */}
            <h2 className="text-xl font-semibold leading-snug text-white mt-1 mb-6">
              {title}
            </h2>

            {/* ============================================================
                Metadata Section
                ============================================================ */}
            <div className="space-y-4 mb-6">
              {/* Assignee */}
              {assignee && (
                <MetadataRow label="Assignee">
                  <Avatar size="sm">
                    {assignee.avatarUrl ? (
                      <AvatarImage
                        src={assignee.avatarUrl}
                        alt={assignee.name}
                      />
                    ) : (
                      <AvatarFallback className="bg-violet-600 text-white">
                        {assignee.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <span className="text-sm text-white">{assignee.name}</span>
                </MetadataRow>
              )}

              {/* Status */}
              <MetadataRow label="Status">
                <span
                  className={cn(
                    "w-2 h-2 rounded-full shrink-0",
                    statusInfo.color
                  )}
                />
                <span className="text-sm text-white">{statusInfo.label}</span>
              </MetadataRow>

              {/* Due Date */}
              {dueDate && (
                <MetadataRow label="Due Date">
                  <Calendar className="h-4 w-4 text-neutral-400" />
                  <span className="text-sm text-white">{dueDate}</span>
                </MetadataRow>
              )}

              {/* Priority */}
              <MetadataRow label="Priority">
                <PriorityIcon className={cn("h-4 w-4", priorityInfo.color)} />
                <span className={cn("text-sm font-medium", priorityInfo.color)}>
                  {priorityInfo.label}
                </span>
              </MetadataRow>

              {/* Tags */}
              {tags.length > 0 && (
                <MetadataRow label="Tags">
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag, index) => (
                      <Badge key={index} variant={tag.color}>
                        {tag.label}
                      </Badge>
                    ))}
                  </div>
                </MetadataRow>
              )}
            </div>

            {/* ============================================================
                Tabs Section
                ============================================================ */}
            <PanelTabs
              tabs={tabs}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />

            {/* Tab Content */}
            <div className="mt-4 min-h-[120px]">
              {activeTab === "description" && (
                <div className="text-sm text-neutral-400">
                  <p>
                    No description provided. Click edit to add a description for
                    this task.
                  </p>
                </div>
              )}

              {activeTab === "comments" && (
                <div className="space-y-4">
                  {/* Placeholder for existing comments */}
                  {commentsCount > 0 && (
                    <div className="space-y-3 pb-4 border-b border-neutral-800">
                      <p className="text-xs text-neutral-500 uppercase tracking-wide">
                        Recent comments
                      </p>
                      {/* Example comment placeholder */}
                      <div className="flex gap-3">
                        <Avatar size="sm">
                          <AvatarFallback className="bg-emerald-600 text-white text-[10px]">
                            JD
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="text-sm text-white">
                            We should prioritize the color contrast ratios for
                            WCAG AA compliance.
                          </p>
                          <p className="text-xs text-neutral-500 mt-1">
                            John Doe · 2 hours ago
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "attachments" && (
                <div className="text-sm text-neutral-400">
                  <p>
                    {attachmentsCount > 0
                      ? `${attachmentsCount} attachments`
                      : "No attachments yet."}
                  </p>
                </div>
              )}

              {activeTab === "activities" && (
                <div className="text-sm text-neutral-400">
                  <p>Activity log will appear here.</p>
                </div>
              )}
            </div>
          </div>

          {/* ================================================================
              Comment Input Area (pinned at bottom)
              ================================================================ */}
          <div className="border-t border-neutral-800 px-6 py-4 bg-[#0d0d14]">
            <div className="flex items-end gap-3">
              <Textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Could you elaborate?"
                className={cn(
                  "flex-1 min-h-[72px] max-h-[160px] resize-none",
                  "bg-neutral-900 border-neutral-800 rounded-xl",
                  "text-white placeholder:text-neutral-500",
                  "focus-visible:ring-violet-500/50 focus-visible:border-violet-500/50"
                )}
              />
              <Button
                onClick={handleSubmit}
                disabled={!commentText.trim()}
                className={cn(
                  "h-10 px-5 rounded-xl font-medium",
                  "bg-violet-600 hover:bg-violet-500 text-white",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                Submit
              </Button>
            </div>
            <p className="text-xs text-neutral-600 mt-2">
              Press ⌘+Enter to submit
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
// Example/Default Export with Demo Data
// ============================================================================

/** Demo data matching the screenshot */
export const demoTaskData: Omit<TaskDetailsPanelProps, "open" | "onOpenChange"> = {
  title:
    "Update the Design System to Support Dark Mode and High Contrast Accessibility Options",
  assignee: {
    name: "Dominik Dutkiewicz",
    avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face",
  },
  status: "in-progress",
  dueDate: "31 May 2025",
  priority: "high",
  tags: [
    { label: "Hologram", color: "purple" },
    { label: "Design System", color: "green" },
  ],
  commentsCount: 3,
  attachmentsCount: 4,
};

export default TaskDetailsPanel;

