
import { useCallback, useEffect, useState, useRef } from "react";

import Sidebar from "../components/Sidebar";
import MainCategories from "../components/MainCategories";
import SubCategories from "../components/Subcategories";
import FormFields from "../components/FormFields";
import FormActions from "../components/FormAction";
import Busimage from "../../../../assets/images/Busimage1.png";

import {
  type FormValues,
  type VisibilityRule,
} from "../utils/visibility";

type FormFieldValue = string | number | boolean;
type SubCategoryValues = Record<string, FormFieldValue>;
type SubmissionFormValues = Record<string, SubCategoryValues>;

interface User {
  _id?: string;
  id?: string;
  name?: string;
  email?: string;
  username?: string;
}

interface ApiResponse<T> {
  success?: boolean;
  count?: number;
  message?: string;
  error?: string;
  errors?: unknown;
  data?: T;
  submissions?: T;
  user?: User;
}

type Category = {
  id: string;
  name: string;
  code: string;
  displayOrder: number;
  isActive: boolean;
  visibility?: VisibilityRule | VisibilityRule[];
};

type SubCategory = {
  id: string;
  categoryId: string;
  name: string;
  code: string;
  displayOrder: number;
  isActive: boolean;
  visibility?: VisibilityRule | VisibilityRule[];
};

type FieldOption = {
  label: string;
  value: string;
  displayOrder: number;
};

type Field = {
  id: string;
  subCategoryId: string;
  name: string;
  label: string;
  type:
  | "text"
  | "number"
  | "date"
  | "dropdown"
  | "radio"
  | "checkbox"
  | "textarea";
  placeholder: string;
  isRequired: boolean;
  displayOrder: number;
  options: FieldOption[];
  validation: Record<string, unknown>;
  isActive: boolean;
  visibility?: VisibilityRule | VisibilityRule[];
};

type RequestInfo = {
  vehicleType: string;
  fuelType: string;
  certificationType: string;
  unloadedWeightWithoutBattery: string;
  category: string;
  preferredTestingAgency: string;
};

type Submission = {
  _id: string;
  requestInfo: RequestInfo;
  values: SubmissionFormValues;
  status?: "draft" | "completed";
  createdAt: string;
  updatedAt: string;
};

type DetailsProps = {
  submissionId: string;
  onClose: () => void;
  onSaved: () => void;
};

/*
|--------------------------------------------------------------------------
| API CONFIGURATION
|--------------------------------------------------------------------------
*/

const API_URL = (
  process.env.REACT_APP_BASE_URL ||
  "http://localhost:3000/api"
).replace(/\/+$/, "");

/*
|--------------------------------------------------------------------------
| TOKEN RETRIEVAL
|--------------------------------------------------------------------------
| Uses the same token lookup strategy as the Dashboard.
|--------------------------------------------------------------------------
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
  } catch (err) {
    console.error(
      "[Details] Failed to read stored token:",
      err,
    );
  }

  return localStorage.getItem("token")?.trim() || null;
};

/*
|--------------------------------------------------------------------------
| API RESPONSE HELPERS
|--------------------------------------------------------------------------
*/

const getErrorMessage = (
  data: ApiResponse<unknown>,
  fallback: string,
): string => {
  return data.message || data.error || fallback;
};

const readApiResponse = async <T,>(
  response: Response,
  fallback: string,
): Promise<ApiResponse<T>> => {
  const responseText = await response.text();

  let data: ApiResponse<T> = {};

  if (responseText.trim()) {
    try {
      data = JSON.parse(responseText) as ApiResponse<T>;
    } catch {
      throw new Error(
        `Invalid JSON response (HTTP ${response.status}).`,
      );
    }
  } else if (response.ok) {
    throw new Error(
      "Empty response body from API.",
    );
  }

  if (!response.ok) {
    throw new Error(
      getErrorMessage(
        data,
        response.status === 401 || response.status === 403
          ? "Authentication failed. Please sign in again."
          : `${fallback} (HTTP ${response.status}).`,
      ),
    );
  }

  return data;
};

/*
|--------------------------------------------------------------------------
| COMPONENT
|--------------------------------------------------------------------------
*/

