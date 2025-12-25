import { useState } from "react";

const API_BASE = "http://127.0.0.1:8000";

export default function App() {
  const [file, setFile] = useState(null);
  const [question, setQuestion] = useState("");
  const [results, setResults] = useState([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  // ---------- Upload PDF ----------
  const handleUpload = async () => {
    if (!file) {
      alert("Please select a PDF first");
      return;
    }

    setStatus("Uploading and indexing document...");
    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${API_BASE}/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      setStatus(`Indexed ${data.pages_indexed} pages successfully`);
    } catch (err) {
      setStatus("Upload failed");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ---------- Query ----------
  const handleQuery = async () => {
    if (!question.trim()) {
      alert("Enter a question");
      return;
    }

    setLoading(true);
    setResults([]);
    setStatus("Searching policy documents...");

    try {
      const res = await fetch(`${API_BASE}/query`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question }),
      });

      const data = await res.json();
      setResults(data.results || []);
      setStatus(
        data.results?.length
          ? "Results found"
          : "No matching policy sections"
      );
    } catch (err) {
      setStatus("Query failed");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0f172a, #020617)",
        color: "#e5e7eb",
        padding: "30px",
        fontFamily: "Segoe UI, sans-serif",
      }}
    >
      <h1 style={{ textAlign: "center", marginBottom: "30px" }}>
        Decision Receipt AI
      </h1>

      {/* Upload */}
      <div
        style={{
          maxWidth: "500px",
          margin: "0 auto 30px",
          background: "#020617",
          padding: "20px",
          borderRadius: "12px",
          border: "1px solid #1e293b",
        }}
      >
        <h3>Upload Policy Document</h3>

        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setFile(e.target.files[0])}
        />

        <button
          onClick={handleUpload}
          disabled={loading}
          style={buttonStyle}
        >
          Upload & Index
        </button>
      </div>

      {/* Query */}
      <div
        style={{
          maxWidth: "500px",
          margin: "0 auto",
          background: "#020617",
          padding: "20px",
          borderRadius: "12px",
          border: "1px solid #1e293b",
        }}
      >
        <h3>Ask a Question</h3>

        <textarea
          rows="3"
          placeholder="Ask your policy question..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: "8px",
            background: "#020617",
            color: "#e5e7eb",
            border: "1px solid #334155",
          }}
        />

        <button
          onClick={handleQuery}
          disabled={loading}
          style={buttonStyle}
        >
          Run Decision Query
        </button>
      </div>

      {/* Status */}
      {status && (
        <p style={{ textAlign: "center", marginTop: "20px" }}>{status}</p>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div style={{ maxWidth: "800px", margin: "30px auto" }}>
          <h2>Decision Evidence</h2>

          {results.map((r, i) => (
            <div
              key={i}
              style={{
                background: "#020617",
                padding: "15px",
                borderRadius: "10px",
                marginBottom: "15px",
                border: "1px solid #1e293b",
              }}
            >
              <p>
                <strong>Page:</strong> {r.page}
              </p>
              <p>
                <strong>Confidence:</strong>{" "}
                {(r.confidence * 100).toFixed(2)}%
              </p>
              <p style={{ whiteSpace: "pre-wrap" }}>{r.policy_text}</p>
            </div>
          ))}
        </div>
      )}

      <footer
        style={{
          marginTop: "50px",
          textAlign: "center",
          fontSize: "14px",
          color: "#94a3b8",
        }}
      >
        © 2025 Decision Receipt AI — Audit-Ready Decisions
      </footer>
    </div>
  );
}

const buttonStyle = {
  marginTop: "12px",
  width: "100%",
  padding: "10px",
  borderRadius: "8px",
  border: "none",
  cursor: "pointer",
  background: "#2563eb",
  color: "white",
  fontWeight: "600",
};
