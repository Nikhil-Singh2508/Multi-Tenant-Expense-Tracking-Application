"use client";

import { useEffect, useState } from "react";
import api from "@/utils/api";
import toast from "react-hot-toast";

interface Props {
  workspaceId: string;
  role: string;
  userId: string;
}

export default function WorkspaceMembers({ workspaceId, role, userId }: Props) {
  const [members, setMembers] = useState<any[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("member");

  // Fetch workspace members
  const fetchMembers = async () => {
    try {
      const res = await api.get(`/members/${workspaceId}/`);
      setMembers(res.data.members);
    } catch {
      toast.error("Failed to load members");
    }
  };

  // Invite Member
  const inviteMember = async () => {
    if (!inviteEmail.trim()) return toast.error("Email is required");

    try {
      await api.post(`/members/${workspaceId}/invite`, {
        email: inviteEmail,
        role: inviteRole,
      });

      toast.success("Member invited successfully");
      setInviteEmail("");
      fetchMembers();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to invite member");
    }
  };

  // Update member role
  const updateRole = async (memberId: string, newRole: string) => {
    try {
      await api.put(`/members/${workspaceId}/role/${memberId}`, {
        role: newRole,
      });
      toast.success("Role updated");
      fetchMembers();
    } catch {
      toast.error("Failed to update role");
    }
  };

  // Remove member
  const removeMember = async (memberId: string) => {
    try {
      await api.delete(`/members/${workspaceId}/${memberId}`);
      toast.success("Member removed");
      fetchMembers();
    } catch {
      toast.error("Failed to remove member");
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [workspaceId]);

  return (
    <div className="mt-10 p-4 border rounded bg-white shadow">
      <h2 className="text-xl font-bold mb-4">Workspace Members</h2>

      {/* Invite form */}
      {(role === "owner" || role === "admin") && (
        <div className="flex gap-2 mb-4">
          <input
            type="email"
            placeholder="Enter user email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            className="border p-2 rounded w-64"
          />

          <select
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value)}
            className="border p-2 rounded"
          >
            <option value="member">Member</option>
            <option value="viewer">Viewer</option>
            <option value="admin">Admin</option>
          </select>

          <button
            onClick={inviteMember}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Invite
          </button>
        </div>
      )}

      {/* Members List Table */}
      <table className="w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">Name</th>
            <th className="border p-2">Email</th>
            <th className="border p-2">Role</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>

        <tbody>
          {members.map((m) => (
            <tr key={m.user_id}>
              <td className="border p-2">
                {m.profiles?.first_name} {m.profiles?.last_name}
              </td>
              <td className="border p-2">{m.profiles?.email}</td>
              <td className="border p-2 text-center">{m.role}</td>

              <td className="border p-2">
                <div className="flex gap-2 justify-center">

                  {/* Only owner can update ALL roles */}
                  {role === "owner" && m.user_id !== userId && (
                    <>
                      <select
                        className="border p-1 rounded"
                        value={m.role}
                        onChange={(e) => updateRole(m.user_id, e.target.value)}
                      >
                        <option value="viewer">Viewer</option>
                        <option value="member">Member</option>
                        <option value="admin">Admin</option>
                      </select>

                      <button
                        className="bg-red-500 text-white px-3 py-1 rounded"
                        onClick={() => removeMember(m.user_id)}
                      >
                        Remove
                      </button>
                    </>
                  )}

                  {/* Admin can remove only viewer & member */}
                  {role === "admin" &&
                    m.user_id !== userId &&
                    m.role !== "owner" && (
                      <>
                        <select
                          className="border p-1 rounded"
                          value={m.role}
                          onChange={(e) => updateRole(m.user_id, e.target.value)}
                        >
                          <option value="viewer">Viewer</option>
                          <option value="member">Member</option>
                        </select>

                        <button
                          className="bg-red-500 text-white px-3 py-1 rounded"
                          onClick={() => removeMember(m.user_id)}
                        >
                          Remove
                        </button>
                      </>
                    )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
