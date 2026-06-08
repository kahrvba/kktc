import Header from "./components/Header";
import SearchBox from "./components/search/SearchBox";
import ActionCards from "./components/search/ActionCards";
import {
  MdConstruction,
  MdElectricalServices,
  MdLocalHospital,
  MdSchool,
  MdDirectionsCar,
  MdHomeRepairService,
  MdStar,
  MdVerified,
} from "react-icons/md";
import { HiLocationMarker } from "react-icons/hi";
import { FaTools } from "react-icons/fa";

// ── static data ──────────────────────────────────────────────────────────────

const CATEGORIES = [
  {
    label: "Construction",
    icon: MdConstruction,
    bg: "bg-orange-100",
    color: "text-orange-600",
  },
  {
    label: "Electrical",
    icon: MdElectricalServices,
    bg: "bg-yellow-100",
    color: "text-yellow-600",
  },
  {
    label: "Medical",
    icon: MdLocalHospital,
    bg: "bg-red-100",
    color: "text-red-500",
  },
  {
    label: "Education",
    icon: MdSchool,
    bg: "bg-blue-100",
    color: "text-blue-600",
  },
  {
    label: "Auto",
    icon: MdDirectionsCar,
    bg: "bg-slate-100",
    color: "text-slate-600",
  },
  {
    label: "Repair",
    icon: MdHomeRepairService,
    bg: "bg-emerald-100",
    color: "text-emerald-600",
  },
  {
    label: "Handyman",
    icon: FaTools,
    bg: "bg-purple-100",
    color: "text-purple-600",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <Header />

      <main className="mx-auto max-w-2xl px-4 pb-10 pt-5 sm:px-6">
        <div className="rounded-3xl bg-gradient-to-br from-sky-600 to-blue-700 p-6 text-white shadow-lg">
          <p className="text-xs font-semibold uppercase tracking-widest text-sky-200">
            KKTC Service Finder
          </p>
          <h1 className="mt-2 text-2xl font-bold leading-snug sm:text-3xl">
            Find trusted providers
            <br />
            near you, instantly.
          </h1>
          <p className="mt-2 text-sm text-sky-100">
            Snap a photo, speak your need, or type — we find the right person
            for the job.
          </p>

          <div className="mt-5 grid grid-cols-3 gap-3">
            {[
              { value: "1,200+", label: "Providers" },
              { value: "4.8★", label: "Avg Rating" },
              { value: "3 Cities", label: "Coverage" },
            ].map(({ value, label }) => (
              <div
                key={label}
                className="rounded-2xl bg-white/15 px-3 py-3 text-center backdrop-blur-sm"
              >
                <p className="text-lg font-bold">{value}</p>
                <p className="text-xs text-sky-100">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <SearchBox />
        </div>

        <div className="mt-4 rounded-3xl bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-900">
            What are you looking for?
          </p>
          <ActionCards />
        </div>

        <div className="mt-4 rounded-3xl bg-white p-5 shadow-sm">
          <p className="mb-4 text-sm font-semibold text-slate-900">
            Browse by category
          </p>
          <div className="grid grid-cols-4 gap-3">
            {CATEGORIES.map(({ label, icon: Icon, bg, color }) => (
              <button
                key={label}
                type="button"
                className="flex flex-col items-center gap-2 rounded-2xl p-3 transition hover:bg-slate-50 active:scale-95"
              >
                <span
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl ${bg}`}
                >
                  <Icon className={`h-6 w-6 ${color}`} />
                </span>
                <span className="text-center text-xs font-medium text-slate-700 leading-tight">
                  {label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
