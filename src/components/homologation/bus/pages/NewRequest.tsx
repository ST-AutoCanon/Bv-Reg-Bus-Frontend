
import { FormEvent, useState } from "react";
import ApproveSuccess from "../../../Auth/approveSuccess";

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

// Get authentication token from Redux Persist
const getStoredToken = (): string | null => {
  try {
    const persistedRoot = localStorage.getItem("persist:root");

    if (!persistedRoot) {
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

// API error helper
const getErrorMessage = (
  data: ApiResponse,
  fallback: string
): string => {
  return data.message || data.error || fallback;
};

// Extract created submission ID
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

    if (
      nested.submission &&
      typeof nested.submission === "object"
    ) {
      const submission = nested.submission as Record<string, unknown>;

      if (
        typeof submission._id === "string" &&
        submission._id.trim()
      ) {
        return submission._id;
      }

      if (
        typeof submission.id === "string" &&
        submission.id.trim()
      ) {
        return submission.id;
      }
    }
  }

  if (
    data.submission &&
    typeof data.submission === "object"
  ) {
    const submission = data.submission as Record<string, unknown>;

    if (
      typeof submission._id === "string" &&
      submission._id.trim()
    ) {
      return submission._id;
    }

    if (
      typeof submission.id === "string" &&
      submission.id.trim()
    ) {
      return submission.id;
    }
  }

  return null;
};

// Common input styling
const inputBaseClass =
  "h-[44px] w-full min-w-0 rounded-[7px] bg-white px-4 text-[15px] text-[#243247] placeholder:text-[#999999] outline-none transition duration-200 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500";

const labelClass =
  "mb-[10px] block text-[15px] font-medium text-[#172b46]";

const errorClass =
  "mt-1.5 text-xs font-medium text-red-600";

// Input border styling
const getInputStyle = (
  field: string,
  errors: Record<string, string>
): React.CSSProperties => ({
  width: "100%",
  height: "44px",
  border: errors[field]
    ? "1px solid #ef4444"
    : "1px solid #d6d6d6",
  borderRadius: "7px",
  backgroundColor: "#ffffff",
  padding: "0 16px",
  boxSizing: "border-box",
});

const NewRequest = ({
  onClose,
  onCreated,
}: NewRequestProps) => {
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
  const [showSuccess, setShowSuccess] = useState(false);
  const [createdRequestId, setCreatedRequestId] = useState("");

  // Handle field changes
  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
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
      newErrors.certificationType =
        "Type of Certification is required";
    }

    if (!formData.unloadedWeightWithoutBattery.trim()) {
      newErrors.unloadedWeightWithoutBattery =
        "Unloaded Weight (w/o Battery) is required";
    } else if (
      !Number.isFinite(
        Number(formData.unloadedWeightWithoutBattery)
      ) ||
      Number(formData.unloadedWeightWithoutBattery) < 0
    ) {
      newErrors.unloadedWeightWithoutBattery =
        "Enter a valid unloaded weight";
    }

    if (!formData.category.trim()) {
      newErrors.category = "Category is required";
    }

    if (!formData.preferredTestingAgency.trim()) {
      newErrors.preferredTestingAgency =
        "Preferred Testing Agency is required";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // Map backend validation errors
  const applyServerValidationErrors = (
    serverErrors?: Record<string, string | string[]>
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

  // Create request API
  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setServerError("");

    if (!validateForm()) {
      return;
    }

    const token = getStoredToken();

    if (!token) {
      setServerError(
        "Authentication required. Please sign in again."
      );
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/bus/submissions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
          body: JSON.stringify({
            requestInfo: formData,
          }),
        }
      );

      const responseText = await response.text();

      let data: ApiResponse = {};

      try {
        data = responseText
          ? (JSON.parse(responseText) as ApiResponse)
          : {};
      } catch {
        throw new Error(
          `The server returned an invalid response (HTTP ${response.status}).`
        );
      }

      if (!response.ok) {
        applyServerValidationErrors(data.errors);

        if (
          response.status === 401 ||
          response.status === 403
        ) {
          setServerError(
            getErrorMessage(
              data,
              "Your session may have expired. Please sign in again."
            )
          );
          return;
        }

        setServerError(
          getErrorMessage(
            data,
            `Failed to create request (HTTP ${response.status}).`
          )
        );
        return;
      }

      const submissionId = getSubmissionId(data);

      if (!submissionId) {
        console.error("Create request response:", data);

        setServerError(
          "The server responded successfully, but no request ID was returned. Please check your requests before retrying."
        );
        return;
      }

      setCreatedRequestId(submissionId);
      setShowSuccess(true);

    } catch (error) {
      console.error("Create request error:", error);

      setServerError(
        error instanceof Error
          ? error.message
          : "Something went wrong while creating the request."
      );

    } finally {
      setLoading(false);
    }
  };

  // Common field class
  const getInputClass = () => inputBaseClass;

  // Render validation error
  const renderError = (field: string) =>
    errors[field] ? (
      <p className={errorClass}>{errors[field]}</p>
    ) : null;

  return (
    <>
      {/* Modal overlay */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-3 py-4 sm:px-5"
        onMouseDown={(event) => {
          if (
            event.target === event.currentTarget &&
            !loading
          ) {
            onClose();
          }
        }}
      >
        {/* Modal */}
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="new-request-title"
          className="flex max-h-[90dvh] w-full max-w-[1236px] flex-col overflow-hidden rounded-[3px] bg-white shadow-2xl"
        >
          {/* Header */}
          <div className="relative flex min-h-[64px] shrink-0 items-center justify-center bg-[#00677c] px-12 py-4">
            <h2
              id="new-request-title"
              className="text-center text-[20px] font-semibold tracking-[0.1px] text-white"
            >
              Homologation Registration Request
            </h2>

            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              aria-label="Close new request form"
              className="absolute right-4 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-[28px] font-light leading-none text-white transition hover:bg-white/15 disabled:opacity-50"
            >
              &times;
            </button>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            noValidate
            className="min-h-0 flex-1 overflow-y-auto bg-[#f1f1f1]"
          >
            <div className="px-6 pb-7 pt-9 sm:px-10 sm:pb-9 sm:pt-12 lg:px-[55px] lg:pb-10 lg:pt-[68px]">

              {/* Server error */}
              {serverError && (
                <div
                  role="alert"
                  className="mb-7 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                  <p className="font-semibold">
                    Unable to create request
                  </p>

                  <p className="mt-1 break-words">
                    {serverError}
                  </p>
                </div>
              )}

              {/* Three-column form */}
              <div className="grid grid-cols-1 gap-x-[48px] gap-y-[42px] sm:grid-cols-2 lg:grid-cols-3">

                {/* Vehicle Type */}
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
                    className={getInputClass()}
                    style={getInputStyle("vehicleType", errors)}
                  />

                  {renderError("vehicleType")}
                </div>

                {/* Fuel Type */}
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
                    className={getInputClass()}
                    style={getInputStyle("fuelType", errors)}
                  >
                    <option value="">Select Fuel Type</option>
                    <option value="petrol">Petrol</option>
                    <option value="diesel">Diesel</option>
                    <option value="cng">CNG</option>
                    <option value="lpg">LPG</option>
                    <option value="electric">Electric</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="hydrogen">Hydrogen</option>
                    <option value="other">Other</option>
                  </select>

                  {renderError("fuelType")}
                </div>

                {/* Certification Type */}
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
                    className={getInputClass()}
                    style={getInputStyle("certificationType", errors)}
                  >
                    <option value="">Select Type of Certification</option>
                    <option value="type-approval">Type Approval</option>
                    <option value="conformity-of-production">
                      Conformity of Production
                    </option>
                    <option value="individual-approval">
                      Individual Approval
                    </option>
                    <option value="other">Other</option>
                  </select>

                  {renderError("certificationType")}
                </div>

                {/* Unloaded Weight */}
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
                    placeholder="Battery weight"
                    disabled={loading}
                    aria-invalid={Boolean(errors.unloadedWeightWithoutBattery)}
                    className={getInputClass()}
                    style={getInputStyle(
                      "unloadedWeightWithoutBattery",
                      errors
                    )}
                  />

                  {renderError("unloadedWeightWithoutBattery")}
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
                    className={getInputClass()}
                    style={getInputStyle("category", errors)}
                  >
                    <option value="">Select Category</option>
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

                  {renderError("category")}
                </div>

                {/* Preferred Testing Agency */}
                <div className="min-w-0">
                  <label
                    htmlFor="preferredTestingAgency"
                    className={labelClass}
                  >
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
                    placeholder="Preferred Testing Agency"
                    disabled={loading}
                    aria-invalid={Boolean(errors.preferredTestingAgency)}
                    className={getInputClass()}
                    style={getInputStyle("preferredTestingAgency", errors)}
                  />

                  {renderError("preferredTestingAgency")}
                </div>

              </div>

              {/* Footer buttons */}
              <div className="mt-[58px] flex flex-col-reverse items-center justify-end gap-4 pt-7 sm:flex-row">

                {/* Cancel */}
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="inline-flex h-[52px] w-full min-w-[108px] items-center justify-center rounded-[7px] bg-white  px-7 text-[16px] font-semibold text-black shadow-sm transition duration-200 hover:bg-[#f8fbf4] focus:outline-none focus:ring-2 focus:ring-[#80bd32] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                >
                  Cancel
                </button>

                {/* Next */}
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex h-[52px] w-full min-w-[108px] items-center justify-center gap-2 rounded-[7px] bg-[#80bd32] px-7 text-[16px] font-semibold text-white shadow-sm transition duration-200 hover:bg-[#70a92a] focus:outline-none focus:ring-2 focus:ring-[#80bd32] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
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

                  {loading ? "Creating..." : "Next"}
                </button>

              </div>
            </div>
          </form>

          {/* Success popup */}
          <ApproveSuccess
            approved={showSuccess}
            successMsg="Homologation request created successfully."
            onClose={async () => {
              setShowSuccess(false);
              onCreated(createdRequestId);
            }}
          />

        </div>
      </div>
    </>
  );
};

export default NewRequest;
