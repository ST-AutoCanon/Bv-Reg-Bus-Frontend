import { FormEvent, useState } from "react";

interface RequestInfo {
  vehicleType: string;
  fuelType: string;
  certificationType: string;
  unloadedWeightWithoutBattery: string;
  category: string;
  preferredTestingAgency: string;
}

interface NewRequestProps {
  onClose: () => void;
  onCreated: (submissionId: string) => void;
}

interface ApiResponse {
  success?: boolean;
  message?: string;
  error?: string;
  data?: unknown;
  submission?: unknown;
  errors?: Record<string, string | string[]>;
}

const API_URL = (
  process.env.REACT_APP_BASE_URL || "http://localhost:3000/api"
).replace(/\/+$/, "");

// Get token from Redux Persist
const getStoredToken = (): string | null => {
  try {
    const persistedRoot = localStorage.getItem("persist:root");

    if (!persistedRoot) {
      console.warn("Redux Persist root was not found.");
      return localStorage.getItem("token")?.trim() || null;
    }

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

    return localStorage.getItem("token")?.trim() || null;
  } catch (error) {
    console.error("Failed to read persisted token:", error);
    return localStorage.getItem("token")?.trim() || null;
  }
};

// API response helpers
const getErrorMessage = (data: ApiResponse, fallback: string): string => {
  return data.message || data.error || fallback;
};

const getSubmissionId = (data: ApiResponse): string | null => {
  const responseData = data.data;

  if (
    responseData &&
    typeof responseData === "object" &&
    !Array.isArray(responseData)
  ) {
    const nested = responseData as Record<string, unknown>;

    if (typeof nested._id === "string" && nested._id.trim()) {
      return nested._id;
    }

    if (typeof nested.id === "string" && nested.id.trim()) {
      return nested.id;
    }

    if (nested.submission && typeof nested.submission === "object") {
      const submission = nested.submission as Record<string, unknown>;

      if (typeof submission._id === "string" && submission._id.trim()) {
        return submission._id;
      }

      if (typeof submission.id === "string" && submission.id.trim()) {
        return submission.id;
      }
    }
  }

  if (data.submission && typeof data.submission === "object") {
    const submission = data.submission as Record<string, unknown>;

    if (typeof submission._id === "string" && submission._id.trim()) {
      return submission._id;
    }

    if (typeof submission.id === "string" && submission.id.trim()) {
      return submission.id;
    }
  }

  return null;
};

// Reusable styling
const inputBaseClass =
  "h-11 w-full min-w-0 rounded-lg border bg-white px-3.5 text-sm text-gray-800 placeholder:text-sm placeholder:text-gray-400 outline-none transition focus:ring-2 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500";

const labelClass = "mb-2 block text-sm font-semibold text-gray-700";

const errorClass = "mt-1.5 text-xs font-medium text-red-600";

