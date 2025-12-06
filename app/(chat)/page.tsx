"use client";

import { ScribeChat } from "@/components/scribe-chat";
import { useBrowser } from "@/components/layout/browser-context";



export default function ChatPage() {
  const { tabs, activeTabId } = useBrowser();
  const activeTab = tabs.find(tab => tab.id === activeTabId);

  const toolComponents: { [key: string]: React.ComponentType } = {
    Dashboard: require("@/components/tools/DashboardTool").default,
    Budget: require("@/components/tools/BudgetTool").default,
    Checklist: require("@/components/tools/ChecklistTool").default,
    Guests: require("@/components/tools/GuestsTool").default,
    Vendors: require("@/components/tools/VendorsTool").default,
    Inspiration: require("@/components/tools/InspoTool").default,
    Timeline: require("@/components/tools/TimelineTool").default,
    Settings: require("@/components/tools/SettingsTool").default,
    Chat: require("@/components/tools/ScribeChatTool").default,
  };

  const ActiveTool = toolComponents[activeTab?.title || "Dashboard"];

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto">
        <ActiveTool />
      </div>
    </div>
  );
}