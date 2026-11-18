
import {
  isVisible,
  type FormValues,
  type VisibilityRule,
} from "../utils/visibility";

import { useState, Fragment } from "react";
import infoIcon from "../../../../assets/images/infoicon.png";

type FieldOption = {
  label: string;
  value: string;
  displayOrder: number;
};

type Field = {
  id: string;
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
  placeholder?: string;
  infoImages?: string[];
  isRequired: boolean;
  options?: FieldOption[];
  clauseNumber?: string;
  tables?: string[];
  helpText?: string;
  validation?: {
    unit?: string;
    [key: string]: unknown;
  };
  visibility?: VisibilityRule | VisibilityRule[];
};

type Variant = {
  id: string;
  label: string;
};

type FormFieldsProps = {
  fields: Field[];

  // These variants come directly from the backend variantconfig.json
  variantconfig: Variant[];
  wdVariants: Variant[];

  values: FormValues;
  onChange: (name: string, value: string | boolean | number) => void;
};
const getInfoImageUrl = (imagePath: string): string => {
  return `${process.env.PUBLIC_URL}/${imagePath.replace(/^\/+/, "")}`;
};

const FormFields = ({
  fields,
  values,
  variantconfig,
  wdVariants,
  onChange,
}: FormFieldsProps) => {
  const visibleFields = fields.filter((field) =>
    isVisible(field.visibility, values),
  );

  // Use ONLY variants received from backend.
  // No frontend hardcoded variant defaults.
  const technologyVariants = Array.isArray(variantconfig)
    ? variantconfig
    : [];

  const weighmentVariants = Array.isArray(wdVariants)
    ? wdVariants
    : [];

  const technologyFieldNames = [
    "regenerativeBraking",
    "startStopSystem",
    "tyrePressureMonitoringSystem",
    "sixOrMoreSpeedTransmission",
    "anyOtherTechnology",
  ];

  const technologyFields = visibleFields.filter((field) =>
    technologyFieldNames.includes(field.name),
  );

  const weighmentFieldNames = [
    "weights",
    "vehicleKerbWeight",
    "frontAxle1Weight",
    "frontAxle2Weight",
    "rearAxleWeight",
  ];

  const weighmentFields = visibleFields.filter((field) =>
    weighmentFieldNames.includes(field.name),
  );

  const normalFields = visibleFields.filter(
    (field) =>
      !technologyFieldNames.includes(field.name) &&
      !weighmentFieldNames.includes(field.name),
  );

  const [selectedImages, setSelectedImages] =
    useState<string[] | null>(null);

  console.log("[FORMFIELDS BACKEND VARIANT CONFIG]", {
    vehicleVariants: technologyVariants,
    vehicleVariantCount: technologyVariants.length,
    wdVariants: weighmentVariants,
    wdVariantCount: weighmentVariants.length,
  });

  console.log("[FORMFIELDS VISIBILITY CHECK]", {
    receivedCount: fields.length,
    visibleCount: visibleFields.length,
    receivedNames: fields.map((field) => field.name),
    visibleNames: visibleFields.map((field) => field.name),
    values,
  });

  const inputClass =
    "block w-full min-w-0 rounded-lg border border-gray-300 bg-white px-3 py-3 text-sm leading-5 text-gray-800 placeholder:text-gray-400 placeholder:opacity-100 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

  // Normal field rendering
  const renderField = (field: Field) => {
    const value = values[field.name] ?? "";

    if (field.type === "textarea") {
      return (
        <textarea
          value={String(value)}
          placeholder={field.placeholder}
          required={field.isRequired}
          onChange={(event) =>
            onChange(field.name, event.target.value)
          }
          className={`${inputClass} min-h-28 resize-y`}
        />
      );
    }

    if (field.type === "dropdown") {
      return (
        <select
          value={String(value)}
          required={field.isRequired}
          onChange={(event) =>
            onChange(field.name, event.target.value)
          }
          className={`${inputClass} h-11`}
        >
          <option value="">
            {field.placeholder || "Select an option"}
          </option>

          {[...(field.options ?? [])]
            .sort((a, b) => a.displayOrder - b.displayOrder)
            .map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
        </select>
      );
    }

    if (field.type === "radio") {
      return (
        <div className="flex min-h-11 flex-wrap items-center gap-x-5 gap-y-3">
          {[...(field.options ?? [])]
            .sort((a, b) => a.displayOrder - b.displayOrder)
            .map((option) => (
              <label
                key={option.value}
                className="flex cursor-pointer items-center gap-2 text-sm text-gray-700"
              >
                <input
                  type="radio"
                  name={field.name}
                  value={option.value}
                  checked={value === option.value}
                  required={field.isRequired}
                  onChange={(event) =>
                    onChange(field.name, event.target.value)
                  }
                  className="h-4 w-4 accent-blue-600"
                />
                <span>{option.label}</span>
              </label>
            ))}
        </div>
      );
    }

    if (field.type === "checkbox") {
      return (
        <label className="flex min-h-11 cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={Boolean(value)}
            onChange={(event) =>
              onChange(field.name, event.target.checked)
            }
            className="h-4 w-4 rounded accent-blue-600"
          />
          <span className="text-sm text-gray-700">
            {field.placeholder || field.label}
          </span>
        </label>
      );
    }

    return (
      <input
        type={field.type}
        value={String(value)}
        placeholder={field.placeholder}
        required={field.isRequired}
        onChange={(event) => {
          const inputValue = event.target.value;

          if (field.type === "number") {
            onChange(
              field.name,
              inputValue === "" ? "" : Number(inputValue),
            );
            return;
          }

          onChange(field.name, inputValue);
        }}
        className={`${inputClass} h-11`}
      />
    );
  };

  // Technology table - uses backend vehicleVariants
  const renderTechnologyTable = () => {
    if (technologyFields.length === 0) return null;

    if (technologyVariants.length === 0) {
      return (
        <div className="p-4 text-sm text-red-500">
          Vehicle variant configuration not received from backend.
        </div>
      );
    }

    return (
      <div className="w-full overflow-x-auto p-4 sm:p-6">
        <table className="w-full min-w-[1500px] table-fixed border-collapse border border-gray-300">
          <colgroup>
            <col style={{ width: "40%" }} />

            {technologyVariants.map((variant) => (
              <col
                key={variant.id}
                style={{
                  width: `${60 / technologyVariants.length}%`,
                }}
              />
            ))}
          </colgroup>

          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold">
                
              </th>

              {technologyVariants.map((variant) => (
                <th
                  key={variant.id}
                  className="border border-gray-300 px-4 py-3 text-center text-sm font-semibold"
                >
                  {variant.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {technologyFields.map((field) => (
              <tr key={field.id}>
                <td className="border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700">
                  {field.label}

                  {field.isRequired && (
                    <span className="ml-1 text-red-500">*</span>
                  )}
                </td>

                {technologyVariants.map((variant) => {
                  const fieldName = `${field.name}_${variant.id}`;
                  const variantValue = values[fieldName] ?? "";

                  return (
                    <td
                      key={variant.id}
                      className="border border-gray-300 px-3 py-3"
                    >
                      {field.type === "textarea" ? (
                        <textarea
                          value={String(variantValue)}
                          placeholder={field.placeholder}
                          required={field.isRequired}
                          onChange={(event) =>
                            onChange(fieldName, event.target.value)
                          }
                          className={`${inputClass} min-h-20`}
                        />
                      ) : field.type === "dropdown" ? (
                        <select
                          value={String(variantValue)}
                          required={field.isRequired}
                          onChange={(event) =>
                            onChange(fieldName, event.target.value)
                          }
                          className={`${inputClass} h-11`}
                        >
                          <option value="">
                            {field.placeholder || "Select"}
                          </option>

                          {[...(field.options ?? [])]
                            .sort(
                              (a, b) =>
                                a.displayOrder - b.displayOrder,
                            )
                            .map((option) => (
                              <option
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </option>
                            ))}
                        </select>
                      ) : (
                        <input
                          type={field.type}
                          value={String(variantValue)}
                          placeholder={field.placeholder}
                          required={field.isRequired}
                          onChange={(event) => {
                            const inputValue = event.target.value;

                            onChange(
                              fieldName,
                              field.type === "number"
                                ? inputValue === ""
                                  ? ""
                                  : Number(inputValue)
                                : inputValue,
                            );
                          }}
                          className={`${inputClass} h-11`}
                        />
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Weighment table - uses backend wdVariants
  const renderWeighmentTable = () => {
    if (weighmentFields.length === 0) return null;

    if (weighmentVariants.length === 0) {
      return (
        <div className="p-4 text-sm text-red-500">
          Weighment variant configuration not received from backend.
        </div>
      );
    }

    return (
      <div className="w-full overflow-x-auto p-4 sm:p-6">
        <table className="w-full min-w-[1500px] table-fixed border-collapse border border-gray-300">
          <colgroup>
            <col style={{ width: "40%" }} />

            {weighmentVariants.map((variant) => (
              <col
                key={variant.id}
                style={{
                  width: `${60 / weighmentVariants.length}%`,
                }}
              />
            ))}
          </colgroup>

          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold">
                Weights
              </th>

              {weighmentVariants.map((variant) => (
                <th
                  key={variant.id}
                  className="border border-gray-300 px-4 py-3 text-center text-sm font-semibold"
                >
                  {variant.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {weighmentFields.map((field) => (
              <tr key={field.id}>
                <td className="border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700">
                  {field.label}

                  {field.isRequired && (
                    <span className="ml-1 text-red-500">*</span>
                  )}
                </td>

                {weighmentVariants.map((variant) => {
                  const fieldName = `${field.name}_${variant.id}`;
                  const variantValue = values[fieldName] ?? "";

                  return (
                    <td
                      key={variant.id}
                      className="border border-gray-300 px-3 py-3"
                    >
                      {field.type === "textarea" ? (
                        <textarea
                          value={String(variantValue)}
                          placeholder={field.placeholder}
                          required={field.isRequired}
                          onChange={(event) =>
                            onChange(fieldName, event.target.value)
                          }
                          className={`${inputClass} min-h-20`}
                        />
                      ) : (
                        <input
                          type={field.type}
                          value={String(variantValue)}
                          placeholder={field.placeholder}
                          required={field.isRequired}
                          onChange={(event) => {
                            const inputValue = event.target.value;

                            onChange(
                              fieldName,
                              field.type === "number"
                                ? inputValue === ""
                                  ? ""
                                  : Number(inputValue)
                                : inputValue,
                            );
                          }}
                          className={`${inputClass} h-11`}
                        />
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  if (visibleFields.length === 0) {
    return (
      <div className="p-6 text-sm text-gray-500">
        No fields available for the current selection.
      </div>
    );
  }

  return (
    <>
      {/* Normal fields */}
      <div className="grid grid-cols-1 gap-x-6 gap-y-7 p-4 sm:p-6 md:grid-cols-2">
        {normalFields.map((field) => (
          <Fragment key={field.id}>
            <div
              className={
                field.type === "textarea" ? "md:col-span-2" : ""
              }
            >
              <div className="mb-2 flex items-center gap-2">
                <label className="text-sm font-medium leading-5 text-gray-700">
                  {field.label}

                  {field.isRequired && (
                    <span className="ml-1 text-red-500">*</span>
                  )}
                </label>

                {field.infoImages?.length ? (
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedImages(field.infoImages!)
                    }
                  >
                    <img
                      src={infoIcon}
                      alt="Info"
                      className="h-4 w-4"
                    />
                  </button>
                ) : field.placeholder ? (
                  <span className="group relative inline-flex items-center">
                    <img
                      src={infoIcon}
                      alt="Info"
                      tabIndex={0}
                      className="h-4 w-4 cursor-pointer"
                    />

                    <span className="invisible absolute bottom-full left-1/2 z-50 mb-2 w-max max-w-64 -translate-x-1/2 rounded-md bg-gray-800 px-3 py-2 text-xs text-white shadow-lg group-hover:visible group-focus-within:visible">
                      {field.placeholder}
                    </span>
                  </span>
                ) : null}
              </div>

              {renderField(field)}
            </div>
          </Fragment>
        ))}
      </div>

      {/* Technology Details Table */}
      {technologyFields.length > 0 && (
        <div className="w-full">
          {renderTechnologyTable()}
        </div>
      )}

      {/* Weighment Details Table */}
      {weighmentFields.length > 0 && (
        <div className="w-full">
          {renderWeighmentTable()}
        </div>
      )}

      {/* Image popup */}
      {selectedImages && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 p-4"
          onClick={() => setSelectedImages(null)}
        >
          <div
            className="relative w-full max-w-lg rounded-lg bg-white p-3 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedImages(null)}
              className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-lg text-gray-600 hover:bg-gray-200"
            >
              &times;
            </button>

            <div className="flex max-h-[65vh] flex-col items-center gap-3 overflow-y-auto p-2">
              {selectedImages.map((image, index) => (
  <img
    key={`${image}-${index}`}
    src={getInfoImageUrl(image)}
    alt={`Reference ${index + 1}`}
    onError={(e) => {
      console.error("Failed to load info image:", getInfoImageUrl(image));
      e.currentTarget.style.display = "none";
    }}
    className="max-h-[60vh] max-w-full rounded-md object-contain"
  />
))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FormFields;
