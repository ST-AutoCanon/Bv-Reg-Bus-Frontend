import { BusFormData } from "../components/homologation/BusPages/formData/BusFormData";

const API_URL = "http://localhost:3009/api";

export const saveBusForms = async (
  requestId: string,
  formData: Partial<BusFormData>
) => {
  console.log("saveBusForms called");
  console.log("requestId:", requestId);
  console.log("formData:", formData);

  const response = await fetch(
    `${API_URL}/bus-forms/${requestId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        formData,
      }),
    }
  );

  console.log("Response status:", response.status);

  if (!response.ok) {
    throw new Error(
      `Failed to save Bus forms: ${response.status}`
    );
  }

  return response.json();
};

export const getBusForms = async (
  requestId: string
) => {
  const response = await fetch(
    `${API_URL}/bus-forms/${requestId}`
  );

  if (!response.ok) {
    throw new Error(
      `Failed to get Bus forms: ${response.status}`
    );
  }

  return response.json();
};