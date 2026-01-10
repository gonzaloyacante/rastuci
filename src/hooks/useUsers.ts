import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

export interface User {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "USER";
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string | null;
  lastLoginIp?: string | null;
  loginCount?: number;
  activeSessions?: number;
}

interface UseUsersParams {
  page?: number;
  limit?: number;
  role?: string;
  search?: string;
}

interface UseUsersReturn {
  users: User[];
  loading: boolean;
  error: string | null;
  totalPages: number;
  currentPage: number;
  fetchUsers: (params?: UseUsersParams) => Promise<void>;
  refreshUsers: () => Promise<void>;
  createUser: (
    userData: Omit<User, "id" | "createdAt" | "updatedAt"> & {
      password: string;
    }
  ) => Promise<User | null>;
  updateUser: (
    userId: string,
    userData: Partial<Omit<User, "id" | "createdAt" | "updatedAt">>
  ) => Promise<boolean>;
  deleteUser: (userId: string) => Promise<boolean>;
  getUserById: (userId: string) => Promise<User | null>;
}

export const useUsers = (initialParams?: UseUsersParams): UseUsersReturn => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(initialParams?.page || 1);
  const [lastParams, setLastParams] = useState<UseUsersParams>(
    initialParams || {}
  );

  const fetchUsers = async (params?: UseUsersParams) => {
    try {
      setLoading(true);
      setError(null);

      const finalParams = { ...lastParams, ...params };
      setLastParams(finalParams);

      const urlParams = new URLSearchParams();

      if (finalParams.page) {
        urlParams.append("page", finalParams.page.toString());
      }
      if (finalParams.limit) {
        urlParams.append("limit", finalParams.limit.toString());
      }
      if (finalParams.role) {
        urlParams.append("role", finalParams.role);
      }
      if (finalParams.search) {
        urlParams.append("search", finalParams.search);
      }

      const response = await fetch(`/api/users?${urlParams}`);

      if (!response.ok) {
        throw new Error("Error al cargar los usuarios");
      }

      const data = await response.json();

      if (data.success) {
        // Map isAdmin to role since API returns isAdmin but we use role in UI
        const mappedUsers = data.data.data.map((user: { isAdmin: boolean; role?: string } & Record<string, unknown>) => ({
          ...user,
          role: user.role || (user.isAdmin ? "ADMIN" : "USER"),
        }));
        setUsers(mappedUsers);
        setTotalPages(data.data.totalPages);
        setCurrentPage(data.data.page);
      } else {
        throw new Error(data.error || "Error desconocido");
      }
    } catch (error) {
      const _errorMessage =
        error instanceof Error ? error.message : "Error desconocido";
      setError(_errorMessage);
      toast.error(_errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const refreshUsers = async () => {
    await fetchUsers(lastParams);
  };

  const createUser = async (
    userData: Omit<User, "id" | "createdAt" | "updatedAt"> & {
      password: string;
    }
  ): Promise<User | null> => {
    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error("Error al crear el usuario");
      }

      const data = await response.json();

      if (data.success) {
        const newUser = data.data;
        setUsers((prevUsers) => [newUser, ...prevUsers]);
        toast.success("Usuario creado correctamente");
        return newUser;
      } else {
        throw new Error(data.error || "Error desconocido");
      }
    } catch (error) {
      const _errorMessage =
        error instanceof Error ? error.message : "Error desconocido";
      toast.error(_errorMessage);
      return null;
    }
  };

  const updateUser = async (
    userId: string,
    userData: Partial<Omit<User, "id" | "createdAt" | "updatedAt">>
  ): Promise<boolean> => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error("Error al actualizar el usuario");
      }

      const data = await response.json();

      if (data.success) {
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.id === userId
              ? {
                ...user,
                ...userData,
                updatedAt: new Date().toISOString(),
              }
              : user
          )
        );
        toast.success("Usuario actualizado correctamente");
        return true;
      } else {
        throw new Error(data.error || "Error desconocido");
      }
    } catch (error) {
      const _errorMessage =
        error instanceof Error ? error.message : "Error desconocido";
      toast.error(_errorMessage);
      return false;
    }
  };

  const deleteUser = async (userId: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Error al eliminar el usuario");
      }

      const data = await response.json();

      if (data.success) {
        setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
        toast.success("Usuario eliminado correctamente");
        return true;
      } else {
        throw new Error(data.error || "Error desconocido");
      }
    } catch (error) {
      const _errorMessage =
        error instanceof Error ? error.message : "Error desconocido";
      toast.error(_errorMessage);
      return false;
    }
  };

  const getUserById = async (userId: string): Promise<User | null> => {
    try {
      const response = await fetch(`/api/users/${userId}`);

      if (!response.ok) {
        throw new Error("Error al obtener el usuario");
      }

      const data = await response.json();

      if (data.success) {
        return data.data;
      } else {
        throw new Error(data.error || "Error desconocido");
      }
    } catch (error) {
      const _errorMessage =
        error instanceof Error ? error.message : "Error desconocido";
      toast.error(_errorMessage);
      return null;
    }
  };

  // Cargar usuarios iniciales
  useEffect(() => {
    fetchUsers(initialParams);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    users,
    loading,
    error,
    totalPages,
    currentPage,
    fetchUsers,
    refreshUsers,
    createUser,
    updateUser,
    deleteUser,
    getUserById,
  };
};
