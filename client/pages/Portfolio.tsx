import Layout from "@/components/Layout";
import Logo from "@/components/Logo";
import { useLanguage } from "@/contexts/LanguageContext";
import { getTranslation } from "@/lib/translations";
import { useRef, useState } from "react";
import {
  Workflow,
  Smartphone,
  BrainCircuit,
  Infinity as InfinityIcon,
  Cloud,
  Search,
  BarChart3,
  PenTool,
  Rocket,
  TrendingUp,
  Share2,
  Printer,
  Loader2,
  Mail,
  Phone,
} from "lucide-react";

const page1CardKeys = ["strategy", "solutions", "ai", "transformation"] as const;
const page1CardIcons: Record<(typeof page1CardKeys)[number], JSX.Element> = {
  strategy: <Workflow className="w-5 h-5" />,
  solutions: <Smartphone className="w-5 h-5" />,
  ai: <BrainCircuit className="w-5 h-5" />,
  transformation: <InfinityIcon className="w-5 h-5" />,
};

const capabilityKeys = ["apps", "ai", "erp", "cloud"] as const;
const capabilityIcons: Record<(typeof capabilityKeys)[number], JSX.Element> = {
  apps: <Smartphone className="w-4 h-4" />,
  ai: <BrainCircuit className="w-4 h-4" />,
  erp: <InfinityIcon className="w-4 h-4" />,
  cloud: <Cloud className="w-4 h-4" />,
};

const stepKeys = ["understand", "structure", "create", "implement", "evolve"] as const;
const stepIcons: Record<(typeof stepKeys)[number], JSX.Element> = {
  understand: <Search className="w-5 h-5" />,
  structure: <BarChart3 className="w-5 h-5" />,
  create: <PenTool className="w-5 h-5" />,
  implement: <Rocket className="w-5 h-5" />,
  evolve: <TrendingUp className="w-5 h-5" />,
};

const expertiseKeys = ["transformation", "innovation", "growth"] as const;
const expertiseIcons: Record<(typeof expertiseKeys)[number], JSX.Element> = {
  transformation: <Share2 className="w-5 h-5" />,
  innovation: <BrainCircuit className="w-5 h-5" />,
  growth: <TrendingUp className="w-5 h-5" />,
};

