"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, MessageSquare, Mail, Smartphone, Send, Users2, Crown, Star, Copy } from "lucide-react";
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

// Party Section Component
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
  return (
    <div className="p-6 border border-warm-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={iconColor}>{icon}</div>
          <h3 className="text-sm tracking-wider uppercase text-warm-500">{title}</h3>
          <span className="text-xs text-warm-400">({members.length})</span>
        </div>
        <div className="flex items-center gap-2">
          {members.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenMessage(group)}
              className="text-xs"
            >
              <MessageSquare className="w-3 h-3 mr-1" />
              Message
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={() => onAddMember(group)}>
            <Plus className="w-4 h-4 mr-1" />
            Add
          </Button>
        </div>
      </div>

      {members.length > 0 ? (
        <div className="space-y-3">
          {members.map((member, index) => (
            <div
              key={`${group}-${index}`}
              className="grid grid-cols-[1fr,0.8fr,1fr,1fr,40px] gap-2 items-center group border-b border-warm-100 pb-3"
            >
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
                  className="px-2 py-1.5 border border-warm-300 text-sm focus:outline-none focus:border-warm-500 bg-white"
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
          ))}
        </div>
      ) : (
        <p className="text-sm text-warm-400 italic text-center py-4">
          No {title.toLowerCase()} yet. Click &quot;Add&quot; to get started.
        </p>
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
    <div className="max-w-5xl mx-auto">
      <div className="bg-white shadow-lg p-8 md:p-12">
        {/* Page Header */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-serif font-light tracking-wide">
            {page.title}
          </h2>
          <div className="w-10 h-px bg-warm-400 mx-auto mt-4" />
        </div>

        {/* Quick Stats & Message All */}
        <div className="mb-8 p-6 bg-gradient-to-br from-pink-50 to-warm-50 border border-warm-200">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-2xl font-light text-warm-700">{allMembers.length}</p>
                <p className="text-xs tracking-wider uppercase text-warm-500">Total Members</p>
              </div>
              <div className="h-8 w-px bg-warm-200" />
              <div className="text-center">
                <p className="text-lg font-light text-warm-600">{bridesmaids.length}</p>
                <p className="text-[10px] tracking-wider uppercase text-warm-400">Bridesmaids</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-light text-warm-600">{groomsmen.length}</p>
                <p className="text-[10px] tracking-wider uppercase text-warm-400">Groomsmen</p>
              </div>
              {others.length > 0 && (
                <div className="text-center">
                  <p className="text-lg font-light text-warm-600">{others.length}</p>
                  <p className="text-[10px] tracking-wider uppercase text-warm-400">Others</p>
                </div>
              )}
            </div>
            {allMembers.length > 0 && (
              <Button
                onClick={() => openMessageDialog("all")}
                className="bg-warm-600 hover:bg-warm-700 text-white"
              >
                <Send className="w-4 h-4 mr-2" />
                Message All ({allMembers.length})
              </Button>
            )}
          </div>
        </div>

        {/* Party Sections */}
        <div className="space-y-6">
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
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-warm-500" />
              Message {groupLabel[messageGroup]}
            </DialogTitle>
            <DialogDescription>
              Send a message to {recipients.length} member{recipients.length !== 1 ? "s" : ""}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            {/* Recipients preview */}
            <div className="p-3 bg-warm-50 rounded text-sm">
              <p className="text-warm-500 mb-1">Recipients:</p>
              <p className="text-warm-700">
                {recipients.map(r => r.name || "Unnamed").join(", ") || "No recipients"}
              </p>
              <div className="flex gap-4 mt-2 text-xs text-warm-500">
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
                className={messageType === "email" ? "bg-warm-600" : ""}
              >
                <Mail className="w-4 h-4 mr-2" />
                Email ({emailRecipients.length})
              </Button>
              <Button
                variant={messageType === "text" ? "default" : "outline"}
                size="sm"
                onClick={() => setMessageType("text")}
                disabled={phoneRecipients.length === 0}
                className={messageType === "text" ? "bg-warm-600" : ""}
              >
                <Smartphone className="w-4 h-4 mr-2" />
                Text ({phoneRecipients.length})
              </Button>
            </div>

            {/* Email form */}
            {messageType === "email" && (
              <>
                <div className="space-y-2">
                  <Label>Subject</Label>
                  <Input
                    value={messageSubject}
                    onChange={(e) => setMessageSubject(e.target.value)}
                    placeholder="Wedding party update!"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Message</Label>
                  <Textarea
                    value={messageBody}
                    onChange={(e) => setMessageBody(e.target.value)}
                    placeholder="Hey everyone! Just wanted to share some exciting updates..."
                    rows={5}
                  />
                </div>
              </>
            )}

            {/* Text form */}
            {messageType === "text" && (
              <div className="space-y-2">
                <Label>Message</Label>
                <Textarea
                  value={messageBody}
                  onChange={(e) => setMessageBody(e.target.value)}
                  placeholder="Hey! Quick update about the wedding..."
                  rows={4}
                />
                <p className="text-xs text-warm-400">
                  Note: Group texting support varies by device. You may need to send individually.
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4 border-t border-warm-200">
            {messageType === "email" ? (
              <>
                <Button variant="outline" onClick={copyEmails} className="flex-1">
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Emails
                </Button>
                <Button
                  onClick={sendEmail}
                  disabled={emailRecipients.length === 0 || !messageBody}
                  className="flex-1 bg-warm-600 hover:bg-warm-700 text-white"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Open Email
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={copyPhones} className="flex-1">
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Numbers
                </Button>
                <Button
                  onClick={sendText}
                  disabled={phoneRecipients.length === 0 || !messageBody}
                  className="flex-1 bg-warm-600 hover:bg-warm-700 text-white"
                >
                  <Send className="w-4 h-4 mr-2" />
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
