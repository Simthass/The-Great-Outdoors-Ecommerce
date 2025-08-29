const baseURL = import.meta.env.VITE_BASE_URL;
console.log("Base URL:", baseURL); // Add this line to see what it actually is

// Helper to attach token
function getHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };
}

/**
 * List all reviews for Admin
 */
export async function listAdminReviews({
  q = "",
  sort = "desc",
  status = "all",
  page = 1,
  limit = 20,
} = {}) {
  try {
    const params = new URLSearchParams({ q, sort, status, page, limit });
    const url = `${baseURL}/api/admin/reviews?${params.toString()}`;

    console.log("Making request to:", url); // Debug log
    console.log("Headers:", getHeaders()); // Debug log

    const res = await fetch(url, {
      headers: getHeaders(),
    });

    console.log("Response status:", res.status); // Debug log
    console.log("Response headers:", res.headers); // Debug log

    if (!res.ok) {
      const errorText = await res.text();
      console.log("Error response:", errorText); // Debug log
      throw new Error(
        `HTTP error! status: ${res.status}, response: ${errorText}`
      );
    }

    const text = await res.text(); // Get as text first
    console.log("Raw response:", text); // Debug log

    const data = JSON.parse(text); // Parse manually
    return data.success ? data.data.reviews : [];
  } catch (error) {
    console.error("Detailed error:", error);
    throw error;
  }
}

/**
 * Delete review (Admin)
 */
export async function deleteAdminReview(id) {
  const res = await fetch(`${baseURL}/api/admin/reviews/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });

  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }
  return res.json();
}

// Keep your existing functions for other operations
export async function getReview(id) {
  const res = await fetch(`${baseURL}/api/admin/reviews/${id}`, {
    headers: getHeaders(),
  });

  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }

  const data = await res.json();
  return data.success ? data.data : null;
}

export async function createReview(payload) {
  const res = await fetch(`${baseURL}/api/product-reviews`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }
  return res.json();
}

export async function updateReview(id, payload) {
  const res = await fetch(`${baseURL}/api/admin/reviews/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("Update error:", errorText);
    throw new Error(
      `HTTP error! status: ${res.status}, response: ${errorText}`
    );
  }

  return res.json();
}
export async function deleteReview(id) {
  const res = await fetch(`${baseURL}/api/admin/reviews/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });

  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }
  return res.json();
}
