import React, { useState } from "react";
import { soapExamples } from "../services/api";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const SOAP_URL = "/soap";

const operations = ["GetAllUsers", "GetUserById", "CreateUser", "UpdateUser", "DeleteUser", "SearchUsers"];

const defaultExamples = {
  GetAllUsers:  () => soapExamples.GetAllUsers(),
  GetUserById:  () => soapExamples.GetUserById("REPLACE_WITH_ID"),
  CreateUser:   () => soapExamples.CreateUser({ name: "John Doe", email: "john@example.com", age: 30, role: "user" }),
  UpdateUser:   () => soapExamples.UpdateUser("REPLACE_WITH_ID", { name: "John Updated", email: "john@example.com", age: 31, role: "admin" }),
  DeleteUser:   () => soapExamples.DeleteUser("REPLACE_WITH_ID"),
  SearchUsers:  () => soapExamples.SearchUsers("John"),
};

// Pretty-print XML with indentation
function formatXML(xml) {
  try {
    let formatted = "";
    let indent = 0;
    const lines = xml.replace(/>\s*</g, ">\n<").split("\n");
    lines.forEach((line) => {
      if (line.match(/^<\/\w/)) indent--;
      formatted += "  ".repeat(Math.max(indent, 0)) + line.trim() + "\n";
      if (line.match(/^<\w[^>]*[^/]>$/) && !line.match(/^<\?/)) indent++;
    });
    return formatted.trim();
  } catch {
    return xml;
  }
}

