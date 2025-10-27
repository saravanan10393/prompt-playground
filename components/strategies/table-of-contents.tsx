"use client";

import { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";

interface TOCItem {
  id: string;
  title: string;
  icon: string;
  color: string;
}

interface TableOfContentsProps {
  items: TOCItem[];
}

export function TableOfContents({ items }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState(items[0]?.id || "");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: "-20% 0px -70% 0px",
      }
    );

    items.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [items]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  const colorClasses: Record<string, string> = {
    yellow: "bg-yellow-500",
    blue: "bg-blue-500",
    purple: "bg-purple-500",
    orange: "bg-orange-500",
    teal: "bg-teal-500",
    green: "bg-green-500",
    pink: "bg-pink-500",
  };

  return (
    <nav className="sticky top-24 space-y-2">
      <div className="text-sm font-bold text-muted-foreground mb-4 px-3">Table of Contents</div>
      {items.map((item) => {
        const isActive = activeId === item.id;
        const colorClass = colorClasses[item.color] || colorClasses.orange;

        return (
          <button
            key={item.id}
            onClick={() => scrollToSection(item.id)}
            className={`w-full text-left px-3 py-2.5 rounded-lg transition-all group ${
              isActive
                ? "bg-orange-500/10 border border-orange-500/30"
                : "hover:bg-slate-500/5"
            }`}
          >
            <div className="flex items-center gap-3">
              {/* Icon indicator */}
              <div
                className={`w-1 h-1 rounded-full transition-all ${
                  isActive ? `${colorClass} w-2 h-8` : "bg-slate-500"
                }`}
              />

              {/* Emoji icon */}
              <span className="text-lg">{item.icon}</span>

              {/* Title */}
              <span
                className={`text-sm font-medium flex-1 ${
                  isActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                }`}
              >
                {item.title}
              </span>

              {/* Arrow indicator */}
              {isActive && <ChevronRight className="w-4 h-4 text-orange-500" />}
            </div>
          </button>
        );
      })}

      {/* Back to Top */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="w-full text-left px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-slate-500/5 transition-all mt-4"
      >
        ↑ Back to Top
      </button>
    </nav>
  );
}
