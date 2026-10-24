import React, { createContext, useContext, useState, useEffect } from "react";
import { fetchManagersFromFirestore, getStoredManagers } from "../data/quizStore";

const AuthContext = createContext(null);

const STORAGE_KEY = "devfest_admin_auth";

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(false);

  // Sync session across tabs
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === STORAGE_KEY) {
        try {
          setCurrentUser(e.newValue ? JSON.parse(e.newValue) : null);
        } catch {
          setCurrentUser(null);
        }
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  /**
   * Login handler for Super Admin and Booth Managers
   */
  const login = async (email, password) => {
    setLoading(true);
    const cleanEmail = (email || "").trim().toLowerCase();
    const cleanPass = (password || "").trim();

    try {
      // 1. Super Admin Hardcoded Credentials
      if (cleanEmail === "admin@admin.com" && cleanPass === "123456") {
        const superAdminUser = {
          id: "super-admin-01",
          email: "admin@admin.com",
          name: "Super Admin",
          role: "superadmin",
          permissions: ["*"], // Wildcard: access all sidebar tabs and all quizzes
          avatar: "SA",
          createdAt: new Date().toISOString()
        };

        localStorage.setItem(STORAGE_KEY, JSON.stringify(superAdminUser));
        setCurrentUser(superAdminUser);
        setLoading(false);
        return { success: true, user: superAdminUser };
      }

      // 2. Manager Login (Check Firestore & Local Cache)
      let managers = getStoredManagers();
      try {
        const remoteManagers = await fetchManagersFromFirestore();
        if (remoteManagers && remoteManagers.length > 0) {
          managers = remoteManagers;
        }
      } catch (err) {
        console.warn("Using local managers cache:", err);
      }

      const foundManager = managers.find(
        (m) => m.email && m.email.toLowerCase() === cleanEmail
      );

      if (!foundManager) {
        setLoading(false);
        return {
          success: false,
          message: "No admin or manager account found with this email."
        };
      }

      if (foundManager.password !== cleanPass) {
        setLoading(false);
        return {
          success: false,
          message: "Incorrect password. Please verify your credentials."
        };
      }

      const managerUser = {
        ...foundManager,
        role: "manager",
        avatar: "BM"
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(managerUser));
      setCurrentUser(managerUser);
      setLoading(false);
      return { success: true, user: managerUser };
    } catch (error) {
      setLoading(false);
      return {
        success: false,
        message: "Login error: " + (error.message || "Failed to authenticate.")
      };
    }
  };

  /**
   * Logout handler
   */
  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setCurrentUser(null);
  };

  /**
   * Role and Permission checks
   */
  const isSuperAdmin = currentUser?.role === "superadmin";
  const isManager = currentUser?.role === "manager";

  const hasPermission = (permissionKey) => {
    if (!currentUser) return false;
    if (isSuperAdmin) return true;
    if (!permissionKey) return true;
    if (currentUser.permissions && currentUser.permissions.includes("*")) return true;
    return Boolean(currentUser.permissions && currentUser.permissions.includes(permissionKey));
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loading,
        login,
        logout,
        isSuperAdmin,
        isManager,
        hasPermission
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
