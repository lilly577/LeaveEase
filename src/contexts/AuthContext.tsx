import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { api } from "@/services/api";
import { User, UserRole } from "@/types";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<UserRole>;
  register: (
    name: string,
    email: string,
    password: string,
    department: string,
    location: string,
    role: UserRole,
  ) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const email = localStorage.getItem("email");
    const role = localStorage.getItem("role");
    const department = localStorage.getItem("department");
    const location = localStorage.getItem("location");

    if (token && email && role) {
      setUser({
        id: "persisted",
        email,
        name: email.split("@")[0],
        role: role as UserRole,
        department: department || "",
        location: location || "",
      });
    }
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.post("/auth/login", { email, password });
    const { token, role: responseRole, user: responseUser } = res.data;

    localStorage.setItem("token", token);
    localStorage.setItem("email", responseUser?.email || email);
    localStorage.setItem("role", responseRole);
    localStorage.setItem("department", responseUser?.department || "");
    localStorage.setItem("location", responseUser?.location || "");

    setUser({
      id: responseUser?.id || "session",
      email: responseUser?.email || email,
      name: responseUser?.fullName || email.split("@")[0],
      role: responseRole,
      department: responseUser?.department || "",
      location: responseUser?.location || "",
    });

    return responseRole as UserRole;
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    department: string,
    location: string,
    role: UserRole,
  ) => {
    await api.post("/auth/register", {
      fullName: name,
      email,
      password,
      role,
      department,
      location,
    });

    // Auto-login after registration
    await login(email, password);
    localStorage.setItem("department", department);
    localStorage.setItem("location", location);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    localStorage.removeItem("role");
    localStorage.removeItem("department");
    localStorage.removeItem("location");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
