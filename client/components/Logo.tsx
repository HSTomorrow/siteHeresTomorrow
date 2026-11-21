import { useLanguage } from "@/contexts/LanguageContext";
import { getTranslation } from "@/lib/translations";

interface LogoProps {
  /** icon: mark only. compact: mark + wordmark (no tagline). full: mark + wordmark + tagline. */
  variant?: "icon" | "compact" | "full";
  /** Use on colored/dark backgrounds (e.g. gradient hero sections). */
  inverted?: boolean;
  /** Collapse to icon-only below the sm breakpoint (for tight header space). */
  responsive?: boolean;
  className?: string;
}

export default function Logo({
  variant = "compact",
  inverted = false,
  responsive = true,
  className = "",
}: LogoProps) {
  const { language } = useLanguage();
  const t = (key: string) => getTranslation(language, key);

  const violet = inverted ? "text-white" : "text-secondary";
  const blue = inverted ? "text-white/85" : "text-primary";
  const wordmark = inverted ? "text-white" : "text-foreground";
  const tagline = inverted ? "text-white/70" : "text-muted-foreground";
  const divider = inverted ? "bg-white/30" : "bg-neutral-300";

  const poppins = { fontFamily: "'Poppins', sans-serif" };

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      <div className="flex flex-col items-start leading-none font-mono font-bold flex-shrink-0">
        <span className={`${violet} text-[13px] sm:text-base tracking-tight whitespace-nowrap`}>
          &lt;/today&gt;
        </span>
        <span className={`${blue} text-[13px] sm:text-base tracking-tight whitespace-nowrap`}>
          &lt;tomorrow&gt;
        </span>
      </div>

      {variant !== "icon" && (
        <div className={`${responsive ? "hidden sm:flex" : "flex"} items-center gap-3`}>
          <span className={`w-px self-stretch ${divider}`} />
          <div className="flex flex-col leading-none">
            <span
              style={poppins}
              className={`font-bold text-base sm:text-lg leading-tight ${wordmark}`}
            >
              Here’s
            </span>
            <span
              style={poppins}
              className={`font-bold text-base sm:text-lg leading-tight ${wordmark}`}
            >
              Tomorrow
            </span>
            {variant === "full" && (
              <span
                className={`text-[9px] font-semibold tracking-widest uppercase mt-1 whitespace-nowrap ${tagline}`}
              >
                {t("companyTagline")}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