export default function SoapInspector() {
  const [selectedOp, setSelectedOp] = useState("GetAllUsers");
  const [customXml, setCustomXml] = useState("");
  const [responseXML, setResponseXML] = useState("");
  const [status, setStatus] = useState(null);   // 200, 500, etc.
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState("request");     // "request" | "response"
  const [timeTaken, setTimeTaken] = useState(null);

  const handleLoad = () => {
    const xml = defaultExamples[selectedOp]?.() || "";
    setCustomXml(formatXML(xml));
    setResponseXML("");
    setStatus(null);
    setTab("request");
  };

  // ── Actually sends the XML to the real SOAP server ──────────────────────────
  const handleSend = async () => {
    const xml = customXml || defaultExamples[selectedOp]?.();
    if (!xml) return;

    setLoading(true);
    setResponseXML("");
    setStatus(null);
    const start = Date.now();

    try {
      const res = await fetch(SOAP_URL, {
        method: "POST",
        headers: {
          "Content-Type": "text/xml; charset=utf-8",
          "SOAPAction": selectedOp,
        },
        body: xml,
      });

      const text = await res.text();
      setTimeTaken(Date.now() - start);
      setStatus(res.status);
      setResponseXML(formatXML(text));
      setTab("response"); // auto-switch to response tab
    } catch (err) {
      setTimeTaken(Date.now() - start);
      setStatus(0);
      setResponseXML(`ERROR: ${err.message}\n\nMake sure the server is running at ${SOAP_URL}`);
      setTab("response");
    } finally {
      setLoading(false);
    }
  };

  const isFault = responseXML.includes("faultstring") || responseXML.includes("Fault");
  const isSuccess = status === 200 && !isFault;

  return (
    <div className="max-w-4xl mx-auto text-white space-y-6">

      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold">🔬 SOAP Inspector</h2>
        <p className="text-purple-300 text-sm mt-1">
          Build and send real SOAP XML envelopes directly to the server
        </p>
      </div>

      {/* Operation selector + buttons */}
      <div className="flex flex-wrap gap-3 items-end">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-purple-400 font-medium uppercase tracking-wide">Operation</label>
          <select
            value={selectedOp}
            onChange={(e) => { setSelectedOp(e.target.value); setResponseXML(""); setStatus(null); }}
            className="px-4 py-2 rounded-md bg-purple-800 text-white focus:outline-none min-w-[200px] text-sm"
          >
            {operations.map((op) => (
              <option key={op} value={op}>{op}</option>
            ))}
          </select>
        </div>

        <button
          onClick={handleLoad}
          className="px-4 py-2 bg-purple-800 hover:bg-purple-700 rounded-md text-sm text-purple-200"
        >
          📋 Load Example
        </button>

        <button
          onClick={handleSend}
          disabled={loading}
          className="px-5 py-2 bg-purple-600 hover:bg-purple-500 rounded-md text-sm font-semibold disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? (
            <><span className="animate-spin">⏳</span> Sending...</>
          ) : (
            <>📤 Send SOAP Request</>
          )}
        </button>

        {/* Status badge */}
        {status !== null && (
          <div className={`px-3 py-2 rounded-md text-xs font-semibold flex items-center gap-2
            ${isSuccess ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
            <span className={`w-2 h-2 rounded-full ${isSuccess ? "bg-green-400" : "bg-red-400"}`} />
            HTTP {status || "ERR"} · {timeTaken}ms
          </div>
        )}
      </div>

      {/* Request / Response tabs */}
      <div className="bg-purple-950 rounded-lg border border-purple-800 overflow-hidden">

        {/* Tab bar */}
        <div className="flex border-b border-purple-800">
          {["request", "response"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-3 text-sm font-medium capitalize flex items-center gap-2
                ${tab === t
                  ? "bg-purple-900 text-white border-b-2 border-purple-400"
                  : "text-purple-400 hover:text-purple-200"}`}
            >
              {t === "request" ? "📝" : "📥"} {t}
              {t === "response" && responseXML && (
                <span className={`w-2 h-2 rounded-full ${isSuccess ? "bg-green-400" : "bg-red-400"}`} />
              )}
            </button>
          ))}
          <div className="ml-auto px-4 py-3 text-xs text-purple-500 flex items-center">
            {tab === "request" ? "text/xml · SOAPAction: " + selectedOp : "Server response XML"}
          </div>
        </div>

        {/* Request textarea */}
        {tab === "request" && (
          <textarea
            value={customXml}
            onChange={(e) => setCustomXml(e.target.value)}
            placeholder={`Click "Load Example" to populate the ${selectedOp} envelope, then hit "Send SOAP Request"`}
            spellCheck={false}
            className="w-full min-h-[300px] p-4 bg-purple-950 text-purple-200 font-mono text-xs resize-y focus:outline-none"
          />
        )}

        {/* Response display */}
        {tab === "response" && (
          <div className="min-h-[300px]">
            {!responseXML ? (
              <div className="flex items-center justify-center h-[300px] text-purple-500 text-sm">
                Send a request to see the response here
              </div>
            ) : (
              <pre className={`p-4 font-mono text-xs whitespace-pre-wrap break-words
                ${isFault ? "text-red-300" : "text-green-300"}`}>
                {responseXML}
              </pre>
            )}
          </div>
        )}
      </div>

      {/* Endpoint info */}
      <div className="bg-purple-900 border border-purple-800 rounded-lg p-5 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div>
          <div className="text-purple-400 text-xs uppercase tracking-wide mb-1">Endpoint</div>
          <code className="text-purple-200 font-mono">{SOAP_URL}</code>
        </div>
        <div>
          <div className="text-purple-400 text-xs uppercase tracking-wide mb-1">WSDL</div>
          <code className="text-purple-200 font-mono">{SOAP_URL}?wsdl</code>
        </div>
        <div>
          <div className="text-purple-400 text-xs uppercase tracking-wide mb-1">Protocol</div>
          <code className="text-purple-200 font-mono">SOAP 1.1 over HTTP POST</code>
        </div>
        <div>
          <div className="text-purple-400 text-xs uppercase tracking-wide mb-1">Namespace</div>
          <code className="text-purple-200 font-mono text-xs">http://www.example.com/soap/user</code>
        </div>
      </div>

    </div>
  );
}