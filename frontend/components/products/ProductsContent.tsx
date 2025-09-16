"use client";

import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import type { Product } from "@/lib/api";

type Props = {
  products: Product[];
  query: string;
};

export default function ProductsContent({ products, query }: Props) {
  const { t } = useLanguage();
  return (
    <>
      <form method="get" className="mb-4 flex items-center gap-2">
        <input
          className="border rounded px-2 py-1"
          type="search"
          name="q"
          placeholder={t("products.searchPlaceholder")}
          defaultValue={query}
          aria-label={t("products.searchPlaceholder")}
        />
        <button className="px-3 py-1 rounded bg-slate-700 text-white">
          {t("products.searchButton")}
        </button>
      </form>
      {products.length === 0 ? (
        <p className="text-slate-600">{t("products.empty")}</p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => {
            const desc = (p as any).description || "";
            const short = desc.length > 80 ? desc.slice(0, 77) + "..." : desc;
            const unit = (p as any).unit || t("products.unitName");
            return (
              <li key={p.id} className="border rounded overflow-hidden hover:shadow">
                <Link href={`/products/${p.id}`} className="block">
                  {(p as any).image_url ? (
                    <img src={(p as any).image_url} alt={p.name} className="w-full h-40 object-cover" />
                  ) : (
                    <div className="w-full h-40 bg-slate-100 flex items-center justify-center text-slate-400">
                      {t("products.noImage")}
                    </div>
                  )}
                  <div className="p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{p.name}</div>
                        <div className="text-slate-600 text-xs">
                          {t("products.idLabel")}: {p.id}
                        </div>
                      </div>
                      <div className="font-semibold text-right">
                        ${p.price.toFixed(2)}
                        <div className="text-xs text-slate-500">{unit}</div>
                      </div>
                    </div>
                    {short && <div className="text-xs text-slate-600 mt-2">{short}</div>}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
