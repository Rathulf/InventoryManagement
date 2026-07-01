const BASE_URL = "http://localhost:8080/api/auth";

export const register = async (name, email, password, role) => {
  const response = await fetch(`${BASE_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password, role }),
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Registration failed");
  }
  return response.json();
};

export const login = async (email, password) => {
  const response = await fetch(`${BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Login failed");
  }
  return response.json(); // Returns message, name, email, and role
};