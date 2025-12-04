"use client";

import { useEffect, useState } from "react";
import api from "@/utils/api";
import { supabase } from "@/utils/supabaseClient";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";
import PendingExpenseCard from "@/components/PendingExpenseCards";
import WorkspaceMembers from "@/components/WorkspaceMembers";


type Budget = {
  budget: number;
  spent: number;
  percentage: number;
  status: "critical" | "warning" | "alert" | string;
};

export default function WorkspacePage() {
  const params = useParams();
  const workspaceId = Array.isArray(params.id) ? params.id[0] : params.id || "";

  const [loading, setLoading] = useState(true);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newExpense, setNewExpense] = useState({
    title: "",
    amount: "",
    category: "",
  });

  const [role, setRole] = useState("");
  const [userId, setUserId] = useState("");

  const [budget, setBudget] = useState<Budget | null>(null);
  const [budgetAmount, setBudgetAmount] = useState("");

  const [month, setMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // ---------------- Fetch Budget ----------------
  const fetchBudget = async () => {
    try {
      const res = await api.get(`/budgets/${workspaceId}?month=${month}`);
      setBudget(res.data);
    } catch {
      setBudget(null);
    }
  };

  // ---------------- Fetch Expenses ----------------
  const fetchExpenses = async () => {
    try {
      const res = await api.get(`/expenses/${workspaceId}`);
      setExpenses(res.data.expenses);
      setRole(res.data.role);
      setUserId(res.data.userId);
    } catch {
      toast.error("Failed to load expenses");
    } finally {
      setLoading(false);
    }
  };

  // ---------------- Save Budget ----------------
  const saveBudget = async () => {
    if (!budgetAmount) return toast.error("Amount required");

    try {
      await api.post("/budgets", {
        workspace_id: workspaceId,
        month,
        amount: Number(budgetAmount),
      });

      toast.success("Budget saved");
      setBudgetAmount("");
      fetchBudget();
    } catch {
      toast.error("Failed to save budget");
    }
  };

  // ---------------- Realtime ----------------
  useEffect(() => {
    fetchExpenses();
    fetchBudget();

    const channel = supabase
      .channel(`ws_expenses_${workspaceId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "expenses",
          filter: `workspace_id=eq.${workspaceId}`,
        },
        () => fetchExpenses()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [workspaceId, month]);

  // ---------------- Create Expense ----------------
  const handleCreateExpense = async () => {
    if (!newExpense.title || !newExpense.amount || !newExpense.category) {
      toast.error("All fields are required");
      return;
    }

    try {
      await api.post("/expenses", {
        workspace_id: workspaceId,
        ...newExpense,
      });

      toast.success("Expense added");
      setNewExpense({ title: "", amount: "", category: "" });
      setShowForm(false);
      fetchExpenses();
    } catch {
      toast.error("Error creating expense");
    }
  };

  // ---------------- Loading State ----------------
  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen text-slate-700">
        Loading...
      </div>
    );

  // ---------------- MAIN UI ----------------
  return (
    <div className="p-6 max-w-5xl mx-auto text-slate-800">
      <h1 className="text-3xl font-bold mb-6 text-stone-300">Workspace</h1>

      {/* Members Section */}
      <WorkspaceMembers workspaceId={workspaceId} role={role} userId={userId} />

      {/* Add Expense Button */}
      {(role === "owner" || role === "admin") && (
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg shadow-sm mb-4 transition"
        >
          {showForm ? "Cancel" : "Add Expense"}
        </button>
      )}

      {/* Expense Form */}
      {showForm && (
        <div className="border border-slate-200 rounded-xl bg-white p-5 mb-6 shadow-sm">
          <input
            className="border border-slate-300 p-3 rounded-lg w-full mb-3 focus:ring-2 focus:ring-blue-400 outline-none"
            placeholder="Title"
            value={newExpense.title}
            onChange={(e) =>
              setNewExpense({ ...newExpense, title: e.target.value })
            }
          />
          <input
            className="border border-slate-300 p-3 rounded-lg w-full mb-3 focus:ring-2 focus:ring-blue-400 outline-none"
            placeholder="Amount"
            type="number"
            value={newExpense.amount}
            onChange={(e) =>
              setNewExpense({ ...newExpense, amount: e.target.value })
            }
          />
          <input
            className="border border-slate-300 p-3 rounded-lg w-full mb-3 focus:ring-2 focus:ring-blue-400 outline-none"
            placeholder="Category"
            value={newExpense.category}
            onChange={(e) =>
              setNewExpense({ ...newExpense, category: e.target.value })
            }
          />

          <button
            onClick={handleCreateExpense}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg shadow-sm transition"
          >
            Save Expense
          </button>
        </div>
      )}

      {/* Budget Summary */}
      <div className="mb-8 p-5 rounded-xl bg-white border border-slate-200 shadow-sm">
        <h2 className="text-xl font-semibold mb-4 text-slate-900">
          Budget Summary
        </h2>

        <div className="flex items-center gap-4 mb-4">
          <label className="text-sm text-slate-500">Month:</label>
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="border border-slate-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
          />
        </div>

        {!budget && (
          <p className="text-slate-500">No budget set for this month</p>
        )}

        {budget && (
          <div>
            <p className="mb-1">Budget: ₹{budget.budget}</p>
            <p className="mb-1">Spent: ₹{budget.spent}</p>
            <p className="mb-1">Remaining: ₹{budget.budget - budget.spent}</p>
            <p className="mb-3 capitalize">Status: {budget.status}</p>

            <div className="w-full bg-slate-200 rounded h-4 overflow-hidden">
              <div
                className={`
                  h-full rounded-r 
                  ${
                    budget.status === "critical"
                      ? "bg-red-700"
                      : budget.status === "warning"
                      ? "bg-orange-500"
                      : budget.status === "alert"
                      ? "bg-yellow-400"
                      : "bg-emerald-600"
                  }
                `}
                style={{ width: `${Math.min(budget.percentage, 100)}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* Set Budget */}
      {(role === "owner" || role === "admin") && (
        <div className="mb-8 p-5 rounded-xl bg-white border border-slate-200 shadow-sm">
          <h2 className="text-xl font-semibold mb-3 text-slate-900">
            Set Budget
          </h2>

          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="Enter amount"
              className="border border-slate-300 p-3 rounded-lg w-48 focus:ring-2 focus:ring-blue-400 outline-none"
              onChange={(e) => setBudgetAmount(e.target.value)}
            />
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg shadow-sm transition"
              onClick={saveBudget}
            >
              Save
            </button>
          </div>
        </div>
      )}

      {/* Expense Table */}
      <div className="rounded-xl overflow-hidden border border-slate-200 shadow-sm mb-10">
        <table className="w-full">
          <thead className="bg-slate-200 text-slate-700">
            <tr>
              <th className="p-3">Title</th>
              <th className="p-3">Amount</th>
              <th className="p-3">Category</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>

          <tbody>
            {expenses.length === 0 && (
              <tr>
                <td className="text-center p-4 text-slate-500" colSpan={4}>
                  No expenses yet
                </td>
              </tr>
            )}

            {expenses.map((exp) => (
              <tr key={exp.id} className="bg-white even:bg-slate-50">
                <td className="p-3">{exp.title}</td>
                <td className="p-3">₹{exp.amount}</td>
                <td className="p-3">{exp.category}</td>
                <td className="p-3 capitalize">{exp.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pending Approvals */}
      {(role === "owner" || role === "admin") && (
        <div className="mt-10">
          <h2 className="text-2xl font-bold mb-3 text-stone-300">
            Pending Approvals
          </h2>

          {expenses.filter((e) => e.status?.toLowerCase() === "pending")
            .length === 0 && (
            <p className="text-slate-500">No pending expenses</p>
          )}

          {expenses
            .filter(
              (e) =>
                e.status?.toLowerCase() === "pending" && e.created_by !== userId
            )
            .map((exp) => (
              <PendingExpenseCard
                key={exp.id}
                expense={exp}
                workspaceId={workspaceId}
                refresh={fetchExpenses}
              />
            ))}
        </div>
      )}
    </div>
  );
}
