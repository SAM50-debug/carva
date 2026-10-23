"use client";

import React, { useState } from "react";
import { Eye, MessageSquareHeart } from "lucide-react";
import FeedbackDetailModal, { FeedbackDetailItem } from "./FeedbackDetailModal";

interface FeedbackTableClientProps {
  items: FeedbackDetailItem[];
}

export default function FeedbackTableClient({ items }: FeedbackTableClientProps) {
  const [selectedItem, setSelectedItem] = useState<FeedbackDetailItem | null>(null);

  if (!items || items.length === 0) {
    return (
      <div className="p-12 text-center text-slate-500">
        <MessageSquareHeart className="w-10 h-10 mx-auto mb-2 text-slate-600" />
        <p className="text-sm font-semibold text-slate-400">No feedback responses recorded yet.</p>
        <p className="text-xs text-slate-500 mt-1">
          Feedback submitted by participants before generating certificates will appear here in real-time.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto max-h-[650px] scrollbar-thin scrollbar-thumb-white/10">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="sticky top-0 bg-slate-950/90 backdrop-blur-md border-b border-white/10 text-slate-400 font-semibold uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4">#</th>
              <th className="py-3 px-4">Student</th>
              <th className="py-3 px-4">Contact</th>
              <th className="py-3 px-4">University</th>
              <th className="py-3 px-4">Event</th>
              <th className="py-3 px-4">Overall Experience</th>
              <th className="py-3 px-4">Would Visit Again</th>
              <th className="py-3 px-4">Comments</th>
              <th className="py-3 px-4">Submitted At</th>
              <th className="py-3 px-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-slate-300">
            {items.map((doc, idx) => {
              const ratings = doc.ratings || {};
              return (
                <tr key={doc._id} className="hover:bg-white/[0.03] transition group">
                  <td className="py-3.5 px-4 font-mono text-slate-500">{idx + 1}</td>
                  <td className="py-3.5 px-4 font-semibold text-white">{doc.studentName}</td>
                  <td className="py-3.5 px-4 font-mono text-slate-400">{doc.mobile}</td>
                  <td className="py-3.5 px-4 max-w-[180px] truncate" title={doc.university}>
                    {doc.university}
                  </td>
                  <td className="py-3.5 px-4 text-amber-300 font-medium">{doc.eventName}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                        ratings.q20_overall_experience === "Excellent"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : ratings.q20_overall_experience === "Good"
                          ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                          : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      }`}
                    >
                      {ratings.q20_overall_experience || "N/A"}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="text-slate-300">{ratings.q19_visit_again || "N/A"}</span>
                  </td>
                  <td
                    className="py-3.5 px-4 max-w-[200px] truncate text-slate-400 italic"
                    title={doc.comments || "None"}
                  >
                    {doc.comments ? `"${doc.comments}"` : "—"}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-500 whitespace-nowrap">
                    {doc.submittedAt ? new Date(doc.submittedAt).toLocaleString("en-IN") : "—"}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <button
                      type="button"
                      onClick={() => setSelectedItem(doc)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-gold/10 hover:bg-brand-gold/25 border border-brand-gold/30 text-brand-gold hover:text-white font-semibold text-xs transition active:scale-95 shadow-sm"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View Answers
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Full 20-Question Answer Viewer Modal */}
      {selectedItem && (
        <FeedbackDetailModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </>
  );
}
