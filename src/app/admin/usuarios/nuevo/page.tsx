"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import {
  Eye,
  EyeOff,
  User,
  Mail,
  Lock,
  Shield,
  CheckCircle,
  XCircle,
} from "lucide-react";
import toast from "react-hot-toast";

interface PasswordRequirement {
  met: boolean;
  text: string;
}

export default function CreateUserPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    isAdmin: false,
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordRequirements, setPasswordRequirements] = useState<
    PasswordRequirement[]
  >([
    { met: false, text: "Al menos 8 caracteres" },
    { met: false, text: "Al menos una letra mayúscula" },
    { met: false, text: "Al menos una letra minúscula" },
    { met: false, text: "Al menos un número" },
    { met: false, text: "Al menos un carácter especial (!@#$%^&*)" },
  ]);

  const validatePassword = (password: string) => {
    const requirements = [
      { met: password.length >= 8, text: "Al menos 8 caracteres" },
      { met: /[A-Z]/.test(password), text: "Al menos una letra mayúscula" },
      { met: /[a-z]/.test(password), text: "Al menos una letra minúscula" },
      { met: /\d/.test(password), text: "Al menos un número" },
      {
        met: /[!@#$%^&*]/.test(password),
        text: "Al menos un carácter especial (!@#$%^&*)",
      },
    ];
    setPasswordRequirements(requirements);
    return requirements.every((req) => req.met);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validaciones
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

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          isAdmin: formData.isAdmin,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Usuario creado exitosamente");
        router.push("/admin/usuarios");
      } else {
        toast.error(data.error || "Error al crear el usuario");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al crear el usuario");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));

    // Validar contraseña en tiempo real
    if (name === "password") {
      validatePassword(value);
    }
  };

  const isPasswordValid = passwordRequirements.every((req) => req.met);
  const passwordsMatch =
    formData.password === formData.confirmPassword &&
    formData.confirmPassword.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#E91E63] rounded-full mb-4">
            <User className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            Crear Nuevo Usuario
          </h1>
          <p className="text-gray-600 mt-2">
            Completa el formulario para añadir un nuevo usuario al sistema
          </p>
        </div>

        <Card className="shadow-lg border-0">
          <CardHeader className="bg-gradient-to-r from-[#E91E63] to-[#C2185B] text-white rounded-t-lg">
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
                  className="block text-sm font-medium text-gray-700 mb-2">
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
                  className="transition-all duration-200 focus:ring-2 focus:ring-[#E91E63] focus:border-[#E91E63]"
                />
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2">
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
                  className="transition-all duration-200 focus:ring-2 focus:ring-[#E91E63] focus:border-[#E91E63]"
                />
              </div>

              {/* Contraseña */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-2">
                  <Lock className="h-4 w-4 inline mr-2" />
                  Contraseña
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder="Ingresa una contraseña segura"
                    className="pr-10 transition-all duration-200 focus:ring-2 focus:ring-[#E91E63] focus:border-[#E91E63]"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                    onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>

                {/* Requisitos de contraseña */}
                {formData.password && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-md">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Requisitos de contraseña:
                    </p>
                    <div className="space-y-1">
                      {passwordRequirements.map((req, index) => (
                        <div key={index} className="flex items-center gap-2">
                          {req.met ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                          <span
                            className={`text-sm ${
                              req.met ? "text-green-700" : "text-red-700"
                            }`}>
                            {req.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Confirmar Contraseña */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700 mb-2">
                  <Lock className="h-4 w-4 inline mr-2" />
                  Confirmar Contraseña
                </label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    placeholder="Confirma la contraseña"
                    className={`pr-10 transition-all duration-200 focus:ring-2 focus:ring-[#E91E63] focus:border-[#E91E63] ${
                      formData.confirmPassword && !passwordsMatch
                        ? "border-red-300"
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
                      <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>

                {/* Indicador de coincidencia */}
                {formData.confirmPassword && (
                  <div className="mt-2 flex items-center gap-2">
                    {passwordsMatch ? (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-green-700">
                          Las contraseñas coinciden
                        </span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 text-red-500" />
                        <span className="text-sm text-red-700">
                          Las contraseñas no coinciden
                        </span>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Checkbox Admin */}
              <div className="flex items-center p-4 bg-yellow-50 rounded-md border border-yellow-200">
                <input
                  id="isAdmin"
                  name="isAdmin"
                  type="checkbox"
                  checked={formData.isAdmin}
                  onChange={handleChange}
                  className="h-4 w-4 text-[#E91E63] focus:ring-[#E91E63] border-gray-300 rounded"
                />
                <label
                  htmlFor="isAdmin"
                  className="ml-3 block text-sm text-gray-900">
                  <Shield className="h-4 w-4 inline mr-1" />
                  Otorgar permisos de administrador
                </label>
              </div>

              {/* Botones */}
              <div className="flex gap-4 pt-6">
                <Button
                  type="submit"
                  disabled={loading || !isPasswordValid || !passwordsMatch}
                  className="flex-1 bg-gradient-to-r from-[#E91E63] to-[#C2185B] hover:from-[#C2185B] hover:to-[#AD1457] text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creando Usuario...
                    </>
                  ) : (
                    <>
                      <User className="h-4 w-4 mr-2" />
                      Crear Usuario
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/admin/usuarios")}
                  className="flex-1 border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-all duration-200">
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