const Details = ({
  submissionId,
  onClose,
  onSaved,
}: DetailsProps) => {
  const [token] = useState<string | null>(
    () => getStoredToken(),
  );
  const mainContentRef = useRef<HTMLElement | null>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [fields, setFields] = useState<Field[]>([]);

  /*
   * All form values are preserved by subcategory ID.
   *
   * {
   *   subCategoryId: {
   *     fieldName: value
   *   }
   * }
   */
  const [formValues, setFormValues] =
    useState<SubmissionFormValues>({});

  const [selectedCategory, setSelectedCategory] = useState(0);
  const [selectedSubCategory, setSelectedSubCategory] = useState(0);

  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingSubCategories, setLoadingSubCategories] =
    useState(false);
  const [loadingFields, setLoadingFields] = useState(false);
  const [loadingSubmission, setLoadingSubmission] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [submission, setSubmission] =
    useState<Submission | null>(null);

  const currentCategory = categories[selectedCategory];
  const currentSubCategory = subCategories[selectedSubCategory];


  console.log("[Details DEBUG]", {
    loadingCategories,
    loadingSubCategories,
    loadingFields,
    selectedCategory,
    selectedSubCategory,
    currentCategoryName: currentCategory?.name,
    currentSubCategoryId: currentSubCategory?.id,
    currentSubCategoryName: currentSubCategory?.name,
    fieldsCount: fields.length,
    fieldNames: fields.map((field) => field.name),
    fieldTypes: fields.map((field) => field.type),
  });

  /*
  |--------------------------------------------------------------------------
  | LOAD EXISTING SUBMISSION
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    let cancelled = false;

    const loadSubmission = async () => {
      if (!submissionId) {
        setSubmission(null);
        setError("Request ID is missing.");
        setLoadingSubmission(false);
        return;
      }

      if (!token) {
        setSubmission(null);
        setError(
          "No stored token was found. Please sign in again.",
        );
        setLoadingSubmission(false);
        return;
      }

      try {
        setLoadingSubmission(true);
        setError("");

        const response = await fetch(
          `${API_URL}/bus/submissions/${encodeURIComponent(
            submissionId,
          )}`,
          {
            method: "GET",
            cache: "no-store",
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
              "Cache-Control": "no-cache",
              Pragma: "no-cache",
            },
          },
        );

        const result = await readApiResponse<Submission>(
          response,
          "Failed to load request",
        );

        const loadedSubmission = result.data;

        if (!loadedSubmission || typeof loadedSubmission !== "object") {
          throw new Error(
            "Response does not contain a valid submission.",
          );
        }

        if (cancelled) return;

        setSubmission(loadedSubmission);

        /*
         * Restore the complete saved form.
         * Do not replace saved values with empty values.
         */
        setFormValues(
          loadedSubmission.values &&
            typeof loadedSubmission.values === "object"
            ? loadedSubmission.values
            : {},
        );
      } catch (err) {
        if (cancelled) return;

        console.error(
          "[Details] Load submission error:",
          err,
        );

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load request.",
        );
      } finally {
        if (!cancelled) {
          setLoadingSubmission(false);
        }
      }
    };

    void loadSubmission();

    return () => {
      cancelled = true;
    };
  }, [submissionId, token]);

  /*
  |--------------------------------------------------------------------------
  | LOAD CATEGORIES
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    let cancelled = false;

    const loadCategories = async () => {
      try {
        setLoadingCategories(true);
        setError("");

        const response = await fetch(
          `${API_URL}/bus/categories`,
          {
            method: "GET",
            cache: "no-store",
            headers: {
              ...(token
                ? { Authorization: `Bearer ${token}` }
                : {}),
              Accept: "application/json",
              "Cache-Control": "no-cache",
              Pragma: "no-cache",
            },
          },
        );

        const result = await readApiResponse<Category[]>(
          response,
          "Failed to fetch categories",
        );

        const fetchedCategories = Array.isArray(result.data)
          ? result.data
          : [];

        if (cancelled) return;

        setCategories(fetchedCategories);
      } catch (err) {
        if (cancelled) return;

        console.error(
          "[Details] Load categories error:",
          err,
        );

        setError(
          err instanceof Error
            ? err.message
            : "Failed to fetch categories.",
        );

        setCategories([]);
      } finally {
        if (!cancelled) {
          setLoadingCategories(false);
        }
      }
    };

    void loadCategories();

    return () => {
      cancelled = true;
    };
  }, [token]);

  /*
  |--------------------------------------------------------------------------
  | INITIAL CATEGORY SELECTION
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (categories.length === 0) {
      setSelectedCategory(0);
      setSelectedSubCategory(0);
      setSubCategories([]);
      setFields([]);
      return;
    }

    setSelectedCategory(0);
    setSelectedSubCategory(0);
  }, [categories]);

  /*
  |--------------------------------------------------------------------------
  | LOAD SUBCATEGORIES
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    let cancelled = false;

    if (!currentCategory) {
      setSubCategories([]);
      setFields([]);
      setLoadingSubCategories(false);
      return;
    }

    const loadSubCategories = async () => {
      try {
        setLoadingSubCategories(true);
        setError("");
        setSubCategories([]);
        setFields([]);

        const response = await fetch(
          `${API_URL}/bus/subcategories/category/${encodeURIComponent(
            currentCategory.id,
          )}`,
          {
            method: "GET",
            cache: "no-store",
            headers: {
              ...(token
                ? { Authorization: `Bearer ${token}` }
                : {}),
              Accept: "application/json",
              "Cache-Control": "no-cache",
              Pragma: "no-cache",
            },
          },
        );

        const result = await readApiResponse<SubCategory[]>(
          response,
          "Failed to fetch subcategories",
        );

        const fetchedSubCategories = Array.isArray(result.data)
          ? result.data
          : [];

        if (cancelled) return;

        setSubCategories(fetchedSubCategories);
        setSelectedSubCategory(0);
      } catch (err) {
        if (cancelled) return;

        console.error(
          "[Details] Load subcategories error:",
          err,
        );

        setError(
          err instanceof Error
            ? err.message
            : "Failed to fetch subcategories.",
        );

        setSubCategories([]);
        setFields([]);
      } finally {
        if (!cancelled) {
          setLoadingSubCategories(false);
        }
      }
    };

    void loadSubCategories();

    return () => {
      cancelled = true;
    };
  }, [currentCategory?.id, token]);

  /*
  |--------------------------------------------------------------------------
  | LOAD FIELDS
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    let cancelled = false;

    if (!currentSubCategory) {
      setFields([]);
      setLoadingFields(false);
      return;
    }

    const loadFields = async () => {
      try {
        setLoadingFields(true);
        setError("");
        setFields([]);

        const response = await fetch(
          `${API_URL}/bus/fields/subcategory/${encodeURIComponent(
            currentSubCategory.id,
          )}`,
          {
            method: "GET",
            cache: "no-store",
            headers: {
              ...(token
                ? { Authorization: `Bearer ${token}` }
                : {}),
              Accept: "application/json",
              "Cache-Control": "no-cache",
              Pragma: "no-cache",
            },
          },
        );

        const result = await readApiResponse<Field[]>(
          response,
          "Failed to fetch fields",
        );

        const fetchedFields = Array.isArray(result.data)
          ? result.data
          : [];


        if (cancelled) return;

        console.log(
          "[FIELDS API DEBUG] Subcategory ID:",
          currentSubCategory.id,
        );
        console.log("[FIELDS API DEBUG] Response:", response);
        console.log("[FIELDS API DEBUG] Parsed fields:", fetchedFields);
        console.log("[FIELDS API DEBUG] Field count:", fetchedFields.length);
        setFields(fetchedFields);

        /*
         * Initialize missing values only.
         * Previously saved values are never overwritten.
         */
        setFormValues((previous) => {
          const existingValues =
            previous[currentSubCategory.id] || {};

          const updatedValues: SubCategoryValues = {
            ...existingValues,
          };

          fetchedFields.forEach((field) => {
            if (
              !Object.prototype.hasOwnProperty.call(
                updatedValues,
                field.name,
              )
            ) {
              updatedValues[field.name] =
                field.type === "checkbox" ? false : "";
            }
          });

          return {
            ...previous,
            [currentSubCategory.id]: updatedValues,
          };
        });
      } catch (err) {
        if (cancelled) return;

        console.error(
          "[Details] Load fields error:",
          err,
        );

        setError(
          err instanceof Error
            ? err.message
            : "Failed to fetch fields.",
        );

        setFields([]);
      } finally {
        if (!cancelled) {
          setLoadingFields(false);
        }
      }
    };

    void loadFields();

    return () => {
      cancelled = true;
    };
  }, [currentSubCategory?.id, token]);

  /*
  |--------------------------------------------------------------------------
  | FIELD CHANGE
  |--------------------------------------------------------------------------
  */

  const handleFieldChange = (
    name: string,
    value: string | boolean | number,
  ) => {
    if (!currentSubCategory) return;

    const subCategoryId = currentSubCategory.id;

    setFormValues((previous) => ({
      ...previous,
      [subCategoryId]: {
        ...(previous[subCategoryId] || {}),
        [name]: value,
      },
    }));

    setError("");
  };

  /*
  |--------------------------------------------------------------------------
  | CATEGORY CHANGE
  |--------------------------------------------------------------------------
  */

  const handleCategoryChange = (index: number) => {
    if (index < 0 || index >= categories.length) return;

    setSelectedCategory(index);
    setSelectedSubCategory(0);
    setSubCategories([]);
    setFields([]);
    setError("");

    /*
     * Keep formValues unchanged.
     * Saved and unsaved values remain available when
     * switching back to a category.
     */
  };

  /*
  |--------------------------------------------------------------------------
  | SUBCATEGORY CHANGE
  |--------------------------------------------------------------------------
  */

  const handleSubCategoryChange = (index: number) => {
    if (index < 0 || index >= subCategories.length) return;

    setSelectedSubCategory(index);
    setFields([]);
    setError("");
  };

  /*
  |--------------------------------------------------------------------------
  | GET FIRST VALIDATION ERROR
  |--------------------------------------------------------------------------
  */

  const getFirstErrorMessage = (
    errors: unknown,
  ): string | null => {
    if (!errors || typeof errors !== "object") {
      return null;
    }

    if (Array.isArray(errors)) {
      const first = errors[0];

      if (typeof first === "string") {
        return first;
      }

      return getFirstErrorMessage(first);
    }

    for (const value of Object.values(
      errors as Record<string, unknown>,
    )) {
      if (typeof value === "string") {
        return value;
      }

      const nested = getFirstErrorMessage(value);

      if (nested) return nested;
    }

    return null;
  };

  /*
  |--------------------------------------------------------------------------
  | SAVE REQUEST
  |--------------------------------------------------------------------------
  */

  const handleSave = useCallback(async () => {
    if (saving) return;

    if (!token) {
      setError(
        "No stored token was found. Please sign in again.",
      );
      return;
    }

    if (!submissionId) {
      setError("Request ID is missing.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      /*
       * PATCH the complete form, not only the current
       * subcategory's values.
       */
      const completeValues = formValues;

      const response = await fetch(
        `${API_URL}/bus/submissions/${encodeURIComponent(
          submissionId,
        )}`,
        {
          method: "PATCH",
          cache: "no-store",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
            "Cache-Control": "no-cache",
          },
          body: JSON.stringify({
            values: completeValues,
          }),
        },
      );

      const result = await readApiResponse<Submission>(
        response,
        "Failed to save request",
      );

      /*
       * Update the local submission when the API returns it.
       * Some APIs return success without a data object.
       */
      if (result.data && typeof result.data === "object") {
        setSubmission(result.data);
      }

      await onSaved();
    } catch (err) {
      console.error(
        "[Details] Save request error:",
        err,
      );

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to save request.");
      }
    } finally {
      setSaving(false);
    }
  }, [formValues, onSaved, saving, submissionId, token]);

  /*
  |--------------------------------------------------------------------------
  | LOADING SCREEN
  |--------------------------------------------------------------------------
  */

  if (loadingCategories || loadingSubmission) {
    return (
      // <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="flex min-h-[60vh] items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div
            className="
              h-10 w-10 animate-spin rounded-full
              border-4 border-slate-200 
            "
          />

          <p className="text-sm font-medium text-slate-500">
            {loadingSubmission ? "Loading request..." : "Loading form..."}
          </p>
        </div>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | PAGE
  |--------------------------------------------------------------------------
  */


  return (
    <div className="flex h-screen min-h-0 w-full overflow-hidden bg-[#f8fafc]">
      {/* LEFT SIDEBAR */}
      <div className="hidden h-full w-[290px] shrink-0 overflow-y-auto lg:flex">
        <Sidebar
          categories={categories}
          selectedCategory={selectedCategory}
          values={formValues}
          onCategoryChange={handleCategoryChange}
        />
      </div>

      {/* RIGHT CONTENT */}
      <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        {/* BLUE VEHICLE INFORMATION HEADER */}
        <div className="flex min-h-[90px] shrink-0 flex-wrap items-center gap-8 bg-[#2875bd] px-8 py-5 text-white">
          <div className="h-[70px] w-[70] shrink-0 overflow-hidden rounded-full border-4 border-yellow-400 bg-white">
            <img
              src={Busimage}
              alt="Sleeper Bus"
              className="h-full w-full rounded-full object-cover"
            />
          </div>
          <div className="grid flex-1 grid-cols-2 gap-x-8 gap-y-4 md:grid-cols-4">

            <div>
              <p className="text-sm font-semibold">Vehicle Type</p>
              <p className="text-sm font-bold">
                {submission?.requestInfo?.vehicleType || "-"}
              </p>
            </div>

            <div>
              <p className="text-sm font-semibold">Category</p>
              <p className="text-sm font-bold">
                {submission?.requestInfo?.category || "-"}
              </p>
            </div>

            <div>
              <p className="text-sm font-semibold">Fuel</p>
              <p className="text-sm font-bold">
                {submission?.requestInfo?.fuelType || "-"}
              </p>
            </div>

            <div>
              <p className="text-sm font-semibold">Page</p>
              <p className="text-sm font-bold">
                {currentCategory?.name || "Manufacturer Details"}
              </p>
            </div>

          </div>
        </div>

        {/* MAIN FORM AREA */}
        

{/* MAIN FORM AREA */}
<main
  ref={mainContentRef}
  className="min-h-0 w-full flex-1 overflow-x-hidden overflow-y-auto"
>
  <div className="w-full px-5 pt-6 pb-8">

    {/* SUBCATEGORY TABS */}
    {loadingSubCategories ? (
      <div className="px-4 py-4 text-sm text-slate-500">
        Loading subcategories...
      </div>
    ) : (
      <SubCategories
        categories={subCategories}
        selectedCategory={selectedSubCategory}
        values={formValues}
        onCategoryChange={handleSubCategoryChange}
      />
    )}

    {/* FORM CARD */}
    <div className="w-full rounded-b-lg rounded-tr-lg border border-[#e5e7eb] bg-white shadow-sm">

      {/* FORM TITLE */}
      <div className="border-b border-[#e5e7eb] px-6 py-6 sm:px-8">
        <h2 className="text-xl font-semibold text-[#173b63]">
          {currentCategory?.name || "Manufacturer Details"}
          {" - "}
          {currentSubCategory?.code ||
            currentSubCategory?.name ||
            ""}
        </h2>
      </div>

      {/* DYNAMIC FIELDS */}
      {loadingFields ? (
        <div className="py-8 text-sm text-slate-500">
          Loading fields...
        </div>
      ) : fields.length > 0 ? (
        <div className="min-w-0">
          <FormFields
            fields={fields}
            values={
              (formValues[currentSubCategory?.id || ""] ||
                {}) as FormValues
            }
            onChange={handleFieldChange}
          />
        </div>
      ) : (
        <div className="py-8 text-sm text-slate-500">
          No fields available.
        </div>
      )}

      {/* ERROR MESSAGE */}
      {error && (
        <div
          role="alert"
          className="mt-6 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
        >
          <p className="font-semibold">
            Unable to complete request
          </p>
          <p className="mt-1">{error}</p>
        </div>
      )}

      {/* FORM ACTIONS */}
      <div className="mt-10 pt-6">
        <FormActions
          onCancel={onClose}
          onSave={() => void handleSave()}
          saving={saving}
        />
      </div>

    </div>
  </div>
</main>



        {/* MOBILE ACTIONS */}
        <div className="sticky bottom-0 bg-white p-4 sm:hidden">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={() => void handleSave()}
              disabled={saving}
              className="flex-1 rounded-lg bg-[#2875bd] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
            >
              {saving ? "Saving..." : "Submit"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}


export default Details;

