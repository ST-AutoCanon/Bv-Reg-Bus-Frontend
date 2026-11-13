// import {
//   isVisible,
//   type FormValues,
//   type VisibilityRule,
// } from "../utils/visibility";

// type FieldOption = {
//   label: string;
//   value: string;
//   displayOrder: number;
// };

// type Field = {
//   id: string;
//   name: string;
//   label: string;
//   type:
//     | "text"
//     | "number"
//     | "date"
//     | "dropdown"
//     | "radio"
//     | "checkbox"
//     | "textarea";
//   placeholder?: string;
//   isRequired: boolean;
//   options?: FieldOption[];
//   visibility?: VisibilityRule | VisibilityRule[];
// };

// type FormFieldsProps = {
//   fields: Field[];
//   values: FormValues;
//   onChange: (name: string, value: string | boolean | number) => void;
// };

// const FormFields = ({ fields, values, onChange }: FormFieldsProps) => {
//   const visibleFields = fields.filter((field) =>
//     isVisible(field.visibility, values),
//   );

// console.log("[FORMFIELDS VISIBILITY CHECK]", {
//   receivedCount: fields.length,
//   visibleCount: visibleFields.length,
//   receivedNames: fields.map((f) => f.name),
//   visibleNames: visibleFields.map((f) => f.name),
//   values,
// });

//   const renderField = (field: Field) => {
//     const value = values[field.name] ?? "";

//     if (field.type === "textarea") {
//       return (
//         <textarea
//           value={String(value)}
//           placeholder={field.placeholder}
//           required={field.isRequired}
//           onChange={(event) => onChange(field.name, event.target.value)}
//           className="min-h-28 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
//         />
//       );
//     }

//     if (field.type === "dropdown") {
//       return (
//         <select
//           value={String(value)}
//           required={field.isRequired}
//           onChange={(event) => onChange(field.name, event.target.value)}
//           className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
//         >
//           <option value="">{field.placeholder || "Select an option"}</option>

//           {field.options
//             ?.sort((a, b) => a.displayOrder - b.displayOrder)
//             .map((option) => (
//               <option key={option.value} value={option.value}>
//                 {option.label}
//               </option>
//             ))}
//         </select>
//       );
//     }

//     if (field.type === "radio") {
//       return (
//         <div className="flex flex-wrap gap-5">
//           {field.options
//             ?.sort((a, b) => a.displayOrder - b.displayOrder)
//             .map((option) => (
//               <label
//                 key={option.value}
//                 className="flex cursor-pointer items-center gap-2 text-sm text-gray-700"
//               >
//                 <input
//                   type="radio"
//                   name={field.name}
//                   value={option.value}
//                   checked={value === option.value}
//                   required={field.isRequired}
//                   onChange={(event) => onChange(field.name, event.target.value)}
//                   className="h-4 w-4"
//                 />

//                 {option.label}
//               </label>
//             ))}
//         </div>
//       );
//     }

//     if (field.type === "checkbox") {
//       return (
//         <label className="flex cursor-pointer items-center gap-2">
//           <input
//             type="checkbox"
//             checked={Boolean(value)}
//             onChange={(event) => onChange(field.name, event.target.checked)}
//             className="h-4 w-4 rounded"
//           />

//           <span className="text-sm text-gray-700">
//             {field.placeholder || field.label}
//           </span>
//         </label>
//       );
//     }

//     return (
//       <input
//         type={field.type}
//         value={String(value)}
//         placeholder={field.placeholder}
//         required={field.isRequired}
//         onChange={(event) => {
//           const inputValue = event.target.value;

//           if (field.type === "number") {
//             onChange(field.name, inputValue === "" ? "" : Number(inputValue));

//             return;
//           }

//           onChange(field.name, inputValue);
//         }}
//         className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
//       />
//     );
//   };

//   if (visibleFields.length === 0) {
//     return (
//       <div className="p-6 text-sm text-gray-500">
//         No fields available for the current selection.
//       </div>
//     );
//   }

//   return (
//     <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2">
//       {visibleFields.map((field) => (
//         <div
//           key={field.id}
//           className={field.type === "textarea" ? "md:col-span-2" : ""}
//         >
//           <label className="mb-2 block text-sm font-medium text-gray-700">
//             {field.label}

//             {field.isRequired && <span className="ml-1 text-red-500">*</span>}
//           </label>

//           {renderField(field)}
//         </div>
//       ))}
//     </div>
//   );
// };

// export default FormFields;
/////////////



import {
  isVisible,
  type FormValues,
  type VisibilityRule,
} from "../utils/visibility";

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

type FormFieldsProps = {
  fields: Field[];
  values: FormValues;
  onChange: (name: string, value: string | boolean | number) => void;
};

const FormFields = ({ fields, values, onChange }: FormFieldsProps) => {
  const visibleFields = fields.filter((field) =>
    isVisible(field.visibility, values),
  );

  console.log("[FORMFIELDS VISIBILITY CHECK]", {
    receivedCount: fields.length,
    visibleCount: visibleFields.length,
    receivedNames: fields.map((field) => field.name),
    visibleNames: visibleFields.map((field) => field.name),
    values,
  });

  const inputClass =
    "block w-full min-w-0 rounded-lg border border-gray-300 bg-white px-3 py-3 text-sm leading-5 text-gray-800 placeholder:text-gray-400 placeholder:opacity-100 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

  const renderField = (field: Field) => {
    const value = values[field.name] ?? "";

    if (field.type === "textarea") {
      return (
        <textarea
          value={String(value)}
          placeholder={field.placeholder}
          required={field.isRequired}
          onChange={(event) => onChange(field.name, event.target.value)}
          className={`${inputClass} min-h-28 resize-y`}
        />
      );
    }

    if (field.type === "dropdown") {
      return (
        <select
          value={String(value)}
          required={field.isRequired}
          onChange={(event) => onChange(field.name, event.target.value)}
          className={`${inputClass} h-11`}
        >
          <option value="">{field.placeholder || "Select an option"}</option>

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
                  onChange={(event) => onChange(field.name, event.target.value)}
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
            onChange={(event) => onChange(field.name, event.target.checked)}
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
            onChange(field.name, inputValue === "" ? "" : Number(inputValue));
            return;
          }

          onChange(field.name, inputValue);
        }}
        className={`${inputClass} h-11`}
      />
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
    <div className="grid grid-cols-1 gap-x-6 gap-y-7 p-4 sm:p-6 md:grid-cols-2">
      {visibleFields.map((field) => (
        <div
          key={field.id}
          className={field.type === "textarea" ? "md:col-span-2" : ""}
        >
          <div className="mb-2 flex items-center gap-2">
            <label className="text-sm font-medium leading-5 text-gray-700">
              {field.label}
              {field.isRequired && (
                <span className="ml-1 text-red-500">*</span>
              )}
            </label>

            {field.placeholder && (
              <span className="group relative inline-flex items-center">
                <img
                  src={infoIcon}
                  alt="Info"
                  className="h-4 w-4 cursor-pointer object-contain"
                  tabIndex={0}
                />

                <span
                  role="tooltip"
                  className="invisible absolute bottom-full left-1/2 z-50 mb-2 w-max max-w-64 -translate-x-1/2 rounded-md bg-gray-800 px-3 py-2 text-xs text-white shadow-lg group-hover:visible group-focus-within:visible"
                >
                  {field.placeholder}
                </span>
              </span>
            )}
          </div>

          {renderField(field)}
        </div>
      ))}
    </div>
  );
};

export default FormFields;
