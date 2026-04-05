"use client";

import { Edit3, Shield, Trash2, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  AdminEmpty,
  AdminEmptyIcons,
  AdminError,
  AdminPageHeader,
} from "@/components/admin";
import { UsersSkeleton } from "@/components/admin/skeletons";
import { SearchBar } from "@/components/search";
import { Button } from "@/components/ui/Button";
import { useConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Pagination } from "@/components/ui/Pagination";
import { useDocumentTitle } from "@/hooks";
import { User, useUsers } from "@/hooks/useUsers";

export default function UsuariosPage() {
  useDocumentTitle({ title: "Usuarios" });
  const router = useRouter();
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
  const handleSearch = (value?: string) => {
    const term = value ?? searchInput;
    void fetchUsers({ page: 1, limit: 20, search: term });
  };

  // Paginación
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) {
      return;
    }
    void fetchUsers({ page, limit: 20, search: searchInput });
  };

  const getRoleBadge = (role: string) => {
    return role === "ADMIN"
      ? { variant: "warning" as const, label: "Administrador" }
      : { variant: "info" as const, label: "Usuario" };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-AR", {
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
            onClick: () => router.push("/admin/usuarios/nuevo"),
            variant: "primary",
          },
        ]}
      />

      {/* Stats resumidos */}
      {Array.isArray(users) && users.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="bg-surface border border-border rounded-lg p-3 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Users className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-content-secondary">Total</p>
              <p className="text-lg font-bold text-content-primary">
                {users.length}
              </p>
            </div>
          </div>
          <div className="bg-surface border border-border rounded-lg p-3 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <Shield className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-content-secondary">Admins</p>
              <p className="text-lg font-bold text-content-primary">
                {users.filter((u: User) => u.role === "ADMIN").length}
              </p>
            </div>
          </div>
          <div className="bg-surface border border-border rounded-lg p-3 flex items-center gap-3 col-span-2 sm:col-span-1">
            <div className="p-2 rounded-lg bg-emerald-500/10">
              <Users className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-content-secondary">Usuarios</p>
              <p className="text-lg font-bold text-content-primary">
                {users.filter((u: User) => u.role === "USER").length}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Barra de búsqueda */}
      <SearchBar
        value={searchInput}
        onChange={(value) => {
          setSearchInput(value);
          if (!value.trim()) handleSearch("");
        }}
        onSearch={handleSearch}
        placeholder="Buscar usuarios por nombre o email..."
      />

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
            onClick: () => router.push("/admin/usuarios/nuevo"),
            variant: "primary",
          }}
        />
      ) : null}

      {/* Mostrar tabla/cards solo si hay usuarios */}
      {Array.isArray(users) && users.length > 0 && (
        <div className="card">
          {/* Vista de cards para mobile/tablet */}
          <div className="block xl:hidden space-y-3">
            {users.map((user: User) => (
              <div
                key={user.id}
                className="bg-surface border border-border rounded-xl p-4 space-y-3 hover:shadow-md transition-all duration-200 hover:border-primary/20"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-semibold shrink-0">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-content-primary truncate">
                      {user.name}
                    </h3>
                    <p className="text-sm text-content-secondary truncate">
                      {user.email}
                    </p>
                  </div>
                  <span
                    className={`badge-${getRoleBadge(user.role).variant} text-xs shrink-0`}
                  >
                    {getRoleBadge(user.role).label}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-content-tertiary pt-2 border-t border-border">
                  <span>Creado: {formatDate(user.createdAt)}</span>
                  {user.lastLoginAt && (
                    <span>Último login: {formatDate(user.lastLoginAt)}</span>
                  )}
                </div>
                <div className="flex gap-2 pt-1">
                  <Button
                    onClick={() =>
                      router.push(`/admin/usuarios/${user.id}/editar`)
                    }
                    variant="secondary"
                    size="sm"
                    className="flex-1 text-xs"
                  >
                    <Edit3 className="w-3.5 h-3.5 mr-1" />
                    Editar
                  </Button>
                  <Button
                    onClick={() => handleDelete(user.id)}
                    disabled={user.role === "ADMIN"}
                    variant="destructive"
                    size="sm"
                    className="flex-1 text-xs"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1" />
                    Eliminar
                  </Button>
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
                        {user.loginCount !== undefined &&
                          user.loginCount > 0 && (
                            <div className="text-content-tertiary text-xs">
                              {user.loginCount} inicio
                              {user.loginCount > 1 ? "s" : ""}
                            </div>
                          )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs flex items-center gap-1"
                          onClick={() =>
                            router.push(`/admin/usuarios/${user.id}/editar`)
                          }
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Editar</span>
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="text-xs flex items-center gap-1"
                          onClick={() => handleDelete(user.id)}
                          disabled={user.role === "ADMIN"}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Eliminar</span>
                        </Button>
                      </div>
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
