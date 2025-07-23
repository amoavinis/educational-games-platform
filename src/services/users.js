import { getAuth } from "firebase/auth";

export function setDisplayName(name) {
  return localStorage.setItem("userDisplayName", name);
}

export function getDisplayName() {
  return localStorage.getItem("userDisplayName");
}

export const getUsers = async () => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) throw new Error("User not authenticated");

  try {
    const idToken = await user.getIdToken();
    const response = await fetch(`https://getusers-v5j5fe6n2q-ew.a.run.app`, {
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
      method: "GET"
    });

    if (!response.ok) {
      throw new Error("Failed to fetch users");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

export const createUser = async (userData) => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) throw new Error("User not authenticated");

  try {
    const idToken = await user.getIdToken();
    const response = await fetch(`https://createuser-v5j5fe6n2q-ew.a.run.app`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${idToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      throw new Error("Failed to create user");
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};

export const updateUser = async (userId, userData) => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) throw new Error("User not authenticated");

  try {
    const idToken = await user.getIdToken();
    const response = await fetch(`https://updateuser-v5j5fe6n2q-ew.a.run.app/${userId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${idToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      throw new Error("Failed to update user");
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
};

export const deleteUser = async (userId, userData) => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) throw new Error("User not authenticated");

  try {
    const idToken = await user.getIdToken();
    const response = await fetch(`https://deleteuser-v5j5fe6n2q-ew.a.run.app/${userId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${idToken}`,
        "Content-Type": "application/json",
      },
      body: null
    });

    if (!response.ok) {
      throw new Error("Failed to update user");
    }

    return await response.json();
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
};
