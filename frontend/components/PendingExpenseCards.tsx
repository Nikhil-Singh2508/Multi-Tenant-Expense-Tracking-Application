"use client";

import { useState } from "react";
import api from "@/utils/api";
import toast from "react-hot-toast";

export default function PendingExpenseCard({ expense, workspaceId, refresh }: any) {
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const review = async (action: "approve" | "reject") => {
    try {
      setLoading(true);
      await api.post(`/expenses/${workspaceId}/review/${expense.id}`, {
        action,
        comment
      });
      toast.success(`Expense ${action}d`);
      setComment("");
      refresh();
    } catch (err: any) {
      toast.error("Error submitting review");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 mb-4">
      <h3 className="font-semibold text-lg text-slate-900">{expense.title}</h3>

      <p className="text-slate-600 mb-1">
        <span className="font-medium">Amount:</span> ₹{expense.amount}
      </p>

      <p className="text-slate-600 mb-1">
        <span className="font-medium">Category:</span> {expense.category}
      </p>

      <p className="text-sm text-slate-500 mb-3">
        Submitted by: {expense.created_by_name}
      </p>

      <textarea
        className="border border-slate-300 p-3 rounded-lg w-full mb-3 focus:ring-2 focus:ring-blue-400 focus:border-blue-500 outline-none transition"
        placeholder="Optional comment"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />

      <div className="flex gap-3">
        <button
          disabled={loading}
          onClick={() => review("approve")}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg shadow-sm transition disabled:opacity-50"
        >
          Approve
        </button>

        <button
          disabled={loading}
          onClick={() => review("reject")}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow-sm transition disabled:opacity-50"
        >
          Reject
        </button>
      </div>
    </div>
  );
}
