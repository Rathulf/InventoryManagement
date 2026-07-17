const BASE_URL = "https://stockpulse-cbdz.onrender.com/api/auth";

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

export const changePassword = async (userId, newPassword) => {
  const response = await fetch(`https://stockpulse-cbdz.onrender.com/api/employees/${userId}/change-password`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ newPassword }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to update password");
  }
  return response.json();
};
