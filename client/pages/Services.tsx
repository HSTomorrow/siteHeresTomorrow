import Layout from "@/components/Layout";
import { useLanguage } from "@/contexts/LanguageContext";
import { getTranslation } from "@/lib/translations";
import {
  Server,
  Users,
  Lightbulb,
  Building2,
  BarChart3,
  GitBranch,
  Cloud,
  Zap,
} from "lucide-react";

const serviceIcons = {
  restructuring: <Building2 className="w-8 h-8" />,
  businessPlans: <BarChart3 className="w-8 h-8" />,
  digitalTransformation: <Zap className="w-8 h-8" />,
  erp: <Server className="w-8 h-8" />,
  businessProcess: <GitBranch className="w-8 h-8" />,
  innovation: <Lightbulb className="w-8 h-8" />,
  crm: <Users className="w-8 h-8" />,
  cloudMigration: <Cloud className="w-8 h-8" />,
};

export default function Services() {
  const { language } = useLanguage();
  const t = (key: string) => getTranslation(language, key);

  const services = [
    { key: "restructuring", icon: serviceIcons.restructuring },
    { key: "businessPlans", icon: serviceIcons.businessPlans },
    { key: "digitalTransformation", icon: serviceIcons.digitalTransformation },
    { key: "erp", icon: serviceIcons.erp },
    { key: "businessProcess", icon: serviceIcons.businessProcess },
    { key: "innovation", icon: serviceIcons.innovation },
    { key: "crm", icon: serviceIcons.crm },
    { key: "cloudMigration", icon: serviceIcons.cloudMigration },
  ];

  return (
    <Layout>
      {/* Header Section */}
      <section className="relative bg-gradient-to-br from-primary via-primary-dark to-primary text-white py-20 sm:py-28 overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 -left-20 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl sm:text-6xl font-bold mb-6 font-poppins">
            {t("services.title")}
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            {t("services.subtitle")}
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service) => (
              <div
                key={service.key}
                className="group p-8 rounded-2xl bg-white border border-neutral-200 hover:border-primary hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 cursor-pointer flex flex-col"
              >
                <div className="text-primary mb-6 p-4 bg-primary/10 rounded-full w-fit group-hover:bg-primary group-hover:text-white transition-all duration-300">
                  {service.icon}
                </div>
                <h3 className="text-lg font-bold text-foreground mb-3">
                  {t(`services.${service.key}.title`)}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed flex-grow">
                  {t(`services.${service.key}.desc`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-24 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
              Why Choose HeresTomorrow
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We combine strategic expertise with cutting-edge technology to deliver transformational results
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl border border-neutral-200 p-8 hover:border-primary hover:shadow-lg hover:shadow-primary/10 transition-all duration-300">
              <div className="text-primary text-4xl mb-4 font-bold">01</div>
              <h3 className="text-xl font-bold text-foreground mb-3">
                Proven Expertise
              </h3>
              <p className="text-muted-foreground">
                Deep experience in enterprise transformation, business process optimization, and technology implementation across multiple industries.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-neutral-200 p-8 hover:border-primary hover:shadow-lg hover:shadow-primary/10 transition-all duration-300">
              <div className="text-primary text-4xl mb-4 font-bold">02</div>
              <h3 className="text-xl font-bold text-foreground mb-3">
                Customized Solutions
              </h3>
              <p className="text-muted-foreground">
                Tailored consulting approaches that align with your specific business needs, industry context, and growth objectives.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-neutral-200 p-8 hover:border-primary hover:shadow-lg hover:shadow-primary/10 transition-all duration-300">
              <div className="text-primary text-4xl mb-4 font-bold">03</div>
              <h3 className="text-xl font-bold text-foreground mb-3">
                AI-Driven Innovation
              </h3>
              <p className="text-muted-foreground">
                Leveraging artificial intelligence and advanced analytics to drive insights and accelerate digital transformation initiatives.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-primary via-primary-dark to-primary text-white">
        <div className="max-w-3xl mx-auto text-center px-4">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">
            Ready to Transform Your Business?
          </h2>
          <p className="text-xl text-white/90 mb-8 leading-relaxed">
            Let's discuss how HeresTomorrow can help you achieve your strategic goals
          </p>
          <a
            href="/contact"
            className="inline-flex items-center justify-center px-10 py-4 bg-white text-primary font-bold rounded-full hover:bg-neutral-100 transition-all duration-300 transform hover:scale-105"
          >
            Get in Touch
          </a>
        </div>
      </section>
    </Layout>
  );
}
