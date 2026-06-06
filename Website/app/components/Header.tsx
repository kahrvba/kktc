"use client";

import { useState } from "react";
import { HiLocationMarker } from "react-icons/hi";

export default function Header() {
  const [language, setLanguage] = useState<"en" | "tr">("en");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const attachLocation = () => {
    if (!navigator?.geolocation) {
      setError("Geolocation not supported.");
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      () => {
        setLoading(false);
      },
      (err) => {
        setLoading(false);
        setError(err.message || "Unable to retrieve location.");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      },
    );
  };

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white shadow-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-600 text-base font-bold text-white shadow-md">
          K
        </div>

        <div className="flex flex-1 items-center gap-2">
          <input
            type="text"
            placeholder="Search..."
            className="flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-600 outline-none transition placeholder:text-slate-400 focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
          />

          <div className="relative inline-flex">
            <select
              title="Select language"
              value={language}
              onChange={(e) => setLanguage(e.target.value as "en" | "tr")}
              className="appearance-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-900 transition hover:border-slate-300"
            >
              <option value="en">EN</option>
              <option value="tr">TR</option>
            </select>
          </div>

          <button
            type="button"
            onClick={attachLocation}
            className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-700 transition hover:bg-slate-50"
            aria-label="Attach location"
          >
            <HiLocationMarker className="h-5 w-5" />
          </button>
        </div>
      </div>

      {error ? (
        <div className="border-t border-slate-200 bg-rose-50 px-4 py-2 text-xs text-rose-600">
          {error}
        </div>
      ) : null}
    </header>
  );
}
