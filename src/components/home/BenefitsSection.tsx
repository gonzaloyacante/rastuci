import { Truck, CreditCard, ShieldCheck } from "lucide-react";
import { type HomeSettings, defaultHomeSettings } from "@/lib/validation/home";

interface BenefitsSectionProps {
  home?: HomeSettings;
}

export function BenefitsSection({ home }: BenefitsSectionProps) {
  const benefits = home?.benefits || defaultHomeSettings.benefits;

  return (
    <section className="py-12 px-6" aria-labelledby="benefits-title">
      <div className="max-w-[1200px] mx-auto">
        <h2 id="benefits-title" className="sr-only">
          Beneficios de compra
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {benefits.map((benefit, idx) => {
            const IconComponent = benefit.icon === "truck" 
              ? Truck 
              : benefit.icon === "credit" 
                ? CreditCard 
                : ShieldCheck;

            return (
              <div className="flex flex-col items-center" key={idx}>
                <IconComponent 
                  size={48} 
                  className="text-primary mb-3" 
                  aria-hidden="true" 
                />
                <h3 className="font-bold text-lg font-montserrat">
                  {benefit.title}
                </h3>
                <p className="text-sm muted">
                  {benefit.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}