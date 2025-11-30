"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Music, Mic2, ListMusic, Ban, FileText, Sparkles } from "lucide-react";
import { type BaseRendererProps } from "./types";

export function MusicPlaylistRenderer({ page, fields, updateField }: BaseRendererProps) {
  const mustPlaySongs = (fields.mustPlaySongs as Record<string, unknown>[]) || [];
  const doNotPlaySongs = (fields.doNotPlaySongs as Record<string, unknown>[]) || [];

  const addMustPlay = () => {
    updateField("mustPlaySongs", [...mustPlaySongs, { song: "", artist: "", notes: "" }]);
  };

  const updateMustPlay = (index: number, key: string, value: string) => {
    const updated = [...mustPlaySongs];
    updated[index] = { ...updated[index], [key]: value };
    updateField("mustPlaySongs", updated);
  };

  const removeMustPlay = (index: number) => {
    updateField("mustPlaySongs", mustPlaySongs.filter((_, i) => i !== index));
  };

  const addDoNotPlay = () => {
    updateField("doNotPlaySongs", [...doNotPlaySongs, { song: "", artist: "", reason: "" }]);
  };

  const updateDoNotPlay = (index: number, key: string, value: string) => {
    const updated = [...doNotPlaySongs];
    updated[index] = { ...updated[index], [key]: value };
    updateField("doNotPlaySongs", updated);
  };

  const removeDoNotPlay = (index: number) => {
    updateField("doNotPlaySongs", doNotPlaySongs.filter((_, i) => i !== index));
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white shadow-lg p-8 md:p-12">
        {/* Page Header */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-serif font-light tracking-wide">
            {page.title}
          </h2>
          <div className="w-10 h-px bg-warm-400 mx-auto mt-4" />
        </div>

        {/* Special Moments */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <h3 className="text-lg font-medium text-warm-700">Special Moments</h3>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* First Dance */}
            <div className="p-4 border border-warm-200 bg-gradient-to-br from-pink-50 to-warm-50">
              <div className="flex items-center gap-2 mb-3">
                <Music className="w-4 h-4 text-pink-500" />
                <Label className="text-warm-600">First Dance</Label>
              </div>
              <div className="space-y-2">
                <Input
                  value={(fields.firstDanceSong as string) || ""}
                  onChange={(e) => updateField("firstDanceSong", e.target.value)}
                  placeholder="Song name"
                  className="font-medium"
                />
                <Input
                  value={(fields.firstDanceArtist as string) || ""}
                  onChange={(e) => updateField("firstDanceArtist", e.target.value)}
                  placeholder="Artist"
                  className="text-sm"
                />
              </div>
            </div>

            {/* Parent Dance 1 */}
            <div className="p-4 border border-warm-200">
              <div className="flex items-center gap-2 mb-3">
                <Music className="w-4 h-4 text-warm-400" />
                <Label className="text-warm-600">Parent Dance 1</Label>
              </div>
              <div className="space-y-2">
                <Input
                  value={(fields.parentDance1Song as string) || ""}
                  onChange={(e) => updateField("parentDance1Song", e.target.value)}
                  placeholder="Song name"
                />
                <Input
                  value={(fields.parentDance1Artist as string) || ""}
                  onChange={(e) => updateField("parentDance1Artist", e.target.value)}
                  placeholder="Artist"
                  className="text-sm"
                />
              </div>
            </div>

            {/* Parent Dance 2 */}
            <div className="p-4 border border-warm-200">
              <div className="flex items-center gap-2 mb-3">
                <Music className="w-4 h-4 text-warm-400" />
                <Label className="text-warm-600">Parent Dance 2</Label>
              </div>
              <div className="space-y-2">
                <Input
                  value={(fields.parentDance2Song as string) || ""}
                  onChange={(e) => updateField("parentDance2Song", e.target.value)}
                  placeholder="Song name"
                />
                <Input
                  value={(fields.parentDance2Artist as string) || ""}
                  onChange={(e) => updateField("parentDance2Artist", e.target.value)}
                  placeholder="Artist"
                  className="text-sm"
                />
              </div>
            </div>

            {/* Cake Cutting & Last Dance */}
            <div className="space-y-4">
              <div className="p-4 border border-warm-200">
                <div className="flex items-center gap-2 mb-2">
                  <Music className="w-4 h-4 text-warm-400" />
                  <Label className="text-warm-600">Cake Cutting</Label>
                </div>
                <Input
                  value={(fields.cakeCuttingSong as string) || ""}
                  onChange={(e) => updateField("cakeCuttingSong", e.target.value)}
                  placeholder="Song name"
                />
              </div>
              <div className="p-4 border border-warm-200">
                <div className="flex items-center gap-2 mb-2">
                  <Music className="w-4 h-4 text-warm-400" />
                  <Label className="text-warm-600">Last Dance</Label>
                </div>
                <Input
                  value={(fields.lastDanceSong as string) || ""}
                  onChange={(e) => updateField("lastDanceSong", e.target.value)}
                  placeholder="Song name"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Ceremony Music */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-6">
            <Mic2 className="w-5 h-5 text-purple-500" />
            <h3 className="text-lg font-medium text-warm-700">Ceremony Music</h3>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm text-warm-600">Guest Arrival</Label>
              <Input
                value={(fields.guestArrivalMusic as string) || ""}
                onChange={(e) => updateField("guestArrivalMusic", e.target.value)}
                placeholder="Playlist or song"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm text-warm-600">Processional (Wedding Party)</Label>
              <Input
                value={(fields.processionalSong as string) || ""}
                onChange={(e) => updateField("processionalSong", e.target.value)}
                placeholder="Song name"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm text-warm-600">Bride Entrance</Label>
              <Input
                value={(fields.brideEntranceSong as string) || ""}
                onChange={(e) => updateField("brideEntranceSong", e.target.value)}
                placeholder="Song name"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm text-warm-600">Recessional (Exit)</Label>
              <Input
                value={(fields.recessionalSong as string) || ""}
                onChange={(e) => updateField("recessionalSong", e.target.value)}
                placeholder="Song name"
              />
            </div>
          </div>
        </div>

        {/* Must Play List */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ListMusic className="w-5 h-5 text-green-500" />
              <h3 className="text-lg font-medium text-warm-700">Must Play</h3>
              <span className="text-sm text-warm-400">({mustPlaySongs.length})</span>
            </div>
            <Button variant="ghost" size="sm" onClick={addMustPlay}>
              <Plus className="w-4 h-4 mr-1" />
              Add Song
            </Button>
          </div>
          
          {mustPlaySongs.length > 0 ? (
            <div className="space-y-2">
              {mustPlaySongs.map((song, index) => (
                <div key={index} className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded group">
                  <Music className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <Input
                    value={(song.song as string) || ""}
                    onChange={(e) => updateMustPlay(index, "song", e.target.value)}
                    placeholder="Song name"
                    className="flex-1"
                  />
                  <Input
                    value={(song.artist as string) || ""}
                    onChange={(e) => updateMustPlay(index, "artist", e.target.value)}
                    placeholder="Artist"
                    className="w-40"
                  />
                  <Input
                    value={(song.notes as string) || ""}
                    onChange={(e) => updateMustPlay(index, "notes", e.target.value)}
                    placeholder="Notes (e.g., for bouquet toss)"
                    className="w-48"
                  />
                  <button
                    onClick={() => removeMustPlay(index)}
                    className="p-1 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-warm-400 italic text-center py-6 bg-warm-50 rounded">
              No must-play songs yet. Add songs you definitely want to hear!
            </p>
          )}
        </div>

        {/* Do Not Play List */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Ban className="w-5 h-5 text-red-500" />
              <h3 className="text-lg font-medium text-warm-700">Do Not Play</h3>
              <span className="text-sm text-warm-400">({doNotPlaySongs.length})</span>
            </div>
            <Button variant="ghost" size="sm" onClick={addDoNotPlay}>
              <Plus className="w-4 h-4 mr-1" />
              Add Song
            </Button>
          </div>
          
          {doNotPlaySongs.length > 0 ? (
            <div className="space-y-2">
              {doNotPlaySongs.map((song, index) => (
                <div key={index} className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded group">
                  <Ban className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <Input
                    value={(song.song as string) || ""}
                    onChange={(e) => updateDoNotPlay(index, "song", e.target.value)}
                    placeholder="Song name"
                    className="flex-1"
                  />
                  <Input
                    value={(song.artist as string) || ""}
                    onChange={(e) => updateDoNotPlay(index, "artist", e.target.value)}
                    placeholder="Artist"
                    className="w-40"
                  />
                  <Input
                    value={(song.reason as string) || ""}
                    onChange={(e) => updateDoNotPlay(index, "reason", e.target.value)}
                    placeholder="Reason (optional)"
                    className="w-48"
                  />
                  <button
                    onClick={() => removeDoNotPlay(index)}
                    className="p-1 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-warm-400 italic text-center py-6 bg-warm-50 rounded">
              No banned songs yet. Add songs you want to avoid.
            </p>
          )}
        </div>

        {/* DJ Notes */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-warm-500" />
            <h3 className="text-lg font-medium text-warm-700">Notes for DJ/Band</h3>
          </div>
          <Textarea
            value={(fields.djNotes as string) || ""}
            onChange={(e) => updateField("djNotes", e.target.value)}
            placeholder="Any special instructions, timing notes, or preferences for your DJ or band..."
            rows={4}
          />
        </div>
      </div>
    </div>
  );
}
