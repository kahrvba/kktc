"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  HiOutlineUser,
  HiOutlineClipboardList,
  HiOutlineSparkles,
} from "react-icons/hi";

const ACTIONS = [
  {
    key: "action_hire",
    icon: HiOutlineUser,
    bg: "bg-sky-50",
    iconColor: "text-sky-600",
    ring: "ring-sky-400",
  },
  {
    key: "action_profile",
    icon: HiOutlineClipboardList,
    bg: "bg-amber-50",
    iconColor: "text-amber-500",
    ring: "ring-amber-400",
  },
  {
    key: "action_need",
    icon: HiOutlineSparkles,
    bg: "bg-emerald-50",
    iconColor: "text-emerald-500",
    ring: "ring-emerald-400",
  },
] as const;

export default function ActionCards() {
  const t = useTranslations();
  const [selected, setSelected] = useState<string>("action_hire");

  return (
    <div className="flex gap-3">
      {ACTIONS.map(({ key, icon: Icon, bg, iconColor, ring }) => {
        const active = selected === key;
        return (
          <button
            key={key}
            type="button"
            onClick={() => setSelected(key)}
            className={`flex flex-1 flex-col items-center gap-3 rounded-2xl p-4 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 ${ring} ${bg} ${
              active
                ? `ring-2 ${ring} shadow-md scale-[1.03]`
                : "ring-1 ring-slate-200 hover:shadow-sm hover:scale-[1.01]"
            }`}
          >
            <span
              className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                active ? "bg-white shadow-sm" : "bg-white/60"
              }`}
            >
              <Icon className={`h-5 w-5 ${iconColor}`} />
            </span>
            <span
              className={`text-center text-xs font-semibold leading-tight ${
                active ? "text-slate-900" : "text-slate-500"
              }`}
            >
              {t(key)}
            </span>
          </button>
        );
      })}
    </div>
  );
}
