"use client";

import {
  AdminEmpty,
  AdminEmptyIcons,
  AdminError,
  AdminPageHeader,
} from "@/components/admin";
import { UsersSkeleton } from "@/components/admin/skeletons";
import { useConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Pagination } from "@/components/ui/Pagination";
import { useDocumentTitle } from "@/hooks";
import { User, useUsers } from "@/hooks/useUsers";
import { useState } from "react";

export default function UsuariosPage() {
  useDocumentTitle({ title: "Usuarios" });
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
  const { confirm: confirmDialog, ConfirmDialog } = useConfirmDialog();

  const handleDelete = async (id: string) => {
    const confirmed = await confirmDialog({
      title: "Eliminar usuario",
      message:
        "¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer.",
      confirmText: "Eliminar",
      cancelText: "Cancelar",
      variant: "danger",
    });

    if (!confirmed) {
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
    if (page < 1 || page > totalPages) {
      return;
    }
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

  if (loading) {
    return <UsersSkeleton />;
  }
  if (error) {
    return <AdminError message={error} />;
  }

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
            if (e.key === "Enter") {
              handleSearch();
            }
          }}
          placeholder="Buscar usuarios por nombre o email..."
          className="w-full sm:w-96 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        />
        <button
          onClick={handleSearch}
          className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition-colors"
        >
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
                className="border rounded-lg p-4 space-y-3 surface shadow-sm"
              >
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
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span
                          className={`badge-${
                            getRoleBadge(user.role).variant
                          } text-xs`}
                        >
                          {getRoleBadge(user.role).label}
                        </span>
                        {user.activeSessions !== undefined && user.activeSessions > 0 && (
                          <span className="text-xs px-2 py-1 bg-green-500/10 text-green-600 rounded-full">
                            {user.activeSessions} sesión{user.activeSessions > 1 ? 'es' : ''} activa{user.activeSessions > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-content-tertiary space-y-1">
                        <div>Creado: {formatDate(user.createdAt)}</div>
                        {user.lastLoginAt && (
                          <div>Último login: {formatDate(user.lastLoginAt)}</div>
                        )}
                        {user.loginCount !== undefined && user.loginCount > 0 && (
                          <div>Inicios de sesión: {user.loginCount}</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2 pt-2">
                  <button
                    onClick={() => {
                      window.location.href = `/admin/usuarios/${user.id}/editar`;
                    }}
                    className="btn-secondary flex-1 text-sm cursor-pointer"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(user.id)}
                    disabled={user.role === "ADMIN"}
                    className="btn-destructive flex-1 text-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
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
                    Actividad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-content-secondary uppercase tracking-wider">
                    Sesiones
                  </th>
                  <th className="relative px-6 py-3">
                    <span className="sr-only">Acciones</span>
                  </th>
                </tr>
              </thead>
              <tbody className="surface divide-y divide-border">
                {users.map((user: User) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="shrink-0 h-12 w-12">
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
                        } text-xs`}
                      >
                        {getRoleBadge(user.role).label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm space-y-1">
                        <div className="text-content-secondary">
                          Creado: {formatDate(user.createdAt)}
                        </div>
                        {user.lastLoginAt && (
                          <div className="text-content-tertiary text-xs">
                            Último login: {formatDate(user.lastLoginAt)}
                          </div>
                        )}
                        {user.loginCount !== undefined && user.loginCount > 0 && (
                          <div className="text-content-tertiary text-xs">
                            {user.loginCount} inicio{user.loginCount > 1 ? 's' : ''}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.activeSessions !== undefined && user.activeSessions > 0 ? (
                        <span className="text-xs px-2 py-1 bg-green-500/10 text-green-600 rounded-full font-medium">
                          {user.activeSessions} activa{user.activeSessions > 1 ? 's' : ''}
                        </span>
                      ) : (
                        <span className="text-xs text-content-tertiary">Sin sesiones</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => {
                          window.location.href = `/admin/usuarios/${user.id}/editar`;
                        }}
                        className="text-primary hover:text-primary/80 mr-4 cursor-pointer"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        disabled={user.role === "ADMIN"}
                        className="text-error hover:text-error/80 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* Controles de paginación */}
            {totalPages > 1 && (
              <div
                className={`mt-6 ${loading ? "opacity-50 pointer-events-none" : ""}`}
              >
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  showFirstLast={totalPages > 5}
                />
              </div>
            )}
          </div>
        </div>
      )}
      {ConfirmDialog}
    </div>
  );
}
