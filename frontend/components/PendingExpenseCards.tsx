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
    <div className="border p-4 rounded mb-4">
      <h3 className="font-semibold text-lg">{expense.title}</h3>
      <p className="text-gray-600 mb-2">Amount: ₹{expense.amount}</p>
      <p className="text-sm mb-2">Category: {expense.category}</p>
      <p className="text-sm text-gray-500 mb-2">Submitted by: {expense.created_by_name}</p>

      <textarea
        className="border p-2 rounded w-full mb-2"
        placeholder="Optional comment"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />

      <div className="flex gap-2">
        <button
          disabled={loading}
          onClick={() => review("approve")}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
        >
          Approve
        </button>

        <button
          disabled={loading}
          onClick={() => review("reject")}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
        >
          Reject
        </button>
      </div>
    </div>
  );
}
