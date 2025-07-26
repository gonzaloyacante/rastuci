"use client";

import { useUsers, User } from "@/hooks";
import {
  AdminPageHeader,
  AdminEmpty,
  AdminEmptyIcons,
  AdminLoading,
  AdminError,
} from "@/components/admin";
import { useState } from "react";

export default function UsuariosPage() {
  const {
    users,
    loading,
    error,
    deleteUser,
    totalPages,
    currentPage,
    fetchUsers,
  } = useUsers({ limit: 20 });
  const [searchInput, setSearchInput] = useState("");

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este usuario?")) {
      return;
    }

    await deleteUser(id);
  };

  // Búsqueda
  const handleSearch = () => {
    fetchUsers({ page: 1, limit: 20, search: searchInput });
  };

  // Paginación
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    fetchUsers({ page, limit: 20, search: searchInput });
  };

  const getRoleBadge = (role: string) => {
    return role === "ADMIN"
      ? { variant: "warning" as const, label: "Administrador" }
      : { variant: "info" as const, label: "Usuario" };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-CO", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) return <AdminLoading />;
  if (error) return <AdminError message={error} />;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Gestión de Usuarios"
        subtitle="Administra los usuarios del sistema"
        actions={[
          {
            label: "Crear Usuario",
            onClick: () => {
              window.location.href = "/admin/usuarios/nuevo";
            },
            variant: "primary",
          },
        ]}
      />

      {/* Barra de búsqueda */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center">
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSearch();
          }}
          placeholder="Buscar usuarios por nombre o email..."
          className="w-full sm:w-96 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        />
        <button
          onClick={handleSearch}
          className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition-colors">
          Buscar
        </button>
      </div>

      {/* Mostrar AdminEmpty si no hay usuarios */}
      {Array.isArray(users) && users.length === 0 ? (
        <AdminEmpty
          icon={AdminEmptyIcons.users}
          title="No hay usuarios"
          description={
            searchInput
              ? "No se encontraron usuarios con ese criterio de búsqueda."
              : "No hay usuarios registrados. ¡Crea el primer usuario!"
          }
          action={{
            label: "Crear Primer Usuario",
            onClick: () => {
              window.location.href = "/admin/usuarios/nuevo";
            },
            variant: "primary",
          }}
        />
      ) : null}

      {/* Mostrar tabla/cards solo si hay usuarios */}
      {Array.isArray(users) && users.length > 0 && (
        <div className="card">
          {/* Vista de cards para mobile/tablet */}
          <div className="block xl:hidden space-y-4">
            {users.map((user: User) => (
              <div
                key={user.id}
                className="border rounded-lg p-4 space-y-3 bg-white shadow-sm">
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-medium">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-content-primary truncate">
                          {user.name}
                        </h3>
                        <p className="text-sm text-content-secondary truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <span
                        className={`badge-${
                          getRoleBadge(user.role).variant
                        } text-xs`}>
                        {getRoleBadge(user.role).label}
                      </span>
                      <span className="text-xs text-content-tertiary">
                        {formatDate(user.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2 pt-2">
                  <button
                    onClick={() => {
                      window.location.href = `/admin/usuarios/${user.id}/editar`;
                    }}
                    className="btn-secondary flex-1 text-sm cursor-pointer">
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(user.id)}
                    disabled={user.role === "ADMIN"}
                    className="btn-destructive flex-1 text-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Vista de tabla para desktop */}
          <div className="hidden xl:block overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-surface-secondary">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-content-secondary uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-content-secondary uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-content-secondary uppercase tracking-wider">
                    Rol
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-content-secondary uppercase tracking-wider">
                    Fecha de Registro
                  </th>
                  <th className="relative px-6 py-3">
                    <span className="sr-only">Acciones</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-border">
                {users.map((user: User) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12">
                          <div className="h-12 w-12 bg-primary rounded-full flex items-center justify-center text-white font-medium text-lg">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-content-primary">
                            {user.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-content-primary">
                        {user.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`badge-${
                          getRoleBadge(user.role).variant
                        } text-xs`}>
                        {getRoleBadge(user.role).label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-content-secondary">
                        {formatDate(user.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => {
                          window.location.href = `/admin/usuarios/${user.id}/editar`;
                        }}
                        className="text-primary hover:text-primary/80 mr-4 cursor-pointer">
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        disabled={user.role === "ADMIN"}
                        className="text-error hover:text-error/80 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* Controles de paginación */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-6">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1 || loading}
                  className="btn-secondary disabled:opacity-50">
                  Anterior
                </button>
                <span className="text-sm text-content-secondary">
                  Página {currentPage} de {totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages || loading}
                  className="btn-secondary disabled:opacity-50">
                  Siguiente
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
