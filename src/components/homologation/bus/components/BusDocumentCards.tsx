
import React, { useEffect, useState, useCallback } from "react";
import generateForm2 from "../../generator/form2Generator";
import generateForm3 from "../../generator/form3Generator";

interface BusDocumentCardsProps {
  submissionId: string;
  progressByForm?: Record<string, number>;
}

const BUS_FORMS = [
  { id: "form2", name: "Form 2" },
  { id: "form3", name: "Form 3" },
  { id: "form5", name: "Form 5" },
  { id: "form6", name: "Form 6" },
  { id: "form7c", name: "Form 7C" },
  { id: "form8", name: "Form 8" },
  { id: "form11", name: "Form 11" },
  { id: "form13", name: "Form 13" },
  { id: "form22p2", name: "Form 22 P2" },
  { id: "form22p1", name: "Form 22 P1" },
  { id: "t22b", name: "T22B" },
  { id: "t22c", name: "T22C" },
  { id: "t22d", name: "T22D" },
];
const API_URL = (process.env.REACT_APP_BASE_URL || "").replace(/\/+$/, "");

const getAuthToken = (): string => {
  try {
    const persistedRoot = localStorage.getItem("persist:root");

    if (!persistedRoot) return "";

    const root = JSON.parse(persistedRoot);
    const loginCredential = JSON.parse(
      root.loginCredential || "{}"
    );

    return (
      loginCredential.token ||
      loginCredential.accessToken ||
      ""
    );
  } catch (error) {
    console.error("Unable to read authentication token:", error);
    return "";
  }
};
const FORM_TABLE_MAP: Record<string, string> = {
  form2: "T2",
  form3: "T3",
  form5: "T5",
  form6: "T6",
  form7c: "T7C",
  form8: "T8",
  form11: "T11",
  form13: "T13",
  form22p2: "T22",
  form22p1: "T22P1",
  t22b: "T22B",
  t22c: "T22C",
  t22d: "T22D",
};

const BusDocumentCards: React.FC<BusDocumentCardsProps> = ({
  submissionId,
}) => {
  const [progressByForm, setProgressByForm] = useState<
    Record<string, number>
  >({});

  const fetchFormProgress = useCallback(async () => {
    if (!submissionId) return;

    try {
      const token = getAuthToken();

      if (!token) {
        console.error("Authentication token is missing");
        return;
      }

      const response = await fetch(
        `${API_URL}/bus/submissions/${submissionId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Failed to fetch completion percentage"
        );
      }

      const submission = result.data?.data ?? result.data;
      const tables = submission?.tables || {};

      const updatedProgress: Record<string, number> = {};

      Object.entries(FORM_TABLE_MAP).forEach(([formId, tableKey]) => {
        updatedProgress[formId] = Math.max(
          0,
          Math.min(
            100,
            Number(tables[tableKey]?.completionPercentage ?? 0)
          )
        );
      });

      setProgressByForm(updatedProgress);

      console.log("Updated form progress:", updatedProgress);
    } catch (error) {
      console.error("Error fetching form progress:", error);
    }
  }, [submissionId]);

  useEffect(() => {
    void fetchFormProgress();
  }, [fetchFormProgress]);

  useEffect(() => {
    window.addEventListener("focus", fetchFormProgress);

    return () => {
      window.removeEventListener("focus", fetchFormProgress);
    };
  }, [fetchFormProgress]);

  return (
    <section style={{ marginTop: "65px", width: "100%" }}>


      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))",
          gap: "30px 18px",
        }}
      >
        {BUS_FORMS.map((form) => {
          const progress = Math.max(
            0,
            Math.min(100, progressByForm[form.id] ?? 0)
          );

          const handleDownload = async (form: (typeof BUS_FORMS)[number]) => {
            if (form.id !== "form2" && form.id !== "form3") return;

            try {
              const token = getAuthToken();

              if (!token) {
                alert("Authentication required. Please sign in again.");
                return;
              }

              if (!submissionId) {
                alert("Submission ID is missing.");
                return;
              }

              // Select API endpoint according to the form
              const tableNumber = form.id === "form2" ? "table2" : "table3";
              const url = `${API_URL}/bus/${tableNumber}/${submissionId}`;

              console.log("Downloading:", form.name);
              console.log("API URL:", url);

              const response = await fetch(url, {
                method: "GET",
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
              });

              const responseText = await response.text();

              let result;

              try {
                result = JSON.parse(responseText);
              } catch {
                throw new Error("Backend returned an invalid JSON response.");
              }

              if (!response.ok) {
                throw new Error(
                  result.message || `API failed: ${response.status}`
                );
              }

              const formData = result.data?.data ?? result.data;

              if (
                !formData ||
                typeof formData !== "object" ||
                Array.isArray(formData)
              ) {
                throw new Error(`${form.name} data is empty or invalid.`);
              }

              console.log(`${form.name} data:`, formData);

              // Generate the selected document
              if (form.id === "form2") {
                await generateForm2(formData, submissionId);
              } else if (form.id === "form3") {
                await generateForm3(formData);
              }

              console.log(`${form.name} download triggered`);

            } catch (error) {
              console.error(`${form.name} download failed:`, error);

              alert(
                error instanceof Error
                  ? error.message
                  : `Unable to generate ${form.name}. Please try again.`
              );
            }
          };

          return (
            <div
              key={form.id}
              style={{
                position: "relative",
                minWidth: 0,
              }}
            >
              <h3
                style={{
                  textAlign: "center",
                  fontSize: "16px",
                  fontWeight: 700,
                  color: "#111827",
                  marginBottom: "12px",
                }}
              >
                {form.name}
              </h3>

              <div
                style={{
                  position: "relative",
                  height: "100px",
                  borderRadius: "10px",
                  backgroundColor: "#dedede",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "visible",
                }}
              >

                <div
                  style={{
                    position: "absolute",
                    inset: "8px",
                    display: "flex",
                    gap: "5px",
                    overflow: "hidden",
                  }}
                >
                  {Array.from({ length: 10 }).map((_, index) => (
                    <div
                      key={index}
                      style={{
                        flex: 1,
                        backgroundColor:
                          progress === 0
                            ? "#d1d5db"
                            : progress === 100
                              ? "#80bf20"
                              : "#08718a",
                        transition: "background-color 0.3s ease",
                      }}
                    />
                  ))}
                </div>


                <span
                  style={{
                    position: "relative",
                    fontSize: "20px",
                    fontWeight: 500,
                    color: "#111111",
                  }}
                >
                  {progress} %
                </span>



                <button
                  type="button"
                  disabled={form.id !== "form2" && form.id !== "form3"}
                  onClick={() => void handleDownload(form)}
                  title={
                    form.id === "form2"
                      ? "Download Form 2"
                      : "Coming soon"
                  }
                  style={{
                    position: "absolute",
                    top: "-12px",
                    left: "-7px",
                    width: "34px",
                    height: "34px",
                    borderRadius: "50%",
                    border: "3px solid white",
                    backgroundColor:
                      form.id === "form2" || form.id === "form3"
                        ? "#f47721"
                        : "#cccccc",
                    color: "#ffffff",
                    fontSize: "19px",
                    cursor:
                      form.id === "form2" || form.id === "form3"
                        ? "pointer"
                        : "not-allowed",
                  }}
                >
                  ↓
                </button>
              </div>

              {/* <div
                style={{
                  marginTop: "18px",
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "#111827",
                  textAlign: "center",
                }}
              >
                {progress === 100
                  ? "Document Ready"
                  : "Document Progress"}
              </div> */}


            </div>
          );
        })}
      </div>
    </section>
  );
};

export default BusDocumentCards;
