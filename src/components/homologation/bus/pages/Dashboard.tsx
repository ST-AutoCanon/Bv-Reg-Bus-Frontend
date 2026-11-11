
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import NewRequest from "./NewRequest";
import TableDocuments from "../components/TableDocuments";

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
}

const API_URL = (
  process.env.REACT_APP_BASE_URL || "http://localhost:3000/api"
).replace(/\/+$/, "");

// Get authentication token
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

// Format date for dashboard table
const formatDate = (date?: string): string => {
  if (!date) {
    return "-";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "-";
  }

  return parsedDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const Dashboard = () => {
  const [token] = useState<string | null>(() => getStoredToken());

  const navigate = useNavigate();

  const [submissions, setSubmissions] = useState<Submission[]>([]);

  const [loading, setLoading] = useState(true);
  const [submissionsLoading, setSubmissionsLoading] = useState(true);

  const [showNewRequest, setShowNewRequest] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);

  const [editingSubmissionId, setEditingSubmissionId] =
    useState<string | undefined>(undefined);

  const [documentsRefreshKey, setDocumentsRefreshKey] = useState(0);

  const [error, setError] = useState("");

  // Fetch existing submissions
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
      setSelectedRequestId((previous) => {
        return result.some((item) => item._id === previous)
          ? previous
          : result[0]?._id ?? null;
      });
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

  // Initial dashboard loading
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

  // Open new request modal
  const handleNewRequest = () => {
    setError("");
    setEditingSubmissionId(undefined);
    setShowNewRequest(true);
  };

  // Close new request modal
  const handleCloseNewRequest = () => {
    setShowNewRequest(false);
  };

  // After creating a request
  const handleNewRequestCreated = async (submissionId: string) => {
    setError("");
    setShowNewRequest(false);

    await fetchSubmissions();

    setEditingSubmissionId(submissionId);
    setDocumentsRefreshKey((value) => value + 1);

    navigate(`/requests/${submissionId}`);
  };

  // Open existing request
  const handleOpenSubmission = (submissionId: string) => {
    setError("");
    setShowNewRequest(false);

    setEditingSubmissionId(submissionId);
    setDocumentsRefreshKey((value) => value + 1);

    navigate(`/requests/${submissionId}`);
  };

  // Copy request ID
  const handleCopyRequestId = async (submissionId: string) => {
    try {
      await navigator.clipboard.writeText(submissionId);
    } catch (err) {
      console.error("Unable to copy request ID:", err);
      setError("Unable to copy request ID.");
    }
  };

  // Loading screen
  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#ffffff",
          color: "#64748b",
          fontSize: "15px",
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
        width: "100%",
        backgroundColor: "#ffffff",
        color: "#111827",
        boxSizing: "border-box",
      }}
    >
      <main
        style={{
          width: "100%",
          maxWidth: "1600px",
          margin: "0 auto",
          padding: "65px 4% 40px",
          boxSizing: "border-box",
        }}
      >
        {/* BUS Heading and Add New Request */}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "20px",
            marginBottom: "58px",
          }}
        >
          <div>
            <h1
              style={{
                fontSize: "29px",
                fontWeight: 500,
                color: "#111111",
                margin: 0,
                lineHeight: 1.4,
              }}
            >
              BUS
            </h1>

            <div
              style={{
                width: "64px",
                height: "5px",
                backgroundColor: "#80bf20",
                marginTop: "8px",
              }}
            />
          </div>

          <button
            type="button"
            onClick={handleNewRequest}
            style={{
              backgroundColor: "#80bf20",
              color: "#ffffff",
              padding: "15px 22px",
              border: "none",
              borderRadius: "9px",
              cursor: "pointer",
              fontSize: "16px",
              fontWeight: 600,
              transition: "background-color 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#6da719";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#80bf20";
            }}
          >
            Add New Request
          </button>
        </div>

        {/* Error Message */}

        {error && (
          <div
            role="alert"
            style={{
              padding: "14px 18px",
              marginBottom: "24px",
              backgroundColor: "#fef2f2",
              color: "#b91c1c",
              border: "1px solid #fecaca",
              borderRadius: "8px",
              fontSize: "14px",
            }}
          >
            <strong>Unable to load requests</strong>
            <p style={{ margin: "5px 0" }}>{error}</p>

            <button
              type="button"
              onClick={() => void fetchSubmissions()}
              disabled={submissionsLoading}
              style={{
                background: "none",
                border: "none",
                color: "#b91c1c",
                textDecoration: "underline",
                cursor: "pointer",
                padding: 0,
              }}
            >
              {submissionsLoading ? "Refreshing..." : "Try again"}
            </button>
          </div>
        )}

        {/* Requests Table */}

        <section
          style={{
            width: "100%",
            overflowX: "auto",
            overflowY: "visible",
          }}
        >
          <table
            style={{
              width: "100%",
              minWidth: "1100px",
              borderCollapse: "collapse",
              tableLayout: "fixed",
              backgroundColor: "#ffffff",
            }}
          >
            <thead>
              <tr
                style={{
                  backgroundColor: "#d6eaff",
                  height: "70px",
                }}
              >
                {/* Status Indicator Column */}

                <th
                  style={{
                    width: "6%",
                    padding: "16px 10px",
                  }}
                />

                {/* Table Headers */}

                {[
                  { label: "Request", width: "18%" },
                  { label: "Vehicle", width: "15%" },
                  { label: "Category", width: "12%" },
                  { label: "Status", width: "11%" },
                  { label: "Created", width: "13%" },
                  { label: "Updated", width: "13%" },
                  { label: "Action", width: "12%" },
                ].map((column) => (
                  <th
                    key={column.label}
                    style={{
                      width: column.width,
                      padding: "16px 10px",
                      color: "#46566b",
                      fontSize: "16px",
                      fontWeight: 700,
                      letterSpacing: "1px",
                      textAlign: "center",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {submissionsLoading ? (
                <tr>
                  <td
                    colSpan={8}
                    style={{
                      padding: "45px",
                      textAlign: "center",
                      color: "#64748b",
                    }}
                  >
                    Loading requests...
                  </td>
                </tr>
              ) : submissions.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    style={{
                      padding: "65px 20px",
                      textAlign: "center",
                      color: "#64748b",
                      fontSize: "15px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "18px",
                        fontWeight: 600,
                        color: "#334155",
                        marginBottom: "8px",
                      }}
                    >
                      No requests yet
                    </div>

                    Start a new vehicle request to begin your submission.
                  </td>
                </tr>
              ) : (
                submissions.map((submission, index) => {
                  const isSelected =
                    editingSubmissionId === submission._id;

                  const isCompleted =
                    submission.status === "completed";

                  return (
                    <tr
                      key={submission._id}
                      style={{
                        height: "76px",
                        backgroundColor: isSelected
                          ? "#f8fbff"
                          : "#ffffff",
                        borderBottom: "1px solid #e8edf3",
                        transition: "background-color 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#f8fbff";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor =
                          isSelected ? "#f8fbff" : "#ffffff";
                      }}
                    >
                      {/* Status Indicator */}

                      <td
                        style={{
                          textAlign: "center",
                          verticalAlign: "middle",
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => setSelectedRequestId(submission._id)}
                          style={{
                            width: "24px",
                            height: "24px",
                            borderRadius: "50%",
                            border: "none",
                            padding: 0,
                            cursor: "pointer",
                            backgroundColor:
                              selectedRequestId === submission._id
                                ? "#80bf20"
                                : "#cccccc",
                            transition: "background-color 0.2s ease",
                          }}
                          aria-label={`Select Request #${index + 1}`}
                          aria-pressed={selectedRequestId === submission._id}
                        />
                      </td>
                      {/* Request */}

                      <td
                        style={{
                          padding: "14px 10px",
                          textAlign: "center",
                          color: "#172b4d",
                          fontSize: "16px",
                          fontWeight: 500,
                          overflowWrap: "anywhere",
                        }}
                      >
                        <div>Request #{index + 1}</div>

                        <div
                          style={{
                            fontSize: "11px",
                            color: "#94a3b8",
                            marginTop: "4px",
                          }}
                        >
                          {submission._id}
                        </div>
                      </td>

                      {/* Vehicle */}

                      <td
                        style={{
                          padding: "14px 10px",
                          textAlign: "center",
                          color: "#172b4d",
                          fontSize: "16px",
                        }}
                      >
                        <div style={{ fontWeight: 500 }}>
                          {submission.requestInfo?.vehicleType || "-"}
                        </div>

                        <div
                          style={{
                            fontSize: "12px",
                            color: "#94a3b8",
                            marginTop: "4px",
                          }}
                        >
                          {submission.requestInfo?.fuelType || ""}
                        </div>
                      </td>

                      {/* Category */}

                      <td
                        style={{
                          padding: "14px 10px",
                          textAlign: "center",
                          color: "#172b4d",
                          fontSize: "15px",
                        }}
                      >
                        {submission.requestInfo?.category || "-"}
                      </td>

                      {/* Status */}

                      <td
                        style={{
                          padding: "14px 10px",
                          textAlign: "center",
                        }}
                      >
                        <span
                          style={{
                            display: "inline-block",
                            padding: "6px 12px",
                            borderRadius: "20px",
                            fontSize: "12px",
                            fontWeight: 600,
                            backgroundColor: isCompleted
                              ? "#e4f5d0"
                              : "#f1f1f1",
                            color: isCompleted
                              ? "#477d16"
                              : "#64748b",
                          }}
                        >
                          {isCompleted ? "Completed" : "Draft"}
                        </span>
                      </td>

                      {/* Created */}

                      <td
                        style={{
                          padding: "14px 10px",
                          textAlign: "center",
                          color: "#64748b",
                          fontSize: "13px",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {formatDate(submission.createdAt)}
                      </td>

                      {/* Updated */}

                      <td
                        style={{
                          padding: "14px 10px",
                          textAlign: "center",
                          color: "#64748b",
                          fontSize: "13px",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {formatDate(submission.updatedAt)}
                      </td>

                      {/* Action Buttons */}

                      <td
                        style={{
                          padding: "14px 10px",
                          textAlign: "center",
                          whiteSpace: "nowrap",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "16px",
                          }}
                        >
                          {/* Edit / Open */}

                          <button
                            type="button"
                            title="Open request"
                            aria-label="Open request"
                            onClick={() =>
                              handleOpenSubmission(submission._id)
                            }
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              border: "none",
                              background: "transparent",
                              color: "#172033",
                              cursor: "pointer",
                              padding: "4px",
                            }}
                          >
                            <svg
                              width="22"
                              height="22"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.9"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M12 20H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h11" />
                              <path d="M16 3.5a2.1 2.1 0 0 1 3 3L11 14.5 7 15.5l1-4z" />
                            </svg>
                          </button>

                          {/* Copy Request ID */}

                          <button
                            type="button"
                            title="Copy request ID"
                            aria-label="Copy request ID"
                            onClick={() =>
                              void handleCopyRequestId(submission._id)
                            }
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              border: "none",
                              background: "transparent",
                              color: "#172033",
                              cursor: "pointer",
                              padding: "4px",
                            }}
                          >
                            <svg
                              width="22"
                              height="22"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.9"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <rect
                                x="8"
                                y="8"
                                width="13"
                                height="13"
                                rx="2"
                              />
                              <path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </section>

        {/* Request Count and Refresh */}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "15px",
            marginTop: "35px",
          }}
        >
          {/* <span
            style={{
              fontSize: "13px",
              color: "#94a3b8",
            }}
          >
            Total Requests: {submissions.length}
          </span> */}

          {/* <button
            type="button"
            onClick={() => void fetchSubmissions()}
            disabled={submissionsLoading}
            style={{
              border: "1px solid #d1d5db",
              backgroundColor: "#ffffff",
              borderRadius: "7px",
              padding: "9px 17px",
              fontSize: "13px",
              color: "#475569",
              cursor: submissionsLoading ? "wait" : "pointer",
            }}
          >
            {submissionsLoading ? "Refreshing..." : "Refresh"}
          </button> */}
        </div>

        {/* Existing Documents Component */}

        {editingSubmissionId && (
          <section
            style={{ marginTop: "32px" }}
            key={editingSubmissionId}
          >
            <TableDocuments
              submissionId={editingSubmissionId}
              refreshKey={documentsRefreshKey}
            />
          </section>
        )}
      </main>

      {/* New Request Modal */}

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
