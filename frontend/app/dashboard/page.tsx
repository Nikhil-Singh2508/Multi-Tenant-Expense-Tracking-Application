"use client";

import { useEffect, useState } from "react";
import api from "@/utils/api";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [creating, setCreating] = useState(false);
  const [workspaceName, setWorkspaceName] = useState("");

  const fetchWorkspaces = async () => {
    try {
      const res = await api.get("/workspaces");
      setWorkspaces(res.data.workspaces);
    } catch {
      toast.error("Failed to load workspaces");
    } finally {
      setLoading(false);
    }
  };

  const createWorkspace = async () => {
    if (!workspaceName.trim()) {
      toast.error("Workspace name is required");
      return;
    }

    try {
      setCreating(true);
      await api.post("/workspaces", { name: workspaceName });
      toast.success("Workspace created");
      setWorkspaceName("");
      fetchWorkspaces();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Error creating workspace");
    } finally {
      setCreating(false);
    }
  };

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen text-slate-700">
        Loading...
      </div>
    );

  return (
    <div className="p-6 max-w-3xl mx-auto text-slate-800">
      <h1 className="text-3xl font-bold mb-6 text-gray-300">Your Workspaces</h1>

      {/* Create Workspace */}
      <div className="mb-6 flex gap-2">
        <input
          className="border text-gray-300 border-slate-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-400 outline-none"
          placeholder="Workspace name"
          value={workspaceName}
          onChange={(e) => setWorkspaceName(e.target.value)}
        />
        <button
          disabled={creating}
          onClick={createWorkspace}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg shadow-sm transition"
        >
          {creating ? "Creating..." : "Create"}
        </button>
      </div>

      {/* Workspace List */}
      <div className="grid grid-cols-1 gap-4">
        {workspaces.map((ws) => (
          <div
            key={ws.id}
            onClick={() => router.push(`/workspace/${ws.id}`)}
            className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm cursor-pointer hover:bg-slate-50 transition flex justify-between"
          >
            <span className="font-medium text-slate-900">{ws.name}</span>
            <span className="text-sm text-slate-500">Open ➜</span>
          </div>
        ))}
      </div>

      {workspaces.length === 0 && (
        <p className="text-gray-300 text-center mt-10">
          No workspaces created yet
        </p>
      )}
    </div>
  );
}
