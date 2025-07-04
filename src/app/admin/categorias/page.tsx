"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Category } from "@prisma/client";
import { toast } from "react-hot-toast";
import axios from "axios";

export default function AdminCategoriasPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [categoryProducts, setCategoryProducts] = useState<
    Record<string, number>
  >({});

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      const data = await response.json();
      if (data.success) {
        setCategories(data.data);

        // Obtener conteo de productos por categoría
        const productsResponse = await fetch("/api/products?limit=100");
        const productsData = await productsResponse.json();

        if (productsData.success) {
          const products = productsData.data.data;
          const productCounts: Record<string, number> = {};

          products.forEach((product: { categoryId: string }) => {
            const categoryId = product.categoryId;
            productCounts[categoryId] = (productCounts[categoryId] || 0) + 1;
          });

          setCategoryProducts(productCounts);
        }
      } else {
        console.error("Error al obtener categorías:", data.error);
      }
    } catch (error) {
      console.error("Error al obtener categorías:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar esta categoría?")) {
      return;
    }

    try {
      setDeleting(id);
      await axios.delete(`/api/categories/${id}`);
      toast.success("Categoría eliminada exitosamente");
      // Actualizar la lista de categorías
      setCategories(categories.filter((category) => category.id !== id));
    } catch (error: unknown) {
      console.error("Error al eliminar la categoría:", error);
      if (axios.isAxiosError(error) && error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error("Error al eliminar la categoría");
      }
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Gestión de Categorías</h1>
        <Link href="/admin/categorias/nueva">
          <Button>Crear Categoría</Button>
        </Link>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">Cargando categorías...</div>
        ) : categories.length === 0 ? (
          <div className="p-8 text-center">
            No hay categorías. ¡Crea tu primera categoría!
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Descripción
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Productos
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Acciones</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categories.map((category) => (
                <tr key={category.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {category.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {category.description || "Sin descripción"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {categoryProducts[category.id] || 0} productos
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      href={`/admin/categorias/${category.id}/editar`}
                      className="text-indigo-600 hover:text-indigo-900 mr-4">
                      Editar
                    </Link>
                    <button
                      onClick={() => handleDelete(category.id)}
                      disabled={
                        deleting === category.id ||
                        (categoryProducts[category.id] || 0) > 0
                      }
                      className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed">
                      {deleting === category.id ? "Eliminando..." : "Eliminar"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
