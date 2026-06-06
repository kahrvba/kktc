"use client";

import { useState } from "react";
import {
  HiOutlineUser,
  HiOutlineClipboardList,
  HiOutlineSparkles,
} from "react-icons/hi";

const ACTIONS = [
  { title: "Hire", icon: HiOutlineUser, color: "text-sky-600" },
  { title: "Build Profile", icon: HiOutlineClipboardList, color: "text-amber-500" },
  { title: "Get what you need", icon: HiOutlineSparkles, color: "text-emerald-500" },
] as const;

export default function ActionCards() {
  const [selectedAction, setSelectedAction] = useState<string>("Hire");

  return (
    <div className="mt-8 grid grid-cols-3 gap-3">
      {ACTIONS.map(({ title, icon: Icon, color }) => {
        const active = selectedAction === title;
        return (
          <button
            key={title}
            type="button"
            onClick={() => setSelectedAction(title)}
            className={`flex flex-col items-center gap-2 text-sm font-semibold transition ${
              active ? "opacity-100" : "opacity-60"
            }`}
          >
            <span
              className={`flex h-12 w-12 items-center justify-center ${color} transition ${
                active ? "opacity-100" : "opacity-60"
              }`}
            >
              <Icon className="h-6 w-6" />
            </span>
            <span
              className={`text-center text-xs leading-5 ${color} transition ${
                active ? "opacity-100" : "opacity-60"
              }`}
            >
              {title}
            </span>
          </button>
        );
      })}
    </div>
  );
}
