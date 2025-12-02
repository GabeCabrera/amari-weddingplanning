/**
 * Chat Layout - Claude-style
 * π-ID: 3.14159.5.1
 * 
 * Collapsible sidebar with conversation history.
 * Main area is full-width chat.
 */

import { ReactNode } from "react";

export default function ChatLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-canvas flex">
      {children}
    </div>
  );
}
