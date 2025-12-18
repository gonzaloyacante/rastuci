"use client";

import { Card, CardContent } from "@/components/ui/Card";
import { useEffect, useState } from "react";

export const FaqSection = () => {
    const [faqs, setFaqs] = useState<Array<{ question: string; answer: string }>>([]);

    useEffect(() => {
        fetch('/api/settings/faqs')
            .then(res => res.json())
            .then(data => {
                if (data.success && data.data) {
                    setFaqs(data.data);
                }
            })
            .catch(err => console.error('Error loading FAQs:', err));
    }, []);

    if (!faqs || faqs.length === 0) return null;

    return (
        <div className="mt-16">
            <h2 className="text-3xl text-center mb-8 font-montserrat">
                Preguntas Frecuentes
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {faqs.map((faq) => (
                    <Card
                        key={`faq-${faq.question.slice(0, 20)}`}
                        className="surface border border-theme rounded-xl shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-200"
                    >
                        <CardContent className="p-6">
                            <h3 className="text-lg mb-3 font-montserrat">{faq.question}</h3>
                            <p className="muted">{faq.answer}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};
