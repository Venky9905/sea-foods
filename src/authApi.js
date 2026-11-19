const AUTH_API_BASE_URL = (
  import.meta.env.VITE_AUTH_API_BASE_URL || "/api/auth"
).replace(/\/$/, "");

async function postAuthRequest(path, payload) {
  let response;

  try {
    response = await fetch(`${AUTH_API_BASE_URL}/${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new Error(
      "Authentication service is not available. Please try again later."
    );
  }

  const text = await response.text();
  let data;

  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    throw new Error(
      "Authentication service is not configured or returned an invalid response."
    );
  }

  if (!response.ok) {
    throw new Error(
      data.message || data.error || "Authentication request failed."
    );
  }

  return data;
}

export function loginCustomer(credentials) {
  return postAuthRequest("login", credentials);
}

export function registerCustomer(customerDetails) {
  return postAuthRequest("register", customerDetails);
}