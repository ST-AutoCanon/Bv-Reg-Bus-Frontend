import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import NewRequest from "./NewRequest";
import TableDocuments from "../components/TableDocuments";

interface User {
  _id?: string;
  id?: string;
  name?: string;
  email?: string;
  username?: string;
}

interface RequestInfo {
  vehicleType?: string;
  fuelType?: string;
  certificationType?: string;
  unloadedWeightWithoutBattery?: string | number;
  category?: string;
  preferredTestingAgency?: string;
}

interface Submission {
  _id: string;
  requestInfo?: RequestInfo;
  values?: Record<string, unknown>;
  status: "draft" | "completed";
  createdAt?: string;
  updatedAt?: string;
}

interface ApiResponse<T> {
  success?: boolean;
  count?: number;
  message?: string;
  error?: string;
  data?: T;
  submissions?: T;
  user?: User;
}

const API_URL = (
  process.env.REACT_APP_BASE_URL || "http://localhost:3000/api"
).replace(/\/+$/, "");

const getStoredToken = (): string | null => {
  try {
    const persistedRoot = localStorage.getItem("persist:root");

    if (persistedRoot) {
      const root = JSON.parse(persistedRoot);
      let credentials = root?.loginCredential;

      if (typeof credentials === "string") {
        try {
          credentials = JSON.parse(credentials);
        } catch {
          credentials = null;
        }
      }

      const token =
        credentials?.token ??
        credentials?.accessToken ??
        credentials?.userData?.token ??
        credentials?.user?.token ??
        root?.token ??
        root?.accessToken;

      if (typeof token === "string" && token.trim()) {
        return token.trim();
      }
    }
  } catch (err) {
    console.error("[Dashboard] Failed to read stored token:", err);
  }

  return localStorage.getItem("token")?.trim() || null;
};

const getErrorMessage = (
  data: ApiResponse<unknown>,
  fallback: string,
): string => data.message || data.error || fallback;

const formatDate = (value?: string): string => {
  if (!value) return "-";

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? "-"
    : date.toLocaleDateString();
};

const formatTime = (value?: string): string => {
  if (!value) return "";

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? ""
    : date.toLocaleTimeString();
};

const cellStyle: React.CSSProperties = {
  padding: "14px 16px",
  borderBottom: "1px solid #e2e8f0",
  textAlign: "left",
  verticalAlign: "middle",
  fontSize: "14px",
  color: "#334155",
};

const headingStyle: React.CSSProperties = {
  ...cellStyle,
  backgroundColor: "#f1f5f9",
  color: "#475569",
  fontSize: "12px",
  fontWeight: 700,
  textTransform: "uppercase",
  whiteSpace: "nowrap",
};