const NewRequest = ({ onClose, onCreated }: NewRequestProps) => {
  const [formData, setFormData] = useState<RequestInfo>({
    vehicleType: "",
    fuelType: "",
    certificationType: "",
    unloadedWeightWithoutBattery: "",
    category: "",
    preferredTestingAgency: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  // Handle input changes
  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));

    setServerError("");
  };

  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.vehicleType.trim()) {
      newErrors.vehicleType = "Type of Vehicle is required";
    }

    if (!formData.fuelType.trim()) {
      newErrors.fuelType = "Fuel Type is required";
    }

    if (!formData.certificationType.trim()) {
      newErrors.certificationType = "Type of Certification is required";
    }

    if (!formData.unloadedWeightWithoutBattery.trim()) {
      newErrors.unloadedWeightWithoutBattery =
        "Unloaded Weight (w/o Battery) is required";
    } else if (
      !Number.isFinite(Number(formData.unloadedWeightWithoutBattery)) ||
      Number(formData.unloadedWeightWithoutBattery) < 0
    ) {
      newErrors.unloadedWeightWithoutBattery = "Enter a valid unloaded weight";
    }

    if (!formData.category.trim()) {
      newErrors.category = "Category is required";
    }

    if (!formData.preferredTestingAgency.trim()) {
      newErrors.preferredTestingAgency = "Preferred Testing Agency is required";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // Map backend validation errors
  const applyServerValidationErrors = (
    serverErrors?: Record<string, string | string[]>,
  ) => {
    if (!serverErrors || typeof serverErrors !== "object") {
      return;
    }

    const mappedErrors: Record<string, string> = {};

    Object.entries(serverErrors).forEach(([field, message]) => {
      if (typeof message === "string") {
        mappedErrors[field] = message;
      } else if (Array.isArray(message)) {
        mappedErrors[field] = message.join(", ");
      }
    });

    setErrors((previous) => ({
      ...previous,
      ...mappedErrors,
    }));
  };

  // Create request
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setServerError("");

    if (!validateForm()) {
      return;
    }

    const token = getStoredToken();

    if (!token) {
      setServerError("Authentication required. Please sign in again.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/bus/submissions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: JSON.stringify({
          requestInfo: formData,
        }),
      });

      const responseText = await response.text();

      let data: ApiResponse = {};

      try {
        data = responseText ? (JSON.parse(responseText) as ApiResponse) : {};
      } catch {
        throw new Error(
          `The server returned an invalid response (HTTP ${response.status}).`,
        );
      }

      if (!response.ok) {
        applyServerValidationErrors(data.errors);

        if (response.status === 401 || response.status === 403) {
          setServerError(
            getErrorMessage(
              data,
              "Your session may have expired. Please sign in again.",
            ),
          );
          return;
        }

        setServerError(
          getErrorMessage(
            data,
            `Failed to create request (HTTP ${response.status}).`,
          ),
        );
        return;
      }

      const submissionId = getSubmissionId(data);

      if (!submissionId) {
        console.error("Create request response:", data);

        setServerError(
          "The server responded successfully, but no request ID was returned. Please check your requests before retrying.",
        );

        return;
      }

      onCreated(submissionId);
    } catch (error) {
      console.error("Create request error:", error);

      setServerError(
        error instanceof Error
          ? error.message
          : "Something went wrong while creating the request.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-3 sm:p-5 md:p-8"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !loading) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-request-title"
        className="flex max-h-[calc(100dvh-1.5rem)] w-full max-w-3xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl sm:max-h-[90dvh] sm:rounded-2xl"
      >
        {/* Header */}
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-gray-200 px-4 py-4 sm:px-6 sm:py-5 md:px-7">
          <div className="min-w-0">
            <h2
              id="new-request-title"
              className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl"
            >
              Create New Request
            </h2>

            <p className="mt-1 text-sm leading-5 text-gray-500">
              Enter the basic information to create your vehicle request.
            </p>

            <p className="mt-2 text-xs text-gray-500">
              Fields marked <span className="text-red-500">*</span> are
              required.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            aria-label="Close new request form"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-2xl leading-none text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          noValidate
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain"
        >
          <div className="space-y-5 px-4 py-5 sm:px-6 sm:py-6 md:px-7">
            {/* Server error */}
            {serverError && (
              <div
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-700"
              >
                <p className="font-semibold">Unable to create request</p>
                <p className="mt-1 break-words">{serverError}</p>
              </div>
            )}

            {/* Responsive fields: 1 column on mobile, 2 on desktop */}
            <div className="grid grid-cols-1 gap-x-5 gap-y-5 md:grid-cols-2">
              {/* Vehicle type */}
              <div className="min-w-0">
                <label htmlFor="vehicleType" className={labelClass}>
                  Type of Vehicle <span className="text-red-500">*</span>
                </label>

                <input
                  id="vehicleType"
                  name="vehicleType"
                  type="text"
                  autoComplete="off"
                  value={formData.vehicleType}
                  onChange={handleChange}
                  placeholder="Enter type of vehicle"
                  disabled={loading}
                  aria-invalid={Boolean(errors.vehicleType)}
                  aria-describedby={
                    errors.vehicleType ? "vehicleType-error" : undefined
                  }
                  className={`${inputBaseClass} ${
                    errors.vehicleType
                      ? "border-red-400 focus:ring-red-200"
                      : "border-gray-300 focus:border-blue-500 focus:ring-blue-200"
                  }`}
                />

                {errors.vehicleType && (
                  <p id="vehicleType-error" className={errorClass}>
                    {errors.vehicleType}
                  </p>
                )}
              </div>

              {/* Fuel type */}
              <div className="min-w-0">
                <label htmlFor="fuelType" className={labelClass}>
                  Fuel Type <span className="text-red-500">*</span>
                </label>

                <select
                  id="fuelType"
                  name="fuelType"
                  value={formData.fuelType}
                  onChange={handleChange}
                  disabled={loading}
                  aria-invalid={Boolean(errors.fuelType)}
                  aria-describedby={
                    errors.fuelType ? "fuelType-error" : undefined
                  }
                  className={`${inputBaseClass} ${
                    errors.fuelType
                      ? "border-red-400 focus:ring-red-200"
                      : "border-gray-300 focus:border-blue-500 focus:ring-blue-200"
                  }`}
                >
                  <option value="">Select fuel type</option>
                  <option value="petrol">Petrol</option>
                  <option value="diesel">Diesel</option>
                  <option value="cng">CNG</option>
                  <option value="lpg">LPG</option>
                  <option value="electric">Electric</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="hydrogen">Hydrogen</option>
                  <option value="other">Other</option>
                </select>

                {errors.fuelType && (
                  <p id="fuelType-error" className={errorClass}>
                    {errors.fuelType}
                  </p>
                )}
              </div>

              {/* Certification type */}
              <div className="min-w-0">
                <label htmlFor="certificationType" className={labelClass}>
                  Type of Certification <span className="text-red-500">*</span>
                </label>

                <select
                  id="certificationType"
                  name="certificationType"
                  value={formData.certificationType}
                  onChange={handleChange}
                  disabled={loading}
                  aria-invalid={Boolean(errors.certificationType)}
                  aria-describedby={
                    errors.certificationType
                      ? "certificationType-error"
                      : undefined
                  }
                  className={`${inputBaseClass} ${
                    errors.certificationType
                      ? "border-red-400 focus:ring-red-200"
                      : "border-gray-300 focus:border-blue-500 focus:ring-blue-200"
                  }`}
                >
                  <option value="">Select certification type</option>
                  <option value="type-approval">Type Approval</option>
                  <option value="conformity-of-production">
                    Conformity of Production
                  </option>
                  <option value="individual-approval">
                    Individual Approval
                  </option>
                  <option value="other">Other</option>
                </select>

                {errors.certificationType && (
                  <p id="certificationType-error" className={errorClass}>
                    {errors.certificationType}
                  </p>
                )}
              </div>

              {/* Unloaded weight */}
              <div className="min-w-0">
                <label
                  htmlFor="unloadedWeightWithoutBattery"
                  className={labelClass}
                >
                  Unloaded Weight (w/o Battery){" "}
                  <span className="text-red-500">*</span>
                </label>

                <input
                  id="unloadedWeightWithoutBattery"
                  name="unloadedWeightWithoutBattery"
                  type="number"
                  min="0"
                  step="any"
                  value={formData.unloadedWeightWithoutBattery}
                  onChange={handleChange}
                  placeholder="Enter unloaded weight"
                  disabled={loading}
                  aria-invalid={Boolean(errors.unloadedWeightWithoutBattery)}
                  aria-describedby={
                    errors.unloadedWeightWithoutBattery
                      ? "weight-error"
                      : undefined
                  }
                  className={`${inputBaseClass} ${
                    errors.unloadedWeightWithoutBattery
                      ? "border-red-400 focus:ring-red-200"
                      : "border-gray-300 focus:border-blue-500 focus:ring-blue-200"
                  }`}
                />

                {errors.unloadedWeightWithoutBattery && (
                  <p id="weight-error" className={errorClass}>
                    {errors.unloadedWeightWithoutBattery}
                  </p>
                )}
              </div>

              {/* Category */}
              <div className="min-w-0">
                <label htmlFor="category" className={labelClass}>
                  Category <span className="text-red-500">*</span>
                </label>

                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  disabled={loading}
                  aria-invalid={Boolean(errors.category)}
                  aria-describedby={
                    errors.category ? "category-error" : undefined
                  }
                  className={`${inputBaseClass} ${
                    errors.category
                      ? "border-red-400 focus:ring-red-200"
                      : "border-gray-300 focus:border-blue-500 focus:ring-blue-200"
                  }`}
                >
                  <option value="">Select category</option>
                  <option value="M1">M1</option>
                  <option value="M2">M2</option>
                  <option value="M3">M3</option>
                  <option value="N1">N1</option>
                  <option value="N2">N2</option>
                  <option value="N3">N3</option>
                  <option value="L1">L1</option>
                  <option value="L2">L2</option>
                  <option value="L3">L3</option>
                  <option value="L4">L4</option>
                  <option value="L5">L5</option>
                  <option value="Other">Other</option>
                </select>

                {errors.category && (
                  <p id="category-error" className={errorClass}>
                    {errors.category}
                  </p>
                )}
              </div>

              {/* Preferred testing agency */}
              <div className="min-w-0 md:col-span-2">
                <label htmlFor="preferredTestingAgency" className={labelClass}>
                  Preferred Testing Agency{" "}
                  <span className="text-red-500">*</span>
                </label>

                <input
                  id="preferredTestingAgency"
                  name="preferredTestingAgency"
                  type="text"
                  autoComplete="organization"
                  value={formData.preferredTestingAgency}
                  onChange={handleChange}
                  placeholder="Enter preferred testing agency"
                  disabled={loading}
                  aria-invalid={Boolean(errors.preferredTestingAgency)}
                  aria-describedby={
                    errors.preferredTestingAgency ? "agency-error" : undefined
                  }
                  className={`${inputBaseClass} ${
                    errors.preferredTestingAgency
                      ? "border-red-400 focus:ring-red-200"
                      : "border-gray-300 focus:border-blue-500 focus:ring-blue-200"
                  }`}
                />

                {errors.preferredTestingAgency && (
                  <p id="agency-error" className={errorClass}>
                    {errors.preferredTestingAgency}
                  </p>
                )}
              </div>
            </div>

            {/* Footer buttons */}
            <div className="flex flex-col-reverse gap-3 border-t border-gray-200 pt-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="h-11 w-full rounded-lg border border-gray-300 bg-white px-5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:min-w-28"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:min-w-40"
              >
                {loading && (
                  <svg
                    className="h-4 w-4 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                )}

                {loading ? "Creating Request..." : "Create Request"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewRequest;