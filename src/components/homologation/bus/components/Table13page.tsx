import { useEffect, useState } from "react";

/* =========================================================
   TYPES
========================================================= */

type FieldType = "text" | "textarea" | "number" | "date" | "select" | "file";

type Table13Row = {
  type: "heading" | "field";
  row: number;
  clauseNo: string;
  label: string;
  fieldType: FieldType;
  required: boolean;
  options: string[];
};

type FormValues = Record<number, string>;

type HeaderValues = {
  manufacturerSheetNo: string;
  testAgency: string;
  documentNo: string;
  manufacturerName: string;
  manufacturerDesignation: string;
  date: string;
  testAgencyName: string;
  testAgencyDesignation: string;
};

type SelectedFiles = Record<number, File>;

/* =========================================================
   API
========================================================= */

const API_URL = "http://localhost:5000/api/table13";

/* =========================================================
   DEFAULT HEADER
========================================================= */

const DEFAULT_HEADER_VALUES: HeaderValues = {
  manufacturerSheetNo: "",
  testAgency: "",
  documentNo: "",
  manufacturerName: "",
  manufacturerDesignation: "",
  date: "",
  testAgencyName: "",
  testAgencyDesignation: "",
};

/* =========================================================
   PAGE
========================================================= */

const Table13Page = () => {
  const [rows, setRows] = useState<Table13Row[]>([]);

  const [values, setValues] = useState<FormValues>({});

  const [headerValues, setHeaderValues] = useState<HeaderValues>(
    DEFAULT_HEADER_VALUES,
  );

  const [files, setFiles] = useState<SelectedFiles>({});

  const [loading, setLoading] = useState(true);

  const [downloading, setDownloading] = useState(false);

  const [error, setError] = useState("");

  /* =======================================================
     LOAD FORM
  ======================================================= */

  useEffect(() => {
    loadTable13();
  }, []);

  const loadTable13 = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/form`);

      if (!response.ok) {
        throw new Error(
          `Unable to load Table 13. Server returned ${response.status}.`,
        );
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Unable to load Table 13.");
      }

      setRows(data.rows || []);
    } catch (err) {
      console.error("Load Table 13 error:", err);

      setError(err instanceof Error ? err.message : "Unable to load Table 13.");
    } finally {
      setLoading(false);
    }
  };

  /* =======================================================
     FIELD VALUE
  ======================================================= */

  const handleValueChange = (row: number, value: string) => {
    setValues((previous) => ({
      ...previous,
      [row]: value,
    }));

    /*
      Remove an old error as soon as
      the user starts entering data.
    */

    if (error) {
      setError("");
    }
  };

  /* =======================================================
     HEADER VALUE
  ======================================================= */

  const handleHeaderChange = (field: keyof HeaderValues, value: string) => {
    setHeaderValues((previous) => ({
      ...previous,
      [field]: value,
    }));

    if (error) {
      setError("");
    }
  };

  /* =======================================================
     FILE
  ======================================================= */

  const handleFileChange = (row: number, file?: File) => {
    if (!file) {
      return;
    }

    setFiles((previous) => ({
      ...previous,
      [row]: file,
    }));

    /*
      For the current JSON-based download,
      the backend receives the filename.

      Actual binary file insertion into Word
      requires multipart/multer backend support.
    */

    setValues((previous) => ({
      ...previous,
      [row]: file.name,
    }));

    if (error) {
      setError("");
    }
  };

  /* =======================================================
     VALIDATE
  ======================================================= */

  const validateForm = () => {
    /*
      Validate Excel-defined required fields.
    */

    for (const row of rows) {
      if (row.type !== "field") {
        continue;
      }

      if (!row.required) {
        continue;
      }

      const value = values[row.row];

      if (!value || value.trim() === "") {
        const message = `Please enter a value for ${row.clauseNo} ${row.label}`;

        setError(message);

        document.getElementById(`table13-row-${row.row}`)?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });

        return false;
      }
    }

    return true;
  };

  /* =======================================================
     DOWNLOAD WORD
  ======================================================= */

  const handleDownload = async () => {
    try {
      setError("");

      /*
        Validate Excel required fields.
      */

      if (!validateForm()) {
        return;
      }

      setDownloading(true);

      console.log("========== DOWNLOAD TABLE 13 WORD ==========");

      console.log("Form values:", values);

      console.log("Header values:", headerValues);

      /*
        IMPORTANT:

        We are intentionally NOT using FormData.

        Backend expects JSON:

        {
          values: {...},
          metadata: {...}
        }
      */

      const response = await fetch(`${API_URL}/download`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          values,

          metadata: {
            manufacturer: headerValues.manufacturerSheetNo,

            sheetNo: headerValues.manufacturerSheetNo,

            testAgency: headerValues.testAgency,

            documentNo: headerValues.documentNo,

            name: headerValues.manufacturerName,

            designation: headerValues.manufacturerDesignation,

            date: headerValues.date,

            testAgencyName: headerValues.testAgencyName,

            testAgencyDesignation: headerValues.testAgencyDesignation,
          },
        }),
      });

      /* ===================================================
         ERROR RESPONSE
      =================================================== */

      if (!response.ok) {
        let message = "Failed to generate Table 13 Word document.";

        try {
          const data = await response.json();

          if (data?.message) {
            message = data.message;
          }
        } catch {
          /*
            Response was not JSON.
          */
        }

        throw new Error(message);
      }

      /* ===================================================
         GET DOCX
      =================================================== */

      const blob = await response.blob();

      /* ===================================================
         DOWNLOAD DOCX
      =================================================== */

      const downloadUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = downloadUrl;

      link.download = "AIS-007-Table-13-Filled.docx";

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error("Table 13 download error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to generate Word document.",
      );
    } finally {
      setDownloading(false);
    }
  };

  /* =======================================================
     CLEAR
  ======================================================= */

  const clearForm = () => {
    setValues({});

    setFiles({});

    setHeaderValues(DEFAULT_HEADER_VALUES);

    setError("");

    /*
      Reset all file inputs.
    */

    document
      .querySelectorAll<HTMLInputElement>('input[type="file"]')
      .forEach((input) => {
        input.value = "";
      });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="text-sm text-gray-600">Loading Table 13...</div>
      </div>
    );
  }

  /* =======================================================
     PAGE
  ======================================================= */

  return (
    <div className="min-h-screen bg-gray-200 py-6">
      <div className="mx-auto w-full max-w-[1400px] px-4">
        {/* =================================================
            DOCUMENT
        ================================================= */}

        <div className="overflow-hidden border border-black bg-white shadow-lg">
          {/* ===============================================
              DOCUMENT HEADER
          =============================================== */}

          <Table13Header values={headerValues} onChange={handleHeaderChange} />

          {/* ===============================================
              TABLE
          =============================================== */}

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr>
                  <th className="w-[120px] border border-black bg-gray-100 px-3 py-3 text-center font-bold">
                    Clause No.
                  </th>

                  <th className="border border-black bg-gray-100 px-4 py-3 text-left font-bold">
                    Description
                  </th>

                  <th className="w-[420px] border border-black bg-gray-100 px-4 py-3 text-left font-bold">
                    Response
                  </th>
                </tr>
              </thead>

              <tbody>
                {rows.map((row) => {
                  /*
                    SECTION
                  */

                  if (row.type === "heading") {
                    return (
                      <Table13SectionRow key={`heading-${row.row}`} row={row} />
                    );
                  }

                  /*
                    FIELD
                  */

                  return (
                    <Table13FieldRow
                      key={`field-${row.row}`}
                      row={row}
                      value={values[row.row] || ""}
                      file={files[row.row]}
                      onChange={handleValueChange}
                      onFileChange={handleFileChange}
                    />
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="mt-4 rounded border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* =================================================
            ACTIONS
        ================================================= */}

        <div className="mt-5 flex justify-end gap-3">
          {/* CLEAR */}

          <button
            type="button"
            onClick={clearForm}
            disabled={downloading}
            className="border border-gray-400 bg-white px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Clear
          </button>

          {/* DOWNLOAD */}

          <button
            type="button"
            onClick={handleDownload}
            disabled={downloading}
            className="bg-blue-700 px-7 py-3 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {downloading ? "Generating..." : "Download Word"}
          </button>
        </div>
      </div>
    </div>
  );
};

/* =========================================================
   DOCUMENT HEADER
========================================================= */

type Table13HeaderProps = {
  values: HeaderValues;

  onChange: (field: keyof HeaderValues, value: string) => void;
};

const Table13Header = ({ values, onChange }: Table13HeaderProps) => {
  return (
    <div className="border-b border-black">
      {/* ===============================================
          TITLE
      =============================================== */}

      <div className="border-b border-black px-6 py-4 text-center">
        <h1 className="text-lg font-bold">Table 13 of AIS-007 (Revision 5)</h1>
      </div>

      {/* ===============================================
          HEADER COLUMNS
      =============================================== */}

      <div className="grid grid-cols-2">
        {/* =============================================
            LEFT
        ============================================= */}

        <div className="border-r border-black">
          <HeaderField
            label="Manufacturer Sheet No"
            value={values.manufacturerSheetNo}
            onChange={(value) => onChange("manufacturerSheetNo", value)}
          />

          <HeaderField
            label="Document No"
            value={values.documentNo}
            onChange={(value) => onChange("documentNo", value)}
          />

          <HeaderField
            label="Name"
            value={values.manufacturerName}
            onChange={(value) => onChange("manufacturerName", value)}
          />

          <HeaderField
            label="Designation"
            value={values.manufacturerDesignation}
            onChange={(value) => onChange("manufacturerDesignation", value)}
          />

          <HeaderField
            label="Date"
            value={values.date}
            type="date"
            onChange={(value) => onChange("date", value)}
          />
        </div>

        {/* =============================================
            RIGHT
        ============================================= */}

        <div>
          <HeaderField
            label="Test Agency"
            value={values.testAgency}
            onChange={(value) => onChange("testAgency", value)}
          />

          <HeaderField
            label="Name"
            value={values.testAgencyName}
            onChange={(value) => onChange("testAgencyName", value)}
          />

          <HeaderField
            label="Designation"
            value={values.testAgencyDesignation}
            onChange={(value) => onChange("testAgencyDesignation", value)}
          />
        </div>
      </div>
    </div>
  );
};

/* =========================================================
   HEADER FIELD
========================================================= */

type HeaderFieldProps = {
  label: string;
  value: string;
  type?: "text" | "date";
  onChange: (value: string) => void;
};

const HeaderField = ({
  label,
  value,
  type = "text",
  onChange,
}: HeaderFieldProps) => {
  return (
    <div className="flex min-h-[42px] border-b border-black last:border-b-0">
      {/* LABEL */}

      <div className="w-[180px] border-r border-black bg-gray-50 px-3 py-2 font-medium">
        {label}:
      </div>

      {/* INPUT */}

      <div className="flex-1 px-3 py-2">
        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full border-0 bg-transparent outline-none"
        />
      </div>
    </div>
  );
};

/* =========================================================
   SECTION ROW
========================================================= */

type Table13SectionRowProps = {
  row: Table13Row;
};

const Table13SectionRow = ({ row }: Table13SectionRowProps) => {
  return (
    <tr className="bg-gray-100">
      <td className="border border-black px-3 py-3 align-top font-bold">
        {row.clauseNo}
      </td>

      <td colSpan={2} className="border border-black px-4 py-3 font-bold">
        {row.label}
      </td>
    </tr>
  );
};

/* =========================================================
   FIELD ROW
========================================================= */

type Table13FieldRowProps = {
  row: Table13Row;

  value: string;

  file?: File;

  onChange: (row: number, value: string) => void;

  onFileChange: (row: number, file?: File) => void;
};

const Table13FieldRow = ({
  row,
  value,
  file,
  onChange,
  onFileChange,
}: Table13FieldRowProps) => {
  return (
    <tr id={`table13-row-${row.row}`}>
      {/* =============================================
          CLAUSE
      ============================================= */}

      <td className="border border-black px-3 py-3 align-top font-medium">
        {row.clauseNo}
      </td>

      {/* =============================================
          DESCRIPTION
      ============================================= */}

      <td className="border border-black px-4 py-3 align-top leading-6">
        {row.label}

        {row.required && <span className="ml-1 text-red-600">*</span>}
      </td>

      {/* =============================================
          RESPONSE
      ============================================= */}

      <td className="border border-black px-4 py-3 align-top">
        <Table13Input
          row={row}
          value={value}
          file={file}
          onChange={onChange}
          onFileChange={onFileChange}
        />
      </td>
    </tr>
  );
};

/* =========================================================
   INPUT
========================================================= */

type Table13InputProps = {
  row: Table13Row;

  value: string;

  file?: File;

  onChange: (row: number, value: string) => void;

  onFileChange: (row: number, file?: File) => void;
};

const Table13Input = ({
  row,
  value,
  file,
  onChange,
  onFileChange,
}: Table13InputProps) => {
  const baseClass =
    "w-full border border-gray-400 bg-white px-3 py-2 text-sm outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-200";

  /* =====================================================
     FILE
  ===================================================== */

  if (row.fieldType === "file") {
    return (
      <div className="space-y-2">
        <input
          id={`file-${row.row}`}
          type="file"
          accept="image/*,.pdf"
          onChange={(event) => onFileChange(row.row, event.target.files?.[0])}
          className="block w-full text-sm"
        />

        {file && (
          <div className="rounded border border-gray-200 bg-gray-50 px-2 py-1 text-xs text-gray-600">
            Selected: <span className="font-medium">{file.name}</span>
          </div>
        )}
      </div>
    );
  }

  /* =====================================================
     SELECT
  ===================================================== */

  if (row.fieldType === "select") {
    return (
      <select
        value={value}
        onChange={(event) => onChange(row.row, event.target.value)}
        className={baseClass}
      >
        <option value="">Select</option>

        {row.options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    );
  }

  /* =====================================================
     TEXTAREA
  ===================================================== */

  if (row.fieldType === "textarea") {
    return (
      <textarea
        value={value}
        onChange={(event) => onChange(row.row, event.target.value)}
        rows={4}
        className={`${baseClass} resize-y`}
      />
    );
  }

  /* =====================================================
     NUMBER
  ===================================================== */

  if (row.fieldType === "number") {
    return (
      <input
        type="number"
        value={value}
        onChange={(event) => onChange(row.row, event.target.value)}
        className={baseClass}
      />
    );
  }

  /* =====================================================
     DATE
  ===================================================== */

  if (row.fieldType === "date") {
    return (
      <input
        type="date"
        value={value}
        onChange={(event) => onChange(row.row, event.target.value)}
        className={baseClass}
      />
    );
  }

  /* =====================================================
     DEFAULT TEXT
  ===================================================== */

  return (
    <input
      type="text"
      value={value}
      onChange={(event) => onChange(row.row, event.target.value)}
      className={baseClass}
    />
  );
};

/* =========================================================
   EXPORT
========================================================= */

export default Table13Page;