export default function Portfolio() {
  const { language } = useLanguage();
  const t = (key: string) => getTranslation(language, key);
  const page1Ref = useRef<HTMLDivElement>(null);
  const page2Ref = useRef<HTMLDivElement>(null);
  const [isSharing, setIsSharing] = useState(false);

  const buildPdf = async () => {
    const { default: jsPDF } = await import("jspdf");
    const { default: html2canvas } = await import("html2canvas");

    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const sheets = [page1Ref.current, page2Ref.current].filter(
      (el): el is HTMLDivElement => !!el,
    );

    // Each sheet is one logical page of the document, so it is scaled to
    // fit entirely on a single A4 page rather than sliced across pages.
    for (let i = 0; i < sheets.length; i++) {
      const canvas = await html2canvas(sheets[i], {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });
      const imgData = canvas.toDataURL("image/jpeg", 0.92);
      const canvasRatio = canvas.height / canvas.width;

      let renderWidth = pageWidth;
      let renderHeight = pageWidth * canvasRatio;
      if (renderHeight > pageHeight) {
        renderHeight = pageHeight;
        renderWidth = pageHeight / canvasRatio;
      }
      const x = (pageWidth - renderWidth) / 2;
      const y = (pageHeight - renderHeight) / 2;

      if (i > 0) pdf.addPage();
      pdf.addImage(imgData, "JPEG", x, y, renderWidth, renderHeight);
    }

    return pdf;
  };

  const handleShare = async () => {
    if (isSharing) return;
    setIsSharing(true);
    try {
      const pdf = await buildPdf();
      const fileName = "Here's Tomorrow - Portfolio.pdf";
      const pdfBlob = pdf.output("blob");
      const file = new File([pdfBlob], fileName, { type: "application/pdf" });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: t("portfolio.page1.titleLine1"),
          text: t("portfolio.page1.intro"),
        });
      } else {
        const url = URL.createObjectURL(pdfBlob);
        const link = document.createElement("a");
        link.href = url;
        link.download = fileName;
        link.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      if ((error as Error)?.name !== "AbortError") {
        console.error("Failed to generate/share PDF", error);
      }
    } finally {
      setIsSharing(false);
    }
  };

  const Letterhead = () => (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-neutral-900 pb-6 mb-8 print:pb-4 print:mb-6">
      <Logo variant="full" responsive={false} />
      <div className="text-left sm:text-right text-xs text-muted-foreground">
        <p>{t("website")}</p>
        <p>{t("email")}</p>
      </div>
    </div>
  );

  const FooterStrip = ({ page }: { page: string }) => (
    <div className="mt-10 pt-4 border-t border-neutral-200 flex items-center justify-between text-[10px] text-muted-foreground print:mt-4 print:pt-3">
      <span>
        {t("company")} • {t("portfolio.footerTagline")}
      </span>
      <span className="font-semibold text-foreground">{page}</span>
    </div>
  );

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 print:py-0 print:px-0 print:max-w-none">
        {/* Action bar (hidden when printing) */}
        <div className="print:hidden flex flex-wrap justify-end gap-3 mb-8">
          <button
            onClick={handleShare}
            disabled={isSharing}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-primary border-2 border-primary font-bold rounded-full hover:bg-primary/10 transition-all duration-300 shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSharing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Share2 className="w-4 h-4" />
            )}
            {t("portfolio.shareButton")}
          </button>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-full hover:bg-primary-dark transition-all duration-300 shadow-lg"
          >
            <Printer className="w-4 h-4" />
            {t("portfolio.printButton")}
          </button>
        </div>

        {/* Page 1 */}
        <div className="print:break-after-page">
          <div
            ref={page1Ref}
            className="bg-white rounded-2xl border border-neutral-200 shadow-lg p-8 sm:p-12 print:rounded-none print:border-0 print:shadow-none print:p-0 flex flex-col"
          >
            <Letterhead />

            <p className="text-xs font-bold tracking-widest text-primary mb-4 print:text-[10px]">
              {t("portfolio.page1.eyebrow")}
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground leading-tight mb-4 print:text-2xl">
              {t("portfolio.page1.titleLine1")}
              <br />
              {t("portfolio.page1.titleLine2")}
            </h1>
            <p className="text-base text-muted-foreground leading-relaxed max-w-xl mb-10 print:text-sm print:mb-6">
              {t("portfolio.page1.intro")}
            </p>

            <p className="text-xs font-bold tracking-widest text-primary mb-1 print:text-[10px]">
              {t("portfolio.page1.sectionLabel")}
            </p>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2 print:text-lg print:break-after-avoid">
              {t("portfolio.page1.sectionTitle")}
            </h2>
            <p className="text-sm text-muted-foreground mb-6 max-w-2xl print:mb-4">
              {t("portfolio.page1.sectionText")}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-10 print:gap-3 print:mb-6">
              {page1CardKeys.map((key, i) => (
                <div
                  key={key}
                  className="p-5 rounded-xl border border-neutral-200 print:p-3 print:border-neutral-300 print:break-inside-avoid"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 text-foreground">
                      <span className="text-primary print:text-foreground">
                        {page1CardIcons[key]}
                      </span>
                      <h3 className="text-sm font-bold">
                        {t(`portfolio.page1.cards.${key}.title`)}
                      </h3>
                    </div>
                    <span className="text-xs font-bold text-muted-foreground">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {t(`portfolio.page1.cards.${key}.desc`)}
                  </p>
                </div>
              ))}
            </div>

            <p className="text-xs font-bold tracking-widest text-primary mb-3 print:text-[10px]">
              {t("portfolio.page1.capabilitiesLabel")}
            </p>
            <div className="flex flex-wrap gap-3 mb-10 print:gap-2 print:mb-6">
              {capabilityKeys.map((key) => (
                <div
                  key={key}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-neutral-200 text-sm font-semibold text-foreground print:px-3 print:py-1 print:text-xs"
                >
                  <span className="text-primary print:text-foreground">
                    {capabilityIcons[key]}
                  </span>
                  {t(`portfolio.page1.capabilities.${key}`)}
                </div>
              ))}
            </div>

            <div className="mt-auto rounded-2xl bg-neutral-900 text-white p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:p-4 print:break-inside-avoid">
              <div>
                <h3 className="text-base sm:text-lg font-bold mb-1">
                  {t("portfolio.page1.ctaTitle")}
                </h3>
                <p className="text-sm text-white/70">
                  {t("portfolio.page1.ctaText")}
                </p>
              </div>
              <span className="text-sm font-bold whitespace-nowrap">
                {t("portfolio.page1.ctaLink")}
              </span>
            </div>

            <FooterStrip page="01" />
          </div>
        </div>

        {/* Spacer between sheets on screen only */}
        <div className="h-10 print:hidden" />

        {/* Page 2 */}
        <div>
          <div
            ref={page2Ref}
            className="bg-white rounded-2xl border border-neutral-200 shadow-lg p-8 sm:p-12 print:rounded-none print:border-0 print:shadow-none print:p-0 flex flex-col"
          >
            <Letterhead />

            <p className="text-xs font-bold tracking-widest text-primary mb-4 print:text-[10px]">
              {t("portfolio.page2.eyebrow")}
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground leading-tight mb-4 print:text-2xl">
              {t("portfolio.page2.title")}
            </h1>
            <p className="text-base text-muted-foreground leading-relaxed max-w-xl mb-8 print:text-sm print:mb-5">
              {t("portfolio.page2.text")}
            </p>

            <div className="mb-10 rounded-2xl bg-primary/5 border border-primary/20 p-6 flex items-start gap-4 print:mb-6 print:p-3 print:bg-transparent print:border-neutral-300 print:break-inside-avoid">
              <BrainCircuit className="w-6 h-6 text-primary flex-shrink-0 mt-1 print:text-foreground" />
              <div>
                <h3 className="text-base font-bold text-foreground mb-1 print:text-sm">
                  {t("portfolio.page2.highlightTitle")}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t("portfolio.page2.highlightText")}
                </p>
              </div>
            </div>

            <p className="text-xs font-bold tracking-widest text-primary mb-1 print:text-[10px]">
              {t("portfolio.page2.sectionLabel")}
            </p>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-6 print:text-lg print:mb-4 print:break-after-avoid">
              {t("portfolio.page2.sectionTitle")}
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-10 print:gap-2 print:mb-6">
              {stepKeys.map((key, i) => (
                <div
                  key={key}
                  className="p-4 rounded-xl border border-neutral-200 flex flex-col gap-2 print:p-2 print:border-neutral-300 print:break-inside-avoid"
                >
                  <span className="text-primary print:text-foreground">
                    {stepIcons[key]}
                  </span>
                  <h3 className="text-xs font-bold tracking-wide text-foreground uppercase">
                    {t(`portfolio.page2.steps.${key}.title`)}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed flex-1">
                    {t(`portfolio.page2.steps.${key}.desc`)}
                  </p>
                  <span className="text-[10px] font-bold text-muted-foreground">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
              ))}
            </div>

            <p className="text-xs font-bold tracking-widest text-primary mb-3 print:text-[10px]">
              {t("portfolio.page2.expertiseLabel")}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10 print:gap-3 print:mb-6">
              {expertiseKeys.map((key) => (
                <div
                  key={key}
                  className="p-4 rounded-xl bg-neutral-50 print:bg-transparent print:border print:border-neutral-300 print:p-2 print:break-inside-avoid"
                >
                  <span className="text-primary print:text-foreground">
                    {expertiseIcons[key]}
                  </span>
                  <h3 className="text-sm font-bold text-foreground mt-2 mb-1">
                    {t(`portfolio.page2.expertise.${key}.title`)}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {t(`portfolio.page2.expertise.${key}.desc`)}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-auto rounded-2xl bg-neutral-900 text-white p-6 sm:p-8 print:p-4 print:break-inside-avoid">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                  <h3 className="text-base sm:text-lg font-bold">
                    {t("portfolio.page2.ctaFinalTitle")}
                  </h3>
                  <p className="text-xs text-white/50 mt-1">
                    {t("portfolio.page2.baseLine")}
                  </p>
                </div>
                <div className="flex flex-col sm:items-end gap-1 text-sm text-white/85">
                  <span>{t("website")}</span>
                  <span className="flex items-center gap-2 sm:justify-end">
                    <Mail className="w-3.5 h-3.5" />
                    {t("email")}
                  </span>
                  <span className="flex items-center gap-2 sm:justify-end">
                    <Phone className="w-3.5 h-3.5" />
                    {t("phone")}
                  </span>
                </div>
              </div>
            </div>

            <FooterStrip page="02" />
          </div>
        </div>
      </div>
    </Layout>
  );
}
