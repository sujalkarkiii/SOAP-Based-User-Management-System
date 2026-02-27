import React, { useState, useEffect } from "react";
import { soapExamples } from "../services/api";

const roles = ["user", "admin", "moderator"];

export default function UserModal({ user, onSave, onClose }) {
  const [form, setForm] = useState({ name: "", email: "", age: "", role: "user" });
  const [errors, setErrors] = useState({});
  const [showXML, setShowXML] = useState(false); // toggle XML preview

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        email: user.email || "",
        age: user.age || "",
        role: user.role || "user",
      });
    }
  }, [user]);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = "Valid email required";
    if (!form.age || isNaN(form.age) || form.age < 1) e.age = "Valid age required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) onSave({ ...form, age: parseInt(form.age) });
  };

  // ── Live XML preview — rebuilds every time the form changes ────────────────
  const getLiveXML = () => {
    const data = { ...form, age: parseInt(form.age) || 0 };
    if (user) {
      return soapExamples.UpdateUser(user._id, data);
    }
    return soapExamples.CreateUser(data);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className={`bg-purple-900 rounded-lg w-full transition-all duration-300
        ${showXML ? "max-w-4xl" : "max-w-md"}`}>

        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-purple-800">
          <h2 className="text-base font-semibold text-white">
            {user ? "✏️ Edit User" : "➕ Create User"}
          </h2>
          <div className="flex items-center gap-3">
            {/* Toggle XML preview */}
            <button
              type="button"
              onClick={() => setShowXML(!showXML)}
              className={`text-xs px-3 py-1 rounded-full border transition-all
                ${showXML
                  ? "bg-purple-600 border-purple-500 text-white"
                  : "border-purple-600 text-purple-400 hover:text-white"}`}
            >
              {showXML ? "🧼 Hide XML" : "🧼 Show XML"}
            </button>
            <button onClick={onClose} className="text-purple-400 hover:text-white text-xl leading-none">×</button>
          </div>
        </div>

        <div className={`flex gap-0 ${showXML ? "divide-x divide-purple-800" : ""}`}>

          {/* ── Form side ─────────────────────────────────────────────────── */}
          <form onSubmit={handleSubmit} className="flex-1 p-6 space-y-4">

            {/* Name */}
            <div>
              <label className="block text-xs text-purple-400 mb-1 uppercase tracking-wide">Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={`w-full px-3 py-2 rounded-md bg-purple-800 text-white text-sm focus:outline-none focus:ring-1 focus:ring-purple-500
                  ${errors.name ? "ring-1 ring-red-500" : ""}`}
                placeholder="Enter name"
              />
              {errors.name && <span className="text-red-400 text-xs mt-1 block">{errors.name}</span>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs text-purple-400 mb-1 uppercase tracking-wide">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className={`w-full px-3 py-2 rounded-md bg-purple-800 text-white text-sm focus:outline-none focus:ring-1 focus:ring-purple-500
                  ${errors.email ? "ring-1 ring-red-500" : ""}`}
                placeholder="Enter email"
              />
              {errors.email && <span className="text-red-400 text-xs mt-1 block">{errors.email}</span>}
            </div>

            {/* Age + Role */}
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-xs text-purple-400 mb-1 uppercase tracking-wide">Age</label>
                <input
                  type="number" min="1" max="150"
                  value={form.age}
                  onChange={(e) => setForm({ ...form, age: e.target.value })}
                  className={`w-full px-3 py-2 rounded-md bg-purple-800 text-white text-sm focus:outline-none focus:ring-1 focus:ring-purple-500
                    ${errors.age ? "ring-1 ring-red-500" : ""}`}
                  placeholder="Age"
                />
                {errors.age && <span className="text-red-400 text-xs mt-1 block">{errors.age}</span>}
              </div>
              <div className="flex-1">
                <label className="block text-xs text-purple-400 mb-1 uppercase tracking-wide">Role</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full px-3 py-2 rounded-md bg-purple-800 text-white text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                >
                  {roles.map((r) => (
                    <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button" onClick={onClose}
                className="px-4 py-2 bg-purple-800 hover:bg-purple-700 rounded-md text-purple-200 text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-purple-600 hover:bg-purple-500 rounded-md text-white text-sm font-medium"
              >
                {user ? "Update User" : "Create User"}
              </button>
            </div>
          </form>

          {/* ── Live XML preview side ──────────────────────────────────────── */}
          {showXML && (
            <div className="flex-1 flex flex-col min-w-0">
              <div className="px-4 py-3 bg-purple-950 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs text-purple-300 font-medium">
                  Live SOAP Envelope · updates as you type
                </span>
              </div>

              {/* Operation badge */}
              <div className="px-4 py-2 bg-purple-950 border-b border-purple-800">
                <span className="text-xs font-mono bg-purple-700 text-purple-200 px-2 py-1 rounded">
                  SOAPAction: {user ? "UpdateUser" : "CreateUser"}
                </span>
                <span className="text-xs text-purple-500 ml-2">→ POST /soap</span>
              </div>

              {/* XML content */}
              <pre className="flex-1 p-4 text-xs font-mono text-green-300 bg-purple-950 overflow-auto whitespace-pre-wrap break-words min-h-[300px]">
                {getLiveXML()}
              </pre>

              <div className="px-4 py-2 bg-purple-950 border-t border-purple-800 text-xs text-purple-500">
                Content-Type: text/xml; charset=utf-8
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}