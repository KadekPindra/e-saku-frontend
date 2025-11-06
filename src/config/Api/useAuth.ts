// src/config/Api/useAuth.ts
import { ApiAuth } from "../Services/Auth.service";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export const useLogin = () => {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const login = async (credentials: {
    identifier: string;
    password: string;
  }) => {
    setErrorMessage(null);
    setFieldErrors({});
    setIsLoading(true);

    try {
      const data = await ApiAuth.login(credentials);

      localStorage.setItem("token", data.token);
      localStorage.setItem("login_time", new Date().toISOString());
      localStorage.setItem("last_activity", new Date().toISOString());

      const { user } = data;

      if (user?.teacher_id) {
        localStorage.setItem("teacher_id", user.teacher_id);
        localStorage.setItem("user_type", "teacher");
        if (user.role) localStorage.setItem("role", user.role);
      } else if (user?.student_id) {
        localStorage.setItem("student_id", user.student_id);
        localStorage.setItem("user_type", "student");
        if (user.role) localStorage.setItem("role", user.role);
      } else if (user?.role === "trainer") {
        localStorage.setItem("trainer_id", user.id)
        localStorage.setItem("user_type", "trainer")
        if (user.role) localStorage.setItem("role", user.role)
      }

      if (user?.teacher_id) {
        navigate("/"); 
      } else if (user?.student_id) {
        navigate("/profilestudent");
      } else if (user?.role === "trainer") {
        navigate("/profiletrainer");
      } else {
        navigate("/");  
      }

      return data;
    } catch (error: any) {
      const res = error.response;

      if (res) {
        switch (res.status) {
          case 422:
            const mappedErrors: Record<string, string> = {};
            Object.keys(res.data.errors).forEach((key) => {
              mappedErrors[key] = res.data.errors[key][0];
            });
            setFieldErrors(mappedErrors);
            break;
          case 401:
            setErrorMessage("Username atau password salah");
            break;
          case 404:
            setErrorMessage("User tidak ditemukan");
            break;
          default:
            setErrorMessage("Terjadi kesalahan pada server");
        }
      } else if (error.request) {
        setErrorMessage("Tidak ada respons dari server");
      } else {
        setErrorMessage("Terjadi kesalahan");
      }

      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    login,
    isLoading,
    errorMessage,
    fieldErrors,
    setErrorMessage,
    setFieldErrors,
  };
};

export const useLogout = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoggedOut, setHasLoggedOut] = useState(false);

  const logout = async () => {
    if (hasLoggedOut) return;
    setHasLoggedOut(true);
    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (token) {
        await ApiAuth.logout();
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.clear();
      localStorage.setItem("logout_success", "");
      window.location.href = "/login";
      setIsLoading(false);
    }
  };

  return { logout, isLoading };
};

export const useCurrentUser = () => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const userType = localStorage.getItem("user_type");

  return {
    isAuthenticated: !!token,
    isTeacher: userType === "teacher",
    isStudent: userType === "student",
    userType,
    teacherId: localStorage.getItem("teacher_id"),
    studentId: localStorage.getItem("student_id"),
    role,
    isMaster: role === "master",
  };
};
