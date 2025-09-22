"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import {
  User,
  Mail,
  Lock,
  Shield,
  Save,
  ArrowLeft,
  Eye,
  EyeOff,
} from "lucide-react";
import toast from "react-hot-toast";

// Interface local para tipado
interface UserType {
  id: string;
  name: string | null;
  email: string | null;
  emailVerified: Date | null;
  image: string | null;
  password: string | null;
  isAdmin: boolean;
}

interface UserEditFormProps {
  initialData: UserType;
}

export default function UserEditForm({ initialData }: UserEditFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: initialData.name || "",
    email: initialData.email || "",
    password: "",
    confirmPassword: "",
    isAdmin: initialData.isAdmin,
    changePassword: false,
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validatePassword = (password: string) => {
    if (!formData.changePassword) return true;
    const requirements = [
      password.length >= 8,
      /[A-Z]/.test(password),
      /[a-z]/.test(password),
      /\d/.test(password),
      /[!@#$%^&*]/.test(password),
    ];
    return requirements.every((req) => req);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validaciones
    if (formData.changePassword) {
      if (!validatePassword(formData.password)) {
        toast.error("La contraseña no cumple con los requisitos de seguridad");
        setLoading(false);
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        toast.error("Las contraseñas no coinciden");
        setLoading(false);
        return;
      }
    }

    try {
      const updateData: {
        name: string;
        email: string;
        isAdmin: boolean;
        password?: string;
      } = {
        name: formData.name,
        email: formData.email,
        isAdmin: formData.isAdmin,
      };

      if (formData.changePassword) {
        updateData.password = formData.password;
      }

      const response = await fetch(`/api/users/${initialData.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Usuario actualizado exitosamente");
        router.push("/admin/usuarios");
      } else {
        toast.error(data.error || "Error al actualizar el usuario");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al actualizar el usuario");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const isPasswordValid =
    !formData.changePassword || validatePassword(formData.password);
  const passwordsMatch =
    !formData.changePassword ||
    (formData.password === formData.confirmPassword &&
      formData.confirmPassword.length > 0);

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 pill-icon mb-4">
            <User className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-primary">Editar Usuario</h1>
          <p className="muted mt-2">
            Modifica la información del usuario
          </p>
        </div>

        <Card className="shadow-lg border border-muted">
          <CardHeader className="surface text-primary rounded-t-lg border-b border-muted">
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Información del Usuario
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Nombre */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium muted mb-2">
                  <User className="h-4 w-4 inline mr-2" />
                  Nombre Completo
                </label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Ingresa el nombre completo"
                />
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium muted mb-2">
                  <Mail className="h-4 w-4 inline mr-2" />
                  Correo Electrónico
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="usuario@ejemplo.com"
                />
              </div>

              {/* Cambiar Contraseña */}
              <div className="flex items-center p-4 surface rounded-md border border-muted">
                <input
                  id="changePassword"
                  name="changePassword"
                  type="checkbox"
                  checked={formData.changePassword}
                  onChange={handleChange}
                  className="h-4 w-4 rounded"
                />
                <label
                  htmlFor="changePassword"
                  className="ml-3 block text-sm text-primary">
                  <Lock className="h-4 w-4 inline mr-1" />
                  Cambiar contraseña
                </label>
              </div>

              {/* Contraseña - Solo si se quiere cambiar */}
              {formData.changePassword && (
                <>
                  <div>
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium muted mb-2">
                      <Lock className="h-4 w-4 inline mr-2" />
                      Nueva Contraseña
                    </label>
                    <div className="relative">
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={handleChange}
                        required
                        placeholder="Ingresa una nueva contraseña"
                        className="pr-10"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 flex items-center pr-3"
                        onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 muted hover:text-primary" />
                        ) : (
                          <Eye className="h-4 w-4 muted hover:text-primary" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="block text-sm font-medium muted mb-2">
                      <Lock className="h-4 w-4 inline mr-2" />
                      Confirmar Nueva Contraseña
                    </label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                        placeholder="Confirma la nueva contraseña"
                        className={`pr-10 ${
                          formData.confirmPassword && !passwordsMatch
                            ? "border-error"
                            : ""
                        }`}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 flex items-center pr-3"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }>
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4 muted hover:text-primary" />
                        ) : (
                          <Eye className="h-4 w-4 muted hover:text-primary" />
                        )}
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* Checkbox Admin */}
              <div className="flex items-center p-4 surface rounded-md border border-muted">
                <input
                  id="isAdmin"
                  name="isAdmin"
                  type="checkbox"
                  checked={formData.isAdmin}
                  onChange={handleChange}
                  className="h-4 w-4 rounded"
                />
                <label
                  htmlFor="isAdmin"
                  className="ml-3 block text-sm text-primary">
                  <Shield className="h-4 w-4 inline mr-1" />
                  Permisos de administrador
                </label>
              </div>

              {/* Botones */}
              <div className="flex gap-4 pt-6">
                <Button
                  type="submit"
                  disabled={loading || !isPasswordValid || !passwordsMatch}
                  className="flex-1 btn-hero">
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Actualizando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Actualizar Usuario
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/admin/usuarios")}
                  className="flex-1 flex items-center justify-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Volver
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
