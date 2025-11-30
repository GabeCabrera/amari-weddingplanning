"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, MessageSquare, Mail, Smartphone, Send, Users2, Crown, Star, Copy, ChevronDown, ChevronUp } from "lucide-react";
import { Heart } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { type BaseRendererProps, type PartyMember, type MessageGroup, type PartyGroup } from "./types";

// Helper to get role icon
function getRoleIcon(role: string) {
  if (role === "Maid of Honor" || role === "Best Man") {
    return <Crown className="w-3 h-3 text-amber-500" />;
  }
  return null;
}

// Party Section Component - Mobile Optimized
interface PartySectionProps {
  title: string;
  icon: React.ReactNode;
  iconColor: string;
  group: PartyGroup;
  members: PartyMember[];
  roleOptions?: string[];
  onAddMember: (group: PartyGroup) => void;
  onUpdateMember: (group: PartyGroup, index: number, key: keyof PartyMember, value: string) => void;
  onRemoveMember: (group: PartyGroup, index: number) => void;
  onOpenMessage: (group: MessageGroup) => void;
}

function PartySection({
  title,
  icon,
  iconColor,
  group,
  members,
  roleOptions,
  onAddMember,
  onUpdateMember,
  onRemoveMember,
  onOpenMessage,
}: PartySectionProps) {
  const [expandedMember, setExpandedMember] = useState<number | null>(null);

  return (
    <div className="p-4 md:p-6 border border-warm-200 rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={iconColor}>{icon}</div>
          <h3 className="text-xs md:text-sm tracking-wider uppercase text-warm-500">{title}</h3>
          <span className="text-xs text-warm-400">({members.length})</span>
        </div>
        <div className="flex items-center gap-1 md:gap-2">
          {members.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenMessage(group)}
              className="text-xs hidden sm:flex"
            >
              <MessageSquare className="w-3 h-3 mr-1" />
              Message
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={() => onAddMember(group)}>
            <Plus className="w-4 h-4 md:mr-1" />
            <span className="hidden md:inline">Add</span>
          </Button>
        </div>
      </div>

      {members.length > 0 ? (
        <div className="space-y-2">
          {members.map((member, index) => (
            <div key={`${group}-${index}`} className="border border-warm-100 rounded-lg overflow-hidden">
              {/* Mobile: Collapsible Card */}
              <div 
                className="md:hidden"
              >
                <button
                  onClick={() => setExpandedMember(expandedMember === index ? null : index)}
                  className="w-full p-3 flex items-center justify-between bg-white"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-medium text-warm-700 truncate">
                      {member.name || "New Member"}
                    </span>
                    {getRoleIcon(member.role)}
                    {member.role && (
                      <span className="text-xs text-warm-400 truncate">• {member.role}</span>
                    )}
                  </div>
                  {expandedMember === index ? (
                    <ChevronUp className="w-4 h-4 text-warm-400 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-warm-400 flex-shrink-0" />
                  )}
                </button>
                
                {expandedMember === index && (
                  <div className="p-3 pt-0 space-y-3 border-t border-warm-100">
                    <div className="space-y-2">
                      <Input
                        value={member.name || ""}
                        onChange={(e) => onUpdateMember(group, index, "name", e.target.value)}
                        placeholder="Name"
                        className="text-sm"
                      />
                      {roleOptions ? (
                        <select
                          value={member.role || ""}
                          onChange={(e) => onUpdateMember(group, index, "role", e.target.value)}
                          className="w-full px-3 py-2 border border-warm-300 text-sm focus:outline-none focus:border-warm-500 bg-white rounded"
                        >
                          <option value="">Role...</option>
                          {roleOptions.map((role) => (
                            <option key={role} value={role}>{role}</option>
                          ))}
                        </select>
                      ) : (
                        <Input
                          value={member.role || ""}
                          onChange={(e) => onUpdateMember(group, index, "role", e.target.value)}
                          placeholder="Role"
                          className="text-sm"
                        />
                      )}
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-warm-400 flex-shrink-0" />
                        <Input
                          value={member.email || ""}
                          onChange={(e) => onUpdateMember(group, index, "email", e.target.value)}
                          placeholder="Email"
                          className="text-sm"
                          type="email"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Smartphone className="w-4 h-4 text-warm-400 flex-shrink-0" />
                        <Input
                          value={member.phone || ""}
                          onChange={(e) => onUpdateMember(group, index, "phone", e.target.value)}
                          placeholder="Phone"
                          className="text-sm"
                          type="tel"
                        />
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onRemoveMember(group, index)}
                      className="w-full text-red-500 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Remove
                    </Button>
                  </div>
                )}
              </div>

              {/* Desktop: Grid Layout */}
              <div className="hidden md:grid md:grid-cols-[1fr,0.8fr,1fr,1fr,40px] gap-2 items-center p-3 group bg-white">
                <div className="flex items-center gap-1">
                  <Input
                    value={member.name || ""}
                    onChange={(e) => onUpdateMember(group, index, "name", e.target.value)}
                    placeholder="Name"
                    className="text-sm"
                  />
                  {getRoleIcon(member.role)}
                </div>
                {roleOptions ? (
                  <select
                    value={member.role || ""}
                    onChange={(e) => onUpdateMember(group, index, "role", e.target.value)}
                    className="px-2 py-1.5 border border-warm-300 text-sm focus:outline-none focus:border-warm-500 bg-white rounded"
                  >
                    <option value="">Role...</option>
                    {roleOptions.map((role) => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                ) : (
                  <Input
                    value={member.role || ""}
                    onChange={(e) => onUpdateMember(group, index, "role", e.target.value)}
                    placeholder="Role"
                    className="text-sm"
                  />
                )}
                <div className="flex items-center gap-1">
                  <Mail className="w-3 h-3 text-warm-400 flex-shrink-0" />
                  <Input
                    value={member.email || ""}
                    onChange={(e) => onUpdateMember(group, index, "email", e.target.value)}
                    placeholder="Email"
                    className="text-sm"
                    type="email"
                  />
                </div>
                <div className="flex items-center gap-1">
                  <Smartphone className="w-3 h-3 text-warm-400 flex-shrink-0" />
                  <Input
                    value={member.phone || ""}
                    onChange={(e) => onUpdateMember(group, index, "phone", e.target.value)}
                    placeholder="Phone"
                    className="text-sm"
                    type="tel"
                  />
                </div>
                <button
                  onClick={() => onRemoveMember(group, index)}
                  className="p-1 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs md:text-sm text-warm-400 italic text-center py-4">
          No {title.toLowerCase()} yet. Click &quot;Add&quot; to get started.
        </p>
      )}

      {/* Mobile Message Button */}
      {members.length > 0 && (
        <div className="mt-3 sm:hidden">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenMessage(group)}
            className="w-full text-xs"
          >
            <MessageSquare className="w-3 h-3 mr-1" />
            Message {title}
          </Button>
        </div>
      )}
    </div>
  );
}

export function WeddingPartyRenderer({ page, fields, updateField }: BaseRendererProps) {
  const bridesmaids = (fields.bridesmaids as PartyMember[]) || [];
  const groomsmen = (fields.groomsmen as PartyMember[]) || [];
  const others = (fields.others as PartyMember[]) || [];

  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const [messageGroup, setMessageGroup] = useState<MessageGroup>("all");
  const [messageType, setMessageType] = useState<"email" | "text">("email");
  const [messageSubject, setMessageSubject] = useState("");
  const [messageBody, setMessageBody] = useState("");

  // Get recipients based on group
  const getRecipients = (group: MessageGroup): PartyMember[] => {
    switch (group) {
      case "bridesmaids":
        return bridesmaids;
      case "groomsmen":
        return groomsmen;
      case "others":
        return others;
      case "all":
        return [...bridesmaids, ...groomsmen, ...others];
    }
  };

  const recipients = getRecipients(messageGroup);
  const emailRecipients = recipients.filter(r => r.email);
  const phoneRecipients = recipients.filter(r => r.phone);

  const openMessageDialog = (group: MessageGroup) => {
    setMessageGroup(group);
    setShowMessageDialog(true);
  };

  const sendEmail = () => {
    const emails = emailRecipients.map(r => r.email).join(",");
    const subject = encodeURIComponent(messageSubject);
    const body = encodeURIComponent(messageBody);
    window.open(`mailto:${emails}?subject=${subject}&body=${body}`, "_blank");
    toast.success("Email client opened!");
    setShowMessageDialog(false);
    setMessageSubject("");
    setMessageBody("");
  };

  const sendText = () => {
    const phones = phoneRecipients.map(r => r.phone.replace(/\D/g, "")).join(",");
    const body = encodeURIComponent(messageBody);
    window.open(`sms:${phones}?body=${body}`, "_blank");
    toast.success("Messages app opened!");
    setShowMessageDialog(false);
    setMessageBody("");
  };

  const copyEmails = () => {
    const emails = emailRecipients.map(r => r.email).join(", ");
    navigator.clipboard.writeText(emails);
    toast.success("Emails copied to clipboard!");
  };

  const copyPhones = () => {
    const phones = phoneRecipients.map(r => r.phone).join(", ");
    navigator.clipboard.writeText(phones);
    toast.success("Phone numbers copied to clipboard!");
  };

  const addMember = (group: PartyGroup) => {
    const newMember: PartyMember = { name: "", role: "", email: "", phone: "" };
    const current = (fields[group] as PartyMember[]) || [];
    updateField(group, [...current, newMember]);
  };

  const updateMember = (group: PartyGroup, index: number, key: keyof PartyMember, value: string) => {
    const current = (fields[group] as PartyMember[]) || [];
    const updated = [...current];
    updated[index] = { ...updated[index], [key]: value };
    updateField(group, updated);
  };

  const removeMember = (group: PartyGroup, index: number) => {
    const current = (fields[group] as PartyMember[]) || [];
    updateField(group, current.filter((_, i) => i !== index));
  };

  const groupLabel: Record<MessageGroup, string> = {
    bridesmaids: "Bridesmaids",
    groomsmen: "Groomsmen",
    others: "Other Party Members",
    all: "Entire Wedding Party",
  };

  const allMembers = [...bridesmaids, ...groomsmen, ...others];

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-0">
      <div className="bg-white shadow-lg p-4 md:p-8 lg:p-12">
        {/* Page Header */}
        <div className="text-center mb-6 md:mb-10">
          <h2 className="text-2xl md:text-3xl font-serif font-light tracking-wide">
            {page.title}
          </h2>
          <div className="w-10 h-px bg-warm-400 mx-auto mt-3 md:mt-4" />
        </div>

        {/* Quick Stats & Message All */}
        <div className="mb-6 md:mb-8 p-4 md:p-6 bg-gradient-to-br from-pink-50 to-warm-50 border border-warm-200 rounded-lg">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4 md:gap-6 overflow-x-auto">
              <div className="text-center flex-shrink-0">
                <p className="text-xl md:text-2xl font-light text-warm-700">{allMembers.length}</p>
                <p className="text-[10px] md:text-xs tracking-wider uppercase text-warm-500">Total</p>
              </div>
              <div className="h-6 md:h-8 w-px bg-warm-200 flex-shrink-0" />
              <div className="text-center flex-shrink-0">
                <p className="text-base md:text-lg font-light text-warm-600">{bridesmaids.length}</p>
                <p className="text-[9px] md:text-[10px] tracking-wider uppercase text-warm-400">Bridesmaids</p>
              </div>
              <div className="text-center flex-shrink-0">
                <p className="text-base md:text-lg font-light text-warm-600">{groomsmen.length}</p>
                <p className="text-[9px] md:text-[10px] tracking-wider uppercase text-warm-400">Groomsmen</p>
              </div>
              {others.length > 0 && (
                <div className="text-center flex-shrink-0">
                  <p className="text-base md:text-lg font-light text-warm-600">{others.length}</p>
                  <p className="text-[9px] md:text-[10px] tracking-wider uppercase text-warm-400">Others</p>
                </div>
              )}
            </div>
            {allMembers.length > 0 && (
              <Button
                onClick={() => openMessageDialog("all")}
                className="w-full sm:w-auto bg-warm-600 hover:bg-warm-700 text-white"
                size="sm"
              >
                <Send className="w-4 h-4 mr-2" />
                Message All ({allMembers.length})
              </Button>
            )}
          </div>
        </div>

        {/* Party Sections */}
        <div className="space-y-4 md:space-y-6">
          <PartySection
            title="Bridesmaids"
            icon={<Heart className="w-4 h-4" />}
            iconColor="text-pink-400"
            group="bridesmaids"
            members={bridesmaids}
            roleOptions={["Maid of Honor", "Bridesmaid", "Junior Bridesmaid"]}
            onAddMember={addMember}
            onUpdateMember={updateMember}
            onRemoveMember={removeMember}
            onOpenMessage={openMessageDialog}
          />

          <PartySection
            title="Groomsmen"
            icon={<Users2 className="w-4 h-4" />}
            iconColor="text-blue-400"
            group="groomsmen"
            members={groomsmen}
            roleOptions={["Best Man", "Groomsman", "Junior Groomsman"]}
            onAddMember={addMember}
            onUpdateMember={updateMember}
            onRemoveMember={removeMember}
            onOpenMessage={openMessageDialog}
          />

          <PartySection
            title="Other Party Members"
            icon={<Star className="w-4 h-4" />}
            iconColor="text-amber-400"
            group="others"
            members={others}
            onAddMember={addMember}
            onUpdateMember={updateMember}
            onRemoveMember={removeMember}
            onOpenMessage={openMessageDialog}
          />
        </div>
      </div>

      {/* Message Dialog */}
      <Dialog open={showMessageDialog} onOpenChange={setShowMessageDialog}>
        <DialogContent className="max-w-lg mx-4 md:mx-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base md:text-lg">
              <MessageSquare className="w-5 h-5 text-warm-500" />
              Message {groupLabel[messageGroup]}
            </DialogTitle>
            <DialogDescription className="text-sm">
              Send a message to {recipients.length} member{recipients.length !== 1 ? "s" : ""}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            {/* Recipients preview */}
            <div className="p-3 bg-warm-50 rounded text-sm">
              <p className="text-warm-500 mb-1">Recipients:</p>
              <p className="text-warm-700 text-xs md:text-sm">
                {recipients.map(r => r.name || "Unnamed").join(", ") || "No recipients"}
              </p>
              <div className="flex gap-3 md:gap-4 mt-2 text-[10px] md:text-xs text-warm-500">
                <span className="flex items-center gap-1">
                  <Mail className="w-3 h-3" />
                  {emailRecipients.length} with email
                </span>
                <span className="flex items-center gap-1">
                  <Smartphone className="w-3 h-3" />
                  {phoneRecipients.length} with phone
                </span>
              </div>
            </div>

            {/* Message type toggle */}
            <div className="flex gap-2">
              <Button
                variant={messageType === "email" ? "default" : "outline"}
                size="sm"
                onClick={() => setMessageType("email")}
                disabled={emailRecipients.length === 0}
                className={`flex-1 text-xs md:text-sm ${messageType === "email" ? "bg-warm-600" : ""}`}
              >
                <Mail className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                Email ({emailRecipients.length})
              </Button>
              <Button
                variant={messageType === "text" ? "default" : "outline"}
                size="sm"
                onClick={() => setMessageType("text")}
                disabled={phoneRecipients.length === 0}
                className={`flex-1 text-xs md:text-sm ${messageType === "text" ? "bg-warm-600" : ""}`}
              >
                <Smartphone className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                Text ({phoneRecipients.length})
              </Button>
            </div>

            {/* Email form */}
            {messageType === "email" && (
              <>
                <div className="space-y-2">
                  <Label className="text-sm">Subject</Label>
                  <Input
                    value={messageSubject}
                    onChange={(e) => setMessageSubject(e.target.value)}
                    placeholder="Wedding party update!"
                    className="text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Message</Label>
                  <Textarea
                    value={messageBody}
                    onChange={(e) => setMessageBody(e.target.value)}
                    placeholder="Hey everyone! Just wanted to share some exciting updates..."
                    rows={4}
                    className="text-sm"
                  />
                </div>
              </>
            )}

            {/* Text form */}
            {messageType === "text" && (
              <div className="space-y-2">
                <Label className="text-sm">Message</Label>
                <Textarea
                  value={messageBody}
                  onChange={(e) => setMessageBody(e.target.value)}
                  placeholder="Hey! Quick update about the wedding..."
                  rows={4}
                  className="text-sm"
                />
                <p className="text-[10px] md:text-xs text-warm-400">
                  Note: Group texting support varies by device.
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-2 md:gap-3 pt-4 border-t border-warm-200">
            {messageType === "email" ? (
              <>
                <Button variant="outline" onClick={copyEmails} className="flex-1 text-xs md:text-sm">
                  <Copy className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                  Copy
                </Button>
                <Button
                  onClick={sendEmail}
                  disabled={emailRecipients.length === 0 || !messageBody}
                  className="flex-1 bg-warm-600 hover:bg-warm-700 text-white text-xs md:text-sm"
                >
                  <Send className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                  Open Email
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={copyPhones} className="flex-1 text-xs md:text-sm">
                  <Copy className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                  Copy
                </Button>
                <Button
                  onClick={sendText}
                  disabled={phoneRecipients.length === 0 || !messageBody}
                  className="flex-1 bg-warm-600 hover:bg-warm-700 text-white text-xs md:text-sm"
                >
                  <Send className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                  Open Messages
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
