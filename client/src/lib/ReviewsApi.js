const baseURL = import.meta.env.VITE_BASE_URL;

export async function listReviews() {
  const res = await fetch(`${baseURL}/api/reviews`);
  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }
  return res.json();
}

export async function getReview(id) {
  const res = await fetch(`${baseURL}/api/reviews/${id}`);
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }
  return res.json();
}

export async function createReview(payload) {
  const res = await fetch(`${baseURL}/api/reviews`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }
  return res.json();
}

export async function updateReview(id, payload) {
  const res = await fetch(`${baseURL}/api/reviews/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }
  return res.json();
}

export async function deleteReview(id) {
  const res = await fetch(`${baseURL}/api/reviews/${id}`, { method: "DELETE" });
  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }
  return res.json();
}
