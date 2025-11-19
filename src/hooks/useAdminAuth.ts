import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function useAdminAuth() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") {
      return;
    } // Todavía cargando

    setIsLoading(false);

    // Si estamos en la página de login y hay sesión, redirigir al dashboard
    if (pathname === "/admin" && session?.user?.isAdmin) {
      router.push("/admin/dashboard");
      return;
    }

    // Si no hay sesión y no estamos en login, redirigir al login
    if (!session && pathname !== "/admin") {
      router.push("/admin");
      return;
    }

    // Si hay sesión pero no es admin, redirigir al home
    if (session && !session.user?.isAdmin) {
      router.push("/");
      return;
    }
  }, [session, status, pathname, router]);

  return {
    session,
    isAdmin: session?.user?.isAdmin || false,
    isLoading: status === "loading" || isLoading,
    isAuthenticated: !!session?.user?.isAdmin,
  };
}

export function useAdminSession() {
  const { data: session, status } = useSession();

  return {
    session,
    isAdmin: session?.user?.isAdmin || false,
    isLoading: status === "loading",
    isAuthenticated: !!session?.user?.isAdmin,
    user: session?.user,
  };
}
