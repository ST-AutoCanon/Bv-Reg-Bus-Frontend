// type FormActionsProps = {
//   onCancel: () => void;
//   onSave: () => void;
//   saving?: boolean;
// };

// const FormActions = ({
//   onCancel,
//   onSave,
//   saving = false,
// }: FormActionsProps) => {
//   return (
//     <div className="flex items-center justify-end gap-3 border-t px-6 py-4">
//       <button
//         type="button"
//         onClick={onCancel}
//         disabled={saving}
//         className="rounded-lg border border-gray-300 px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
//       >
//         Cancel
//       </button>

//       <button
//         type="button"
//         onClick={onSave}
//         disabled={saving}
//         className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
//       >
//         {saving ? "Saving..." : "Save"}
//       </button>
//     </div>
//   );
// };

// export default FormActions;

type FormActionsProps = {
  onCancel: () => void;
  onSave: () => void;
  saving?: boolean;
};

const FormActions = ({
  onCancel,
  onSave,
  saving = false,
}: FormActionsProps) => {
  return (
    <div className="flex flex-row items-center justify-end gap-3 border-t border-gray-200 bg-white px-4 py-4 sm:px-6">
      <button
        type="button"
        onClick={onCancel}
        disabled={saving}
        className="inline-flex h-10 w-auto shrink-0 items-center justify-center rounded-lg border border-gray-300 bg-white px-5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Cancel
      </button>

      <button
        type="button"
        onClick={onSave}
        disabled={saving}
        className="inline-flex h-10 w-auto shrink-0 items-center justify-center rounded-lg bg-blue-600 px-6 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {saving ? "Saving..." : "Save"}
      </button>
    </div>
  );
};

export default FormActions;