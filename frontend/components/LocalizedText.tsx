"use client";

import { useLanguage } from "@/context/LanguageContext";

type Props = {
  id: string;
  values?: Record<string, string | number>;
};

export default function LocalizedText({ id, values }: Props) {
  const { t } = useLanguage();
  return <>{t(id, values)}</>;
}
