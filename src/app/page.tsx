"use client";

import { HeroSection } from "@/components/home/HeroSection";
import { CategoriesSection } from "@/components/home/CategoriesSection";
import { FeaturedProductsSection } from "@/components/home/FeaturedProductsSection";
import { BenefitsSection } from "@/components/home/BenefitsSection";
import { EmptyStateSection } from "@/components/home/EmptyStateSection";
import { useHomeData } from "@/hooks/useHomeData";

export default function Home() {
  const { categories, products, home, loading } = useHomeData();

  const hasCategories = categories.length > 0;
  const hasProducts = products && products.length > 0;

  return (
    <div className="surface-secondary font-poppins">
      <main>
        {/* Hero Section - Siempre renderizado */}
        <HeroSection home={home} loading={loading} />

        {/* Categories Section */}
        <CategoriesSection 
          categories={categories} 
          home={home} 
          loading={loading} 
        />

        {/* Featured Products */}
        <FeaturedProductsSection 
          products={products} 
          home={home} 
          loading={loading} 
        />

        {/* Estado vacío cuando no hay productos ni categorías */}
        <EmptyStateSection 
          showProducts={hasProducts} 
          showCategories={hasCategories} 
        />

        {/* Promotional Banner - Benefits from settings */}
        <BenefitsSection home={home} />
      </main>
    </div>
  );
}
