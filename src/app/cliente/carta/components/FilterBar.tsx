"use client";

import { Filter } from "../page";
import { Search, UtensilsCrossed, Wine, Glasses } from "lucide-react";
import clsx from "clsx";
import ui from "../../cliente-ui.module.css";

interface Props {
  filter: Filter;
  setFilter: (f: Filter) => void;
}

const filters: { value: Filter; label: string; icon: React.ElementType }[] = [
  { value: "all", label: "Todo", icon: Glasses },
  { value: "food", label: "Comidas", icon: UtensilsCrossed },
  { value: "drink", label: "Bebidas", icon: Wine },
];

export default function FilterBar({ filter, setFilter }: Props) {
  return (
    <div className={ui.filterBarContainer}>
      <div className={ui.filterBarContent}>
        <div className={ui.filterBarOptions}>
          {filters.map((f) => {
            const Icon = f.icon;
            const isActive = filter === f.value;
            return (
              <button
                key={f.value}
                type="button"
                onClick={() => setFilter(f.value)}
                className={clsx(ui.filterBarBtn, isActive && ui.filterBarBtnActive)}
              >
                <Icon className={ui.filterBarIcon} />
                <span>{f.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}