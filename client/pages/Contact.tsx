import Layout from "@/components/Layout";
import { useLanguage } from "@/contexts/LanguageContext";
import { getTranslation } from "@/lib/translations";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { useState } from "react";

export default function Contact() {
  const { language } = useLanguage();
  const t = (key: string) => getTranslation(language, key);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Open email client with pre-filled subject and body
    const emailBody = `Name: ${formData.name}\n\n${formData.message}`;
    window.location.href = `mailto:contato@herestomorrow.com?subject=Contact from ${formData.name}&body=${encodeURIComponent(emailBody)}`;
    setFormData({ name: "", email: "", message: "" });
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary via-primary-dark to-primary text-white py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl mx-auto">
          <h1 className="text-5xl sm:text-6xl font-bold mb-6">
            {t("nav.contact")}
          </h1>
          <p className="text-xl text-white/90 leading-relaxed">
            {t("contact.subtitle")}
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Contact Information */}
            <div>
              <h2 className="text-4xl font-bold text-foreground mb-12">
                {language === "en" && "Get in Touch"}
                {language === "es" && "Ponte en Contacto"}
                {language === "pt" && "Entre em Contato"}
                {language === "it" && "Contattaci"}
                {language === "fr" && "Contactez-nous"}
              </h2>

              {/* Email */}
              <div className="mb-10 pb-10 border-b border-neutral-200">
                <div className="flex items-start space-x-4">
                  <div className="p-4 bg-primary/10 rounded-full flex-shrink-0">
                    <Mail className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-2">
                      {t("contact.email")}
                    </h3>
                    <a
                      href="mailto:contato@herestomorrow.com"
                      className="text-lg text-primary font-semibold hover:text-primary-dark transition-colors duration-300"
                    >
                      contato@herestomorrow.com
                    </a>
                    <p className="text-sm text-muted-foreground mt-2">
                      {language === "en" && "Send us an email"}
                      {language === "es" && "Envíanos un correo electrónico"}
                      {language === "pt" && "Envie-nos um email"}
                      {language === "it" && "Inviaci un'email"}
                      {language === "fr" && "Envoyez-nous un email"}
                    </p>
                  </div>
                </div>
              </div>

              {/* WhatsApp */}
              <div className="mb-10 pb-10 border-b border-neutral-200">
                <div className="flex items-start space-x-4">
                  <div className="p-4 bg-primary/10 rounded-full flex-shrink-0">
                    <Phone className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-2">
                      WhatsApp
                    </h3>
                    <a
                      href="https://wa.me/5511982723837"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-lg text-primary font-semibold hover:text-primary-dark transition-colors duration-300"
                    >
                      +55 (11) 9 8272-3837
                    </a>
                    <p className="text-sm text-muted-foreground mt-2">
                      {language === "en" && "Chat with us on WhatsApp"}
                      {language === "es" && "Chatea con nosotros en WhatsApp"}
                      {language === "pt" && "Converse conosco no WhatsApp"}
                      {language === "it" && "Chatta con noi su WhatsApp"}
                      {language === "fr" && "Discutez avec nous sur WhatsApp"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Location */}
              <div>
                <div className="flex items-start space-x-4">
                  <div className="p-4 bg-primary/10 rounded-full flex-shrink-0">
                    <MapPin className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-2">
                      {language === "en" && "Physical Location"}
                      {language === "es" && "Ubicación Física"}
                      {language === "pt" && "Localização Física"}
                      {language === "it" && "Ubicazione Fisica"}
                      {language === "fr" && "Localisation Physique"}
                    </h3>
                    <p className="text-base text-foreground font-semibold">
                      Rio Grande do Sul
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Vale do Cai & Montenegro
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-neutral-50 rounded-2xl border border-neutral-200 p-10">
              <h2 className="text-2xl font-bold text-foreground mb-8">
                {t("contact.message")}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name Field */}
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-semibold text-foreground mb-2"
                  >
                    {language === "en" && "Your Name"}
                    {language === "es" && "Tu Nombre"}
                    {language === "pt" && "Seu Nome"}
                    {language === "it" && "Tuo Nome"}
                    {language === "fr" && "Votre Nom"}
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder={
                      language === "en"
                        ? "John Doe"
                        : language === "es"
                          ? "Juan Pérez"
                          : language === "pt"
                            ? "João Silva"
                            : language === "it"
                              ? "Giovanni Rossi"
                              : "Jean Dupont"
                    }
                  />
                </div>

                {/* Email Field */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-semibold text-foreground mb-2"
                  >
                    {language === "en" && "Email Address"}
                    {language === "es" && "Dirección de Correo"}
                    {language === "pt" && "Endereço de Email"}
                    {language === "it" && "Indirizzo Email"}
                    {language === "fr" && "Adresse Email"}
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder="example@email.com"
                  />
                </div>

                {/* Message Field */}
                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-semibold text-foreground mb-2"
                  >
                    {language === "en" && "Message"}
                    {language === "es" && "Mensaje"}
                    {language === "pt" && "Mensagem"}
                    {language === "it" && "Messaggio"}
                    {language === "fr" && "Message"}
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
                    placeholder={
                      language === "en"
                        ? "Tell us about your project..."
                        : language === "es"
                          ? "Cuéntanos sobre tu proyecto..."
                          : language === "pt"
                            ? "Conte-nos sobre seu projeto..."
                            : language === "it"
                              ? "Parla dei tuoi progetti..."
                              : "Parlez-nous de votre projet..."
                    }
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center px-8 py-4 bg-primary text-white font-bold rounded-full hover:bg-primary-dark transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  <Send className="mr-2 w-5 h-5" />
                  {language === "en" && "Send Message"}
                  {language === "es" && "Enviar Mensaje"}
                  {language === "pt" && "Enviar Mensagem"}
                  {language === "it" && "Invia Messaggio"}
                  {language === "fr" && "Envoyer un Message"}
                </button>
              </form>

              {/* Alternative Message */}
              <div className="mt-8 p-4 bg-primary/10 rounded-lg border border-primary/20">
                <p className="text-sm text-primary font-semibold text-center">
                  {language === "en" &&
                    "Or contact us directly via email or WhatsApp for a faster response"}
                  {language === "es" &&
                    "O contáctanos directamente por correo electrónico o WhatsApp para una respuesta más rápida"}
                  {language === "pt" &&
                    "Ou entre em contato conosco diretamente por email ou WhatsApp para uma resposta mais rápida"}
                  {language === "it" &&
                    "Oppure contattaci direttamente via email o WhatsApp per una risposta più veloce"}
                  {language === "fr" &&
                    "Ou contactez-nous directement par email ou WhatsApp pour une réponse plus rapide"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
