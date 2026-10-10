"use client";

import { useLanguage } from "@/components/providers/language-provider";
import type { Language } from "@/lib/i18n/translations";

const languages: { code: Language; label: string }[] = [
  { code: "uz", label: "O‘zbekcha" },
  { code: "ru", label: "Русский" },
  { code: "en", label: "English" },
];

export function LanguageSwitcher() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div aria-label={t("language.label")} className="language-switcher" role="group">
      {languages.map(({ code, label }, index) => (
        <span className="language-option" key={code}>
          {index > 0 && <span aria-hidden="true" className="language-divider">|</span>}
          <button
            aria-label={label}
            aria-pressed={language === code}
            className={language === code ? "is-active" : ""}
            onClick={() => setLanguage(code)}
            type="button"
          >
            {code.toUpperCase()}
          </button>
        </span>
      ))}
    </div>
  );
}

export function LocalizedSkipLink() {
  const { t } = useLanguage();
  return <a className="skip-link" href="#main-content">{t("common.skip")}</a>;
}
