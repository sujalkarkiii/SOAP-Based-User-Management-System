import React, { useState, useEffect, useCallback } from "react";
import UserModal from "./components/UserModal.jsx";
import SoapInspector from "./components/SoapInspector.jsx";
import {
  getUsers,
  deleteUser,
  searchUsers,
  getHealth,
  createUser,
  updateUser,
  soapExamples,
} from "./services/api.js";

const roleColors = {
  admin: "bg-pink-500/20 text-pink-400",
  moderator: "bg-orange-500/20 text-orange-400",
  user: "bg-green-500/20 text-green-400",
};

export default function App() {
  const [page, setPage] = useState("users");
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(8);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [searchMode, setSearchMode] = useState(false);
  const [modal, setModal] = useState(null);
  const [health, setHealth] = useState(null);
  const [lastXML, setLastXML] = useState(""); // 👈 tracks last SOAP envelope sent
  const [toast, setToast] = useState(null);   // 👈 success/error notification

  // ── Toast helper ────────────────────────────────────────────────────────────
  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Fetch users via SOAP ────────────────────────────────────────────────────
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      let data;
      if (searchMode && search) {
        setLastXML(soapExamples.SearchUsers(search));
        data = await searchUsers(search);
      } else {
        setLastXML(soapExamples.GetAllUsers());
        data = await getUsers(currentPage, limit);
      }
      setUsers(data.users || []);
      setTotal(data.total || 0);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  }, [currentPage, limit, search, searchMode]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  useEffect(() => {
    getHealth()
      .then(setHealth)
      .catch(() => setHealth({ status: "Offline" }));
  }, []);

  const totalPages = Math.ceil(total / limit);

  // ── Search ──────────────────────────────────────────────────────────────────
  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setSearchMode(true);
    setCurrentPage(1);
  };

  const clearSearch = () => {
    setSearch("");
    setSearchInput("");
    setSearchMode(false);
    setCurrentPage(1);
  };

  // ── Create / Update ─────────────────────────────────────────────────────────
  const handleSaveUser = async (userData) => {
    try {
      if (modal && modal !== "new") {
        setLastXML(soapExamples.UpdateUser(modal._id, userData));
        await updateUser(modal._id, userData);
        showToast("User updated successfully!");
      } else {
        setLastXML(soapExamples.CreateUser(userData));
        await createUser(userData);
        showToast("User created successfully!");
      }
      setModal(null);
      fetchUsers();
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  // ── Delete ──────────────────────────────────────────────────────────────────
  const handleDelete = async (user) => {
    if (!window.confirm(`Delete "${user.name}"?`)) return;
    try {
      setLastXML(soapExamples.DeleteUser(user._id));
      await deleteUser(user._id);
      showToast(`"${user.name}" deleted`);
      fetchUsers();
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  return (
    <div className="flex min-h-screen bg-purple-950 text-gray-200">

      {/* ── Toast ─────────────────────────────────────────────────────────── */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-lg text-sm font-medium shadow-lg
          ${toast.type === "error" ? "bg-red-500 text-white" : "bg-green-500 text-white"}`}>
          {toast.type === "error" ? "❌" : "✅"} {toast.msg}
        </div>
      )}

      {/* ── Sidebar ───────────────────────────────────────────────────────── */}
      <aside className="w-60 bg-purple-900 p-6 flex flex-col gap-2">
        <h1 className="text-xl font-semibold text-white mb-6">🧼 SOAP MERN</h1>

        <nav className="flex flex-col gap-1">
          {[
            { id: "users", label: "👥 Users" },
            { id: "soap",  label: "🔬 SOAP Inspector" },
            { id: "docs",  label: "📄 Docs" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setPage(item.id)}
              className={`px-4 py-2 rounded-md text-left text-sm
                ${page === item.id
                  ? "bg-purple-700 text-white"
                  : "text-purple-300 hover:bg-purple-800"}`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Server status */}
        <div className="mt-auto bg-purple-800 p-4 rounded-md text-xs space-y-2">
          <div className="font-semibold text-purple-200 mb-1">Server Status</div>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${health?.status === "OK" ? "bg-green-400" : "bg-red-400"}`} />
            <span>API: {health?.status || "..."}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${health?.mongodb === "connected" ? "bg-green-400" : "bg-red-400"}`} />
            <span>MongoDB: {health?.mongodb || "..."}</span>
          </div>
        </div>
      </aside>

      {/* ── Main ──────────────────────────────────────────────────────────── */}
      <main className="flex-1 p-8 flex flex-col gap-6 overflow-auto">

        {/* ════ USERS PAGE ════════════════════════════════════════════════ */}
        {page === "users" && (
          <>
            {/* Header */}
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-semibold text-white">User Management</h2>
                <p className="text-purple-300 text-sm mt-1">
                  {total} users · sending real SOAP XML
                </p>
              </div>
              <button
                onClick={() => setModal("new")}
                className="bg-purple-600 hover:bg-purple-500 px-4 py-2 rounded-md text-sm font-medium"
              >
                ＋ Create User
              </button>
            </div>

            {/* Search bar */}
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                className="flex-1 bg-purple-900 border border-purple-700 rounded-md px-4 py-2 text-sm outline-none focus:border-purple-500 placeholder-purple-400"
                placeholder="🔍 Search by name or email..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              <button type="submit" className="bg-purple-600 hover:bg-purple-500 px-4 py-2 rounded-md text-sm">
                Search
              </button>
              {searchMode && (
                <button type="button" onClick={clearSearch}
                  className="bg-purple-800 hover:bg-purple-700 px-4 py-2 rounded-md text-sm">
                  ✕ Clear
                </button>
              )}
            </form>

            {/* Table */}
            <div className="bg-purple-900 rounded-lg overflow-hidden border border-purple-800">
              <table className="w-full text-sm">
                <thead className="bg-purple-800 text-purple-300">
                  <tr>
                    <th className="p-3 text-left">Name</th>
                    <th className="p-3 text-left">Email</th>
                    <th className="p-3 text-left">Age</th>
                    <th className="p-3 text-left">Role</th>
                    <th className="p-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-purple-400">
                        ⏳ Loading via SOAP...
                      </td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-purple-400">
                        No users found. Create one!
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user._id} className="border-t border-purple-800 hover:bg-purple-800/50">
                        <td className="p-3 font-medium">{user.name}</td>
                        <td className="p-3 text-purple-300">{user.email}</td>
                        <td className="p-3">{user.age}</td>
                        <td className="p-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${roleColors[user.role] || roleColors.user}`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="p-3 space-x-3">
                          <button onClick={() => setModal(user)} className="text-blue-400 hover:text-blue-300 text-xs">
                            Edit
                          </button>
                          <button onClick={() => handleDelete(user)} className="text-red-400 hover:text-red-300 text-xs">
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {!searchMode && totalPages > 1 && (
              <div className="flex gap-2 justify-center">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => p - 1)}
                  className="px-3 py-1 rounded bg-purple-800 text-sm disabled:opacity-40 hover:bg-purple-700"
                >
                  ← Prev
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    onClick={() => setCurrentPage(p)}
                    className={`px-3 py-1 rounded text-sm ${p === currentPage ? "bg-purple-500 text-white" : "bg-purple-800 hover:bg-purple-700"}`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => p + 1)}
                  className="px-3 py-1 rounded bg-purple-800 text-sm disabled:opacity-40 hover:bg-purple-700"
                >
                  Next →
                </button>
              </div>
            )}

            {/* Live SOAP XML Preview — shows the exact XML sent for last action */}
            {lastXML && (
              <div className="bg-purple-950 border border-purple-700 rounded-lg overflow-hidden">
                <div className="bg-purple-800 px-4 py-2 text-xs text-purple-300 font-semibold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  Last SOAP Envelope Sent → http://localhost:5000/soap
                </div>
                <pre className="p-4 text-xs text-green-300 font-mono overflow-x-auto whitespace-pre-wrap">
                  {lastXML}
                </pre>
              </div>
            )}
          </>
        )}

        {/* ════ SOAP INSPECTOR ══════════════════════════════════════════════ */}
        {page === "soap" && <SoapInspector />}

        {/* ════ DOCS ════════════════════════════════════════════════════════ */}
        {page === "docs" && (
          <div className="space-y-4 max-w-2xl">
            <h2 className="text-2xl font-semibold text-white">📄 Documentation</h2>
            {[
              { title: "SOAP Endpoint", content: "POST http://localhost:5000/soap\nWSDL: http://localhost:5000/soap?wsdl" },
              { title: "Operations", content: "GetAllUsers(page, limit)\nGetUserById(id)\nCreateUser(user)\nUpdateUser(id, user)\nDeleteUser(id)\nSearchUsers(query)" },
              { title: "Run Backend", content: "cd server\nnpm install\nnpm run dev" },
              { title: "Seed Data", content: "cd server\nnode seed.js" },
            ].map(({ title, content }) => (
              <div key={title} className="bg-purple-900 border border-purple-700 rounded-lg p-5">
                <h3 className="text-purple-200 font-semibold mb-3">{title}</h3>
                <pre className="text-purple-300 text-sm whitespace-pre-wrap font-mono">{content}</pre>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ── Modal ─────────────────────────────────────────────────────────── */}
      {modal && (
        <UserModal
          user={modal === "new" ? null : modal}
          onSave={handleSaveUser}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}