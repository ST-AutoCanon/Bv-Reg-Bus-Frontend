
import { useCallback, useEffect, useState } from "react";
import {
  Download,
  FileText,
  RefreshCw,
  Archive,
  CheckCircle2,
  Clock3,
  AlertCircle,
} from "lucide-react";


type TableDocument = {
  key: string;
  label: string;
  fileName: string;
  exists: boolean;
  status: "not_started" | "in_progress" | "completed";
  completionPercentage: number;
};

type TableDocumentsProps = {
  submissionId: string;
  refreshKey?: number;
};

type ApiResponse = {
  success?: boolean;
  message?: string;
  data?: unknown;
  documents?: unknown;
  tableDocuments?: unknown;
  [key: string]: unknown;
};

const API_URL = (
  process.env.REACT_APP_BASE_URL || "http://localhost:3000/api"
).replace(/\/+$/, "");

/**
 * Read the authentication token from Redux Persist or localStorage.
 */
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
  } catch (error) {
    console.error(
      "[TableDocuments] Failed to read persisted authentication:",
      error,
    );
  }

  return localStorage.getItem("token")?.trim() || null;
};

/**
 * Parse API responses safely.
 */
const parseResponse = async (response: Response): Promise<ApiResponse> => {
  if (response.status === 304) {
    throw new Error(
      "The server returned HTTP 304. Check caching on the backend endpoint.",
    );
  }

  const text = await response.text();

  if (!text.trim()) {
    if (!response.ok) {
      throw new Error(`Request failed with HTTP ${response.status}.`);
    }

    return {};
  }

  let result: unknown;

  try {
    result = JSON.parse(text);
  } catch {
    if (!response.ok) {
      throw new Error(text || `Request failed with HTTP ${response.status}.`);
    }

    throw new Error("The server returned an invalid JSON response.");
  }

  if (result === null || typeof result !== "object" || Array.isArray(result)) {
    throw new Error("Unexpected API response format.");
  }

  return result as ApiResponse;
};

/**
 * Normalize supported API response formats into a document array.
 */
const extractDocuments = (result: ApiResponse): TableDocument[] => {
  const nestedData =
    result.data &&
    typeof result.data === "object" &&
    !Array.isArray(result.data)
      ? (result.data as Record<string, unknown>)
      : undefined;

  const candidates = [
    result.data,
    result.documents,
    result.tableDocuments,
    nestedData?.documents,
    nestedData?.tableDocuments,
  ];

  const rawDocuments = candidates.find(Array.isArray);

  if (!Array.isArray(rawDocuments)) {
    return [];
  }

  return rawDocuments
    .filter(
      (item): item is Record<string, unknown> =>
        !!item && typeof item === "object",
    )
    .map((item, index) => {
      const key = String(
        item.key ?? item.tableName ?? item.name ?? `table-${index + 1}`,
      );

      const rawPercentage = Number(
        item.completionPercentage ?? item.completion ?? item.progress ?? 0,
      );

      const completionPercentage = Number.isFinite(rawPercentage)
        ? Math.min(100, Math.max(0, rawPercentage))
        : 0;

      const rawStatus = String(item.status ?? "not_started");

      const status: TableDocument["status"] =
        rawStatus === "completed"
          ? "completed"
          : rawStatus === "in_progress"
            ? "in_progress"
            : "not_started";

      return {
        key,
        label: String(item.label ?? item.title ?? item.tableName ?? key),
        fileName: String(item.fileName ?? item.filename ?? `${key}.docx`),
        exists:
          item.exists === true ||
          item.fileExists === true ||
          item.available === true,
        status,
        completionPercentage,
      };
    });
};

/**
 * Read Content-Disposition filenames.
 */
const getFileName = (response: Response, fallback: string): string => {
  const header = response.headers.get("Content-Disposition");

  if (!header) {
    return fallback;
  }

  const utf8Match = header.match(/filename\*=UTF-8''([^;]+)/i);

  if (utf8Match?.[1]) {
    try {
      return decodeURIComponent(utf8Match[1].trim());
    } catch {
      return utf8Match[1].trim();
    }
  }

  const match = header.match(/filename="?([^";]+)"?/i);

  return match?.[1]?.trim() || fallback;
};

/**
 * Save a downloaded blob.
 */
const downloadBlob = (blob: Blob, fileName: string) => {
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = fileName;

  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  window.setTimeout(() => {
    window.URL.revokeObjectURL(url);
  }, 1000);
};

/**
 * Table documents component.
 */
const TableDocuments = ({
  submissionId,
  refreshKey = 0,
}: TableDocumentsProps) => {
  console.log("[TableDocuments] COMPONENT RENDERED", {
    submissionId,
    refreshKey,
    currentPage: window.location.pathname,
    currentURL: window.location.href,
  });

  const [documents, setDocuments] = useState<TableDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [downloadingAll, setDownloadingAll] = useState(false);
  const [error, setError] = useState("");

  /**
   * FETCH TABLE DOCUMENT STATUS
   */
  const fetchDocuments = useCallback(async () => {
    console.group("[TableDocuments] FETCH START");

    console.log("API base URL:", API_URL);
    console.log("Submission ID:", submissionId);
    console.log("Refresh key:", refreshKey);
    console.log("Current page:", window.location.pathname);

    if (!submissionId) {
      console.error("Cannot fetch: submissionId is empty.");

      setDocuments([]);
      setError("Submission ID is required.");
      setLoading(false);

      console.groupEnd();
      return;
    }

    const token = getStoredToken();

    console.log("Authentication token exists:", Boolean(token));

    if (!token) {
      console.error("Cannot fetch: authentication token not found.");

      setDocuments([]);
      setError("Authentication required. Please sign in again.");
      setLoading(false);

      console.groupEnd();
      return;
    }

    const endpoint =
      `${API_URL}/bus/submissions/` +
      `${encodeURIComponent(submissionId)}/table-documents`;

    const normalizedEndpoint = endpoint.replace(
      /\/bus\/bus\/submissions\//,
      "/bus/submissions/",
    );

    try {
      setLoading(true);
      setError("");

      console.log("REQUEST URL:", normalizedEndpoint);
      console.log("REQUEST METHOD: GET");
      console.log("Authorization: Bearer [REDACTED]");

      const response = await fetch(normalizedEndpoint, {
        method: "GET",
        cache: "no-store",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      });

      console.log("HTTP STATUS:", response.status);
      console.log("HTTP STATUS TEXT:", response.statusText);
      console.log("RESPONSE OK:", response.ok);
      console.log(
        "RESPONSE HEADERS:",
        Object.fromEntries(response.headers.entries()),
      );

      const responseText = await response.text();

      console.log("RAW RESPONSE BODY:", responseText);

      if (response.status === 304) {
        throw new Error(
          "HTTP 304 received. Check caching on the backend endpoint.",
        );
      }

      let result: ApiResponse = {};

      if (responseText.trim()) {
        try {
          result = JSON.parse(responseText) as ApiResponse;
        } catch (parseError) {
          console.error("JSON PARSE ERROR:", parseError);

          throw new Error(`Invalid JSON response (HTTP ${response.status}).`);
        }
      } else if (response.ok) {
        throw new Error(
          "The API returned HTTP success with an empty response body.",
        );
      }

      console.log("PARSED API RESPONSE:", result);

      if (!response.ok) {
        const message =
          result.message ||
          `Failed to load table documents (HTTP ${response.status}).`;

        console.error("API REQUEST FAILED:", {
          url: normalizedEndpoint,
          status: response.status,
          message,
          response: result,
        });

        throw new Error(message);
      }

      console.log("API success flag:", result.success);
      console.log("Response keys:", Object.keys(result));

      const nextDocuments = extractDocuments(result);

      console.log("EXTRACTED DOCUMENT COUNT:", nextDocuments.length);
      console.log("EXTRACTED DOCUMENTS:", nextDocuments);

      if (nextDocuments.length === 0) {
        console.warn(
          "The request succeeded, but no documents were extracted.",
          {
            responseKeys: Object.keys(result),
            data: result.data,
            documents: result.documents,
            tableDocuments: result.tableDocuments,
          },
        );
      }

      setDocuments(nextDocuments);

      console.log("Document state update requested.");
    } catch (error) {
      console.error("[TableDocuments] FETCH FAILED:", error);

      setDocuments([]);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to load table documents.",
      );
    } finally {
      setLoading(false);

      console.log("[TableDocuments] FETCH FINISHED");
      console.groupEnd();
    }
  }, [submissionId, refreshKey]);

  /**
   * FETCH ON MOUNT AND WHEN DEPENDENCIES CHANGE.
   * This is the only automatic fetch effect.
   */
  useEffect(() => {
    console.group("[TableDocuments] EFFECT TRIGGERED");

    console.log("Component reached:", true);
    console.log("Submission ID:", submissionId);
    console.log("Refresh key:", refreshKey);
    console.log("Calling fetchDocuments.");

    console.groupEnd();

    void fetchDocuments();
  }, [fetchDocuments]);

  /**
   * DOWNLOAD ONE TABLE
   */
  const handleDownload = async (table: TableDocument) => {
    console.group("[TableDocuments] DOWNLOAD ONE");

    const token = getStoredToken();

    console.log("Submission ID:", submissionId);
    console.log("Table key:", table.key);
    console.log("File name:", table.fileName);

    if (!token) {
      setError("Authentication required.");
      console.groupEnd();
      return;
    }

    if (!submissionId) {
      setError("Submission ID is required.");
      console.groupEnd();
      return;
    }

    const endpoint =
      `${API_URL}/bus/submissions/` +
      `${encodeURIComponent(submissionId)}/table-documents/` +
      `${encodeURIComponent(table.key)}/download`;

    const normalizedEndpoint = endpoint.replace(
      /\/bus\/bus\/submissions\//,
      "/bus/submissions/",
    );

    try {
      setDownloading(table.key);
      setError("");

      console.log("Download URL:", normalizedEndpoint);

      const response = await fetch(normalizedEndpoint, {
        method: "GET",
        cache: "no-store",
        headers: {
          Accept: "*/*",
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Download HTTP status:", response.status);

      if (!response.ok) {
        const result = await parseResponse(response);

        throw new Error(
          result.message ||
            `Failed to download document (HTTP ${response.status}).`,
        );
      }

      const blob = await response.blob();

      console.log("Downloaded blob size:", blob.size);
      console.log("Downloaded content type:", blob.type);

      if (!blob.size) {
        throw new Error("The downloaded document is empty.");
      }

      const fileName = getFileName(response, table.fileName);

      downloadBlob(blob, fileName);

      console.log("Download started:", fileName);
    } catch (error) {
      console.error("[TableDocuments] DOWNLOAD FAILED:", error);

      setError(
        error instanceof Error ? error.message : "Failed to download document.",
      );
    } finally {
      setDownloading(null);
      console.groupEnd();
    }
  };

  /**
   * DOWNLOAD ALL TABLES
   */
  const handleDownloadAll = async () => {
    console.group("[TableDocuments] DOWNLOAD ALL");

    const token = getStoredToken();

    console.log("Submission ID:", submissionId);

    if (!submissionId) {
      setError("Submission ID is required.");
      console.groupEnd();
      return;
    }

    if (!token) {
      setError("Authentication required.");
      console.groupEnd();
      return;
    }

    const endpoint =
      `${API_URL}/bus/submissions/` +
      `${encodeURIComponent(submissionId)}/table-documents/download-all`;

    const normalizedEndpoint = endpoint.replace(
      /\/bus\/bus\/submissions\//,
      "/bus/submissions/",
    );

    try {
      setDownloadingAll(true);
      setError("");

      console.log("Download all URL:", normalizedEndpoint);

      const response = await fetch(normalizedEndpoint, {
        method: "GET",
        cache: "no-store",
        headers: {
          Accept: "*/*",
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Download all HTTP status:", response.status);

      if (!response.ok) {
        const result = await parseResponse(response);

        throw new Error(
          result.message ||
            `Failed to download documents (HTTP ${response.status}).`,
        );
      }

      const blob = await response.blob();

      console.log("Archive blob size:", blob.size);
      console.log("Archive content type:", blob.type);

      if (!blob.size) {
        throw new Error("The downloaded archive is empty.");
      }

      const fileName = getFileName(
        response,
        `submission-${submissionId}-tables.zip`,
      );

      downloadBlob(blob, fileName);

      console.log("Archive download started:", fileName);
    } catch (error) {
      console.error("[TableDocuments] DOWNLOAD ALL FAILED:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to download documents.",
      );
    } finally {
      setDownloadingAll(false);
      console.groupEnd();
    }
  };

  /**
   * STATUS ICON
   */
  const renderStatusIcon = (status: TableDocument["status"]) => {
    if (status === "completed") {
      return <CheckCircle2 className="h-4 w-4 text-emerald-600" />;
    }

    if (status === "in_progress") {
      return <Clock3 className="h-4 w-4 text-amber-600" />;
    }

    return <AlertCircle className="h-4 w-4 text-slate-400" />;
  };

  /**
   * LOADING
   */
  if (loading) {
    return (
      <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <RefreshCw className="h-5 w-5 animate-spin text-blue-600" />
          <p className="text-sm text-slate-500">
            Loading documents for this request...
          </p>
        </div>
      </section>
    );
  }

  /**
   * RENDER
   */
  return (
    // <section className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
    <section className="mt-8 w-full min-w-0 rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-slate-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-bold text-slate-900">
              Table Documents
            </h2>
          </div>

          <p className="mt-1 text-sm text-slate-500">
            Documents for the selected request only.
          </p>

          <p className="mt-2 font-mono text-xs text-slate-400">
            Submission: {submissionId}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void fetchDocuments()}
            disabled={loading || downloadingAll}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>

          <button
            type="button"
            onClick={() => void handleDownloadAll()}
            disabled={downloadingAll || downloading !== null}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {downloadingAll ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Archive className="h-4 w-4" />
            )}

            {downloadingAll ? "Preparing..." : "Download All"}
          </button>
        </div>
      </div>

      {error && (
        <div className="mx-6 mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {documents.length === 0 ? (
        <div className="p-8 text-center">
          <FileText className="mx-auto h-10 w-10 text-slate-300" />

          <h3 className="mt-3 font-semibold text-slate-800">
            No table documents found
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            The API returned no documents for this submission, or no supported
            document array was found in the response.
          </p>

          <button
            type="button"
            onClick={() => void fetchDocuments()}
            className="mt-4 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Try again
          </button>
        </div>
      ) : (
        <div className="grid gap-4 p-6 md:grid-cols-3">
          {documents.map((document) => (
            <div
              key={document.key}
              className="rounded-xl border border-slate-200 bg-slate-50 p-5 transition hover:border-blue-200 hover:bg-blue-50/40"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>

                {renderStatusIcon(document.status)}
              </div>

              <h3 className="mt-4 font-semibold text-slate-900">
                {document.label}
              </h3>

              <p className="mt-1 text-xs text-slate-400">{document.fileName}</p>

              <div className="mt-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-500">Completion</span>

                  <span className="font-semibold text-slate-700">
                    {document.completionPercentage}%
                  </span>
                </div>

                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-blue-600 transition-all"
                    style={{
                      width: `${document.completionPercentage}%`,
                    }}
                  />
                </div>
              </div>

              <button
                type="button"
                disabled={
                  !document.exists || downloading !== null || downloadingAll
                }
                onClick={() => void handleDownload(document)}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {downloading === document.key ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}

                {downloading === document.key
                  ? "Preparing..."
                  : document.exists
                    ? "Download"
                    : "No Data"}
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default TableDocuments;