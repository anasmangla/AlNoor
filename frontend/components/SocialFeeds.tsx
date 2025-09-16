"use client";

import { useEffect, type CSSProperties } from "react";

declare global {
  interface Window {
    instgrm?: {
      Embeds?: {
        process: () => void;
      };
    };
  }
}

const INSTAGRAM_POST_URL = "https://www.instagram.com/p/CwVsbKpvK63/";
const FACEBOOK_PAGE_URL = "https://www.facebook.com/facebook";

const instagramEmbedStyle: CSSProperties = {
  background: "#fff",
  border: 0,
  margin: "0 auto",
  maxWidth: 540,
  minWidth: 326,
  padding: 0,
  width: "100%",
};

export function SocialFeeds() {
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const scriptUrl = "https://www.instagram.com/embed.js";
    const handleScriptLoad = () => {
      window.instgrm?.Embeds?.process();
    };

    const existingScript = document.querySelector<HTMLScriptElement>(
      `script[src="${scriptUrl}"]`
    );

    if (existingScript) {
      if (existingScript.dataset.loaded === "true") {
        handleScriptLoad();
      } else {
        existingScript.addEventListener("load", handleScriptLoad);
      }

      return () => {
        existingScript.removeEventListener("load", handleScriptLoad);
      };
    }

    const script = document.createElement("script");
    const onLoad = () => {
      script.dataset.loaded = "true";
      handleScriptLoad();
    };

    script.src = scriptUrl;
    script.async = true;
    script.defer = true;
    script.addEventListener("load", onLoad);

    document.body.append(script);

    return () => {
      script.removeEventListener("load", onLoad);
    };
  }, []);

  return (
    <section className="mx-auto max-w-5xl text-left">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-slate-800">Stay Connected</h2>
        <p className="mt-2 text-slate-600">
          Catch the latest updates and behind-the-scenes moments from our fields and markets.
        </p>
      </div>
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <div className="flex flex-col gap-4">
          <h3 className="text-lg font-semibold text-slate-700">Instagram</h3>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <blockquote
              className="instagram-media"
              data-instgrm-permalink={INSTAGRAM_POST_URL}
              data-instgrm-version="14"
              style={instagramEmbedStyle}
            >
              <a href={INSTAGRAM_POST_URL} className="sr-only">
                View this post on Instagram
              </a>
            </blockquote>
            <p className="mt-4 text-sm text-slate-500">
              Follow <span className="font-semibold text-slate-700">@alnoorfarm</span> for seasonal harvests and recipes.
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <h3 className="text-lg font-semibold text-slate-700">Facebook</h3>
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <iframe
              title="Al Noor Farm Facebook feed"
              src={`https://www.facebook.com/plugins/page.php?href=${encodeURIComponent(
                FACEBOOK_PAGE_URL
              )}&tabs=timeline&width=500&height=500&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true&appId`}
              width="100%"
              height="500"
              style={{ border: "none", overflow: "hidden" }}
              scrolling="no"
              frameBorder="0"
              allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
            />
            <p className="px-6 pb-6 text-sm text-slate-500">
              Join our Facebook community for event announcements and live tastings.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
