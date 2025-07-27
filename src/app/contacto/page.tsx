"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";
import { Mail, Phone, MapPin, Clock, Send } from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simular envío del formulario
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setIsSubmitting(false);
    setSubmitted(true);
    setFormData({ name: "", email: "", phone: "", message: "" });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="bg-white text-[#333333] min-h-screen">
      <main className="max-w-[1200px] mx-auto py-8 px-6">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1
            className="text-4xl font-bold text-[#333333] mb-4"
            style={{ fontFamily: "'Montserrat', sans-serif" }}>
            Contactanos
          </h1>
          <p className="text-[#666666] text-lg max-w-2xl mx-auto">
            ¿Tienes alguna pregunta o necesitas ayuda? Estamos aquí para
            ayudarte. Ponte en contacto con nosotros y te responderemos lo antes
            posible.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div>
            <h2
              className="text-2xl font-bold text-[#333333] mb-6"
              style={{ fontFamily: "'Montserrat', sans-serif" }}>
              Información de Contacto
            </h2>

            <div className="space-y-6">
              <Card className="bg-[#FAFAFA] border-0 shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-[#E91E63] p-3 rounded-lg">
                      <Mail className="text-white" size={24} />
                    </div>
                    <div>
                      <h3
                        className="font-bold text-lg text-[#333333] mb-2"
                        style={{ fontFamily: "'Montserrat', sans-serif" }}>
                        Email
                      </h3>
                      <p className="text-[#666666]">contacto@rastući.com</p>
                      <p className="text-[#666666]">ventas@rastući.com</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#FAFAFA] border-0 shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-[#E91E63] p-3 rounded-lg">
                      <Phone className="text-white" size={24} />
                    </div>
                    <div>
                      <h3
                        className="font-bold text-lg text-[#333333] mb-2"
                        style={{ fontFamily: "'Montserrat', sans-serif" }}>
                        Teléfono
                      </h3>
                      <p className="text-[#666666]">+54 9 11 1234-5678</p>
                      <p className="text-[#666666]">+54 9 11 8765-4321</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#FAFAFA] border-0 shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-[#E91E63] p-3 rounded-lg">
                      <MapPin className="text-white" size={24} />
                    </div>
                    <div>
                      <h3
                        className="font-bold text-lg text-[#333333] mb-2"
                        style={{ fontFamily: "'Montserrat', sans-serif" }}>
                        Dirección
                      </h3>
                      <p className="text-[#666666]">Av. Corrientes 1234</p>
                      <p className="text-[#666666]">Buenos Aires, Argentina</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#FAFAFA] border-0 shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-[#E91E63] p-3 rounded-lg">
                      <Clock className="text-white" size={24} />
                    </div>
                    <div>
                      <h3
                        className="font-bold text-lg text-[#333333] mb-2"
                        style={{ fontFamily: "'Montserrat', sans-serif" }}>
                        Horarios de Atención
                      </h3>
                      <p className="text-[#666666]">
                        Lunes a Viernes: 9:00 - 18:00
                      </p>
                      <p className="text-[#666666]">Sábados: 9:00 - 14:00</p>
                      <p className="text-[#666666]">Domingos: Cerrado</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <h2
              className="text-2xl font-bold text-[#333333] mb-6"
              style={{ fontFamily: "'Montserrat', sans-serif" }}>
              Envíanos un Mensaje
            </h2>

            {submitted ? (
              <Card className="bg-[#FCE4EC] border-0 shadow-md">
                <CardContent className="p-8 text-center">
                  <div className="text-[#E91E63] mb-4">
                    <Send size={48} className="mx-auto" />
                  </div>
                  <h3
                    className="text-xl font-bold text-[#333333] mb-2"
                    style={{ fontFamily: "'Montserrat', sans-serif" }}>
                    ¡Mensaje Enviado!
                  </h3>
                  <p className="text-[#666666] mb-4">
                    Gracias por contactarnos. Te responderemos dentro de las
                    próximas 24 horas.
                  </p>
                  <Button onClick={() => setSubmitted(false)} variant="hero">
                    Enviar otro mensaje
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-[#FAFAFA] border-0 shadow-md">
                <CardContent className="p-8">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label
                          htmlFor="name"
                          className="block text-sm font-semibold text-[#333333] mb-2"
                          style={{ fontFamily: "'Montserrat', sans-serif" }}>
                          Nombre *
                        </label>
                        <Input
                          id="name"
                          name="name"
                          type="text"
                          required
                          value={formData.name}
                          onChange={handleChange}
                          className="h-12 border-2 border-[#E0E0E0] focus:border-[#E91E63] rounded-lg"
                          placeholder="Tu nombre completo"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="email"
                          className="block text-sm font-semibold text-[#333333] mb-2"
                          style={{ fontFamily: "'Montserrat', sans-serif" }}>
                          Email *
                        </label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          required
                          value={formData.email}
                          onChange={handleChange}
                          className="h-12 border-2 border-[#E0E0E0] focus:border-[#E91E63] rounded-lg"
                          placeholder="tu@email.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="phone"
                        className="block text-sm font-semibold text-[#333333] mb-2"
                        style={{ fontFamily: "'Montserrat', sans-serif" }}>
                        Teléfono
                      </label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        className="h-12 border-2 border-[#E0E0E0] focus:border-[#E91E63] rounded-lg"
                        placeholder="+54 9 11 1234-5678"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="message"
                        className="block text-sm font-semibold text-[#333333] mb-2"
                        style={{ fontFamily: "'Montserrat', sans-serif" }}>
                        Mensaje *
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        required
                        rows={6}
                        value={formData.message}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border-2 border-[#E0E0E0] focus:border-[#E91E63] focus:outline-none rounded-lg resize-none"
                        placeholder="Escribe tu mensaje aquí..."
                      />
                    </div>

                    <Button
                      type="submit"
                      variant="hero"
                      size="xl"
                      fullWidth
                      disabled={isSubmitting}
                      loading={isSubmitting}>
                      {isSubmitting ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Enviando...</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <Send size={20} />
                          <span>Enviar Mensaje</span>
                        </div>
                      )}
                    </Button>

                    <p className="text-xs text-[#757575] text-center">
                      * Campos obligatorios
                    </p>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <h2
            className="text-3xl font-bold text-[#333333] text-center mb-8"
            style={{ fontFamily: "'Montserrat', sans-serif" }}>
            Preguntas Frecuentes
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                question: "¿Cuál es el tiempo de entrega?",
                answer:
                  "Los envíos a todo el país tardan entre 3 a 7 días hábiles, dependiendo de la ubicación.",
              },
              {
                question: "¿Puedo cambiar o devolver un producto?",
                answer:
                  "Sí, aceptamos cambios y devoluciones dentro de los 30 días posteriores a la compra.",
              },
              {
                question: "¿Qué métodos de pago aceptan?",
                answer:
                  "Aceptamos todas las tarjetas de crédito y débito, transferencias bancarias y efectivo.",
              },
              {
                question: "¿Las prendas vienen con garantía?",
                answer:
                  "Todas nuestras prendas cuentan con garantía de calidad por defectos de fabricación.",
              },
            ].map((faq, index) => (
              <Card key={index} className="bg-[#FAFAFA] border-0 shadow-md">
                <CardContent className="p-6">
                  <h3
                    className="font-bold text-lg text-[#333333] mb-3"
                    style={{ fontFamily: "'Montserrat', sans-serif" }}>
                    {faq.question}
                  </h3>
                  <p className="text-[#666666]">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