const Dashboard = () => {
  const [token] = useState<string | null>(() => getStoredToken());
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [submissionsLoading, setSubmissionsLoading] = useState(true);
  const [showNewRequest, setShowNewRequest] = useState(false);
  const [editingSubmissionId, setEditingSubmissionId] =
    useState<string | undefined>(undefined);
  const [documentsRefreshKey, setDocumentsRefreshKey] = useState(0);
  const [error, setError] = useState("");

  const fetchSubmissions = useCallback(async () => {
    if (!token) {
      setSubmissions([]);
      setSubmissionsLoading(false);
      setError("No stored token was found. Please sign in again.");
      return;
    }

    setSubmissionsLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/bus/submissions`, {
        method: "GET",
        cache: "no-store",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      });

      const responseText = await response.text();

      let data: ApiResponse<Submission[]> = {};

      if (responseText.trim()) {
        try {
          data = JSON.parse(responseText) as ApiResponse<Submission[]>;
        } catch {
          throw new Error(
            `Invalid JSON response (HTTP ${response.status}).`,
          );
        }
      } else if (response.ok) {
        throw new Error("Empty response body from submissions API.");
      }

      if (!response.ok) {
        throw new Error(
          getErrorMessage(
            data,
            response.status === 401 || response.status === 403
              ? "Authentication failed. Please sign in again."
              : `Failed to load requests (HTTP ${response.status}).`,
          ),
        );
      }

      const result = Array.isArray(data.data)
        ? data.data
        : Array.isArray(data.submissions)
          ? data.submissions
          : null;

      if (!result) {
        throw new Error(
          "Response must contain a data or submissions array.",
        );
      }

      setSubmissions(result);

      if (data.user) {
        setUser(data.user);
      }
    } catch (err) {
      console.error("[Dashboard] Fetch error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while loading your requests.",
      );
    } finally {
      setSubmissionsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    let cancelled = false;

    const loadDashboard = async () => {
      setLoading(true);

      try {
        await fetchSubmissions();
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadDashboard();

    return () => {
      cancelled = true;
    };
  }, [fetchSubmissions]);

  const handleNewRequest = () => {
    setError("");
    setEditingSubmissionId(undefined);
    setShowNewRequest(true);
  };

  const handleCloseNewRequest = () => {
    setShowNewRequest(false);
  };

  const handleNewRequestCreated = async (submissionId: string) => {
    setError("");
    setShowNewRequest(false);

    await fetchSubmissions();

    setEditingSubmissionId(submissionId);
    setDocumentsRefreshKey((value) => value + 1);

    navigate(`/requests/${submissionId}`);
  };

  const handleOpenSubmission = (submissionId: string) => {
    setError("");
    setShowNewRequest(false);
    setEditingSubmissionId(submissionId);
    setDocumentsRefreshKey((value) => value + 1);

    navigate(`/requests/${submissionId}`);
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f8fafc",
          color: "#64748b",
        }}
      >
        Loading requests...
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f8fafc",
        color: "#0f172a",
      }}
    >
      <header
        style={{
          backgroundColor: "#ffffff",
          borderBottom: "1px solid #e2e8f0",
        }}
      >
        <div
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            padding: "24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
          }}
        >
          <div>
            <h1 style={{ fontSize: "24px", fontWeight: 700, margin: 0 }}>
              Requests
            </h1>

            <p style={{ color: "#64748b", fontSize: "14px" }}>
              Manage and continue your vehicle submissions
            </p>

            {user && (
              <p style={{ color: "#64748b", fontSize: "12px" }}>
                {user.name || user.username || user.email || ""}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={handleNewRequest}
            style={{
              backgroundColor: "#2563eb",
              color: "#ffffff",
              padding: "10px 16px",
              border: 0,
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            + New Request
          </button>
        </div>
      </header>

      {/* <main
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "32px 24px",
        }}
      > */}
      <main
        style={{
          width: "100%",
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "32px 24px",
          boxSizing: "border-box",
          flex: "1 0 auto",
        }}
      >
        {error && (
          <div
            role="alert"
            style={{
              padding: "16px",
              marginBottom: "20px",
              backgroundColor: "#fef2f2",
              color: "#b91c1c",
              border: "1px solid #fecaca",
              borderRadius: "8px",
            }}
          >
            <p style={{ fontWeight: 700 }}>Unable to load requests</p>
            <p>{error}</p>

            <button
              type="button"
              onClick={() => void fetchSubmissions()}
              disabled={submissionsLoading}
              style={{
                textDecoration: "underline",
                cursor: "pointer",
                color: "#b91c1c",
              }}
            >
              {submissionsLoading ? "Refreshing..." : "Try again"}
            </button>
          </div>
        )}

        <section
          style={{
            backgroundColor: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "12px",
            overflow: "hidden",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          }}
        >
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "16px",
              padding: "20px 24px",
              borderBottom: "1px solid #e2e8f0",
            }}
          >
            <h2 style={{ fontSize: "20px", fontWeight: 700, margin: 0 }}>
              My Requests
            </h2>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <span
                style={{
                  padding: "6px 12px",
                  borderRadius: "20px",
                  backgroundColor: "#f1f5f9",
                  fontSize: "14px",
                }}
              >
                {submissions.length}{" "}
                {submissions.length === 1 ? "request" : "requests"}
              </span>

              <button
                type="button"
                onClick={() => void fetchSubmissions()}
                disabled={submissionsLoading}
                style={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #cbd5e1",
                  borderRadius: "8px",
                  padding: "8px 12px",
                  cursor: submissionsLoading ? "wait" : "pointer",
                }}
              >
                {submissionsLoading ? "Refreshing..." : "Refresh"}
              </button>
            </div>
          </div>

          {submissionsLoading ? (
            <div
              style={{
                padding: "48px 24px",
                textAlign: "center",
                color: "#64748b",
              }}
            >
              Loading requests...
            </div>
          ) : submissions.length === 0 ? (
            <div
              style={{
                padding: "64px 24px",
                textAlign: "center",
              }}
            >
              <h3 style={{ fontSize: "18px", fontWeight: 700 }}>
                No requests yet
              </h3>

              <p style={{ color: "#64748b", fontSize: "14px" }}>
                Start a new vehicle request to begin filling out your submission
                form.
              </p>

              <button
                type="button"
                onClick={handleNewRequest}
                style={{
                  marginTop: "16px",
                  padding: "10px 16px",
                  border: 0,
                  borderRadius: "8px",
                  backgroundColor: "#2563eb",
                  color: "#ffffff",
                  cursor: "pointer",
                }}
              >
                + Create New Request
              </button>
            </div>
          ) : (
            <div style={{ display: "block", width: "100%", overflowX: "auto" }}>
              <table
                style={{
                  display: "table",
                  visibility: "visible",
                  opacity: 1,
                  width: "100%",
                  borderCollapse: "collapse",
                  backgroundColor: "#ffffff",
                  color: "#0f172a",
                }}
              >
                <thead>
                  <tr>
                    <th style={headingStyle}>Request</th>
                    <th style={headingStyle}>Vehicle</th>
                    <th style={headingStyle}>Category</th>
                    <th style={headingStyle}>Status</th>
                    <th style={headingStyle}>Created</th>
                    <th style={headingStyle}>Updated</th>
                    <th style={{ ...headingStyle, textAlign: "right" }}>
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {submissions.map((submission, index) => {
                    const isSelected = editingSubmissionId === submission._id;

                    return (
                      <tr
                        key={submission._id}
                        style={{
                          backgroundColor: isSelected ? "#eff6ff" : "#ffffff",
                        }}
                      >
                        <td style={cellStyle}>
                          <strong>Request #{index + 1}</strong>
                          <div
                            style={{
                              marginTop: "4px",
                              fontSize: "12px",
                              color: "#64748b",
                              overflowWrap: "anywhere",
                            }}
                          >
                            {submission._id}
                          </div>
                        </td>

                        <td style={cellStyle}>
                          <strong>
                            {submission.requestInfo?.vehicleType || "-"}
                          </strong>
                          <div style={{ marginTop: "4px", color: "#64748b" }}>
                            {submission.requestInfo?.fuelType || "-"}
                          </div>
                        </td>

                        <td style={cellStyle}>
                          {submission.requestInfo?.category || "-"}
                        </td>

                        <td style={cellStyle}>
                          <span
                            style={{
                              display: "inline-block",
                              borderRadius: "20px",
                              padding: "5px 10px",
                              fontSize: "12px",
                              fontWeight: 600,
                              backgroundColor:
                                submission.status === "completed"
                                  ? "#d1fae5"
                                  : "#fef3c7",
                              color:
                                submission.status === "completed"
                                  ? "#065f46"
                                  : "#92400e",
                            }}
                          >
                            {submission.status === "completed"
                              ? "Completed"
                              : "Draft"}
                          </span>
                        </td>

                        <td style={cellStyle}>
                          {formatDate(submission.createdAt)}
                          <div style={{ marginTop: "4px", color: "#64748b" }}>
                            {formatTime(submission.createdAt)}
                          </div>
                        </td>

                        <td style={cellStyle}>
                          {formatDate(submission.updatedAt)}
                          <div style={{ marginTop: "4px", color: "#64748b" }}>
                            {formatTime(submission.updatedAt)}
                          </div>
                        </td>

                        <td style={{ ...cellStyle, textAlign: "right" }}>
                          <button
                            type="button"
                            onClick={() => handleOpenSubmission(submission._id)}
                            aria-pressed={isSelected}
                            style={{
                              backgroundColor: "#2563eb",
                              color: "#ffffff",
                              border: 0,
                              borderRadius: "8px",
                              padding: "8px 14px",
                              cursor: "pointer",
                              fontWeight: 600,
                            }}
                          >
                            Open
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {editingSubmissionId && (
          <section style={{ marginTop: "32px" }} key={editingSubmissionId}>
            <TableDocuments
              submissionId={editingSubmissionId}
              refreshKey={documentsRefreshKey}
            />
          </section>
        )}
      </main>

      {showNewRequest && (
        <NewRequest
          onClose={handleCloseNewRequest}
          onCreated={handleNewRequestCreated}
        />
      )}
    </div>
  );
};

export default Dashboard;
