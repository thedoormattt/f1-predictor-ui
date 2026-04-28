"use client";
import { useRef, useEffect, useState } from "react";
import clsx from "clsx";

interface CarouselItem {
  value: string;
  label: string;
  sublabel?: string;
  image?: string | null;
  colour: string;
}

interface Props {
  items: CarouselItem[];
  selected: string;
  onSelect: (value: string) => void;
  disabled?: boolean;
}

export default function SelectionCarousel({
  items,
  selected,
  onSelect,
  disabled,
}: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // Duplicate items for seamless loop
  const looped = [...items, ...items, ...items];

  // Start in the middle copy so we can scroll both ways
  const hasInitialised = useRef(false);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || hasInitialised.current) return;
    hasInitialised.current = true;

    setTimeout(() => {
      if (!track) return;
      const itemWidth = track.scrollWidth / 3;
      const selectedIndex = items.findIndex((item) => item.value === selected);

      if (selectedIndex >= 0) {
        const itemEl = track.children[
          items.length + selectedIndex
        ] as HTMLElement;
        if (itemEl) {
          track.scrollLeft =
            itemEl.offsetLeft - track.clientWidth / 2 + itemEl.clientWidth / 2;
          return;
        }
      }
      track.scrollLeft = itemWidth;
    }, 50);
  }, [items, selected]);

  // Infinite loop — when near either end, jump to middle
  const handleScroll = () => {
    const track = trackRef.current;
    if (!track) return;
    const itemWidth = track.scrollWidth / 3;
    if (track.scrollLeft < itemWidth * 0.25) {
      track.style.scrollBehavior = "auto";
      track.scrollLeft += itemWidth;
    } else if (track.scrollLeft > itemWidth * 1.75) {
      track.style.scrollBehavior = "auto";
      track.scrollLeft -= itemWidth;
    }
  };

  // Mouse drag
  const onMouseDown = (e: React.MouseEvent) => {
    if (disabled) return;
    setIsDragging(true);
    setStartX(e.pageX - (trackRef.current?.offsetLeft ?? 0));
    setScrollLeft(trackRef.current?.scrollLeft ?? 0);
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - (trackRef.current?.offsetLeft ?? 0);
    const walk = (x - startX) * 1.5;
    if (trackRef.current) trackRef.current.scrollLeft = scrollLeft - walk;
  };
  const onMouseUp = () => setIsDragging(false);

  // Touch drag
  const onTouchStart = (e: React.TouchEvent) => {
    if (disabled) return;
    setStartX(e.touches[0].pageX - (trackRef.current?.offsetLeft ?? 0));
    setScrollLeft(trackRef.current?.scrollLeft ?? 0);
  };
  const onTouchMove = (e: React.TouchEvent) => {
    const x = e.touches[0].pageX - (trackRef.current?.offsetLeft ?? 0);
    const walk = (x - startX) * 1.5;
    if (trackRef.current) trackRef.current.scrollLeft = scrollLeft - walk;
  };

  return (
    <div
      ref={trackRef}
      onScroll={handleScroll}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      className={clsx(
        "flex gap-3 overflow-x-auto pb-2 select-none",
        isDragging ? "cursor-grabbing" : "cursor-grab",
        disabled && "opacity-40 pointer-events-none",
        "scrollbar-hide",
      )}
    >
      {looped.map((item, i) => {
        const isSelected = item.value === selected;
        return (
          <button
            key={`${item.value}-${i}`}
            onClick={() => !isDragging && onSelect(item.value)}
            className={clsx(
              "flex-shrink-0 flex flex-col items-center gap-1.5 p-3 rounded-lg border transition-all w-20",
              isSelected
                ? "border-f1red bg-f1red/10"
                : "border-f1mid bg-f1grey hover:border-f1light",
            )}
          >
            {/* Image or colour circle */}
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center overflow-hidden shrink-0"
              style={{ background: item.colour }}
            >
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.label}
                  className="w-full h-full object-contain p-1.5"
                />
              ) : (
                <span className="font-mono text-xs font-bold text-white">
                  {item.value.slice(0, 3)}
                </span>
              )}
            </div>

            {/* Label */}
            <p
              className={clsx(
                "font-display font-bold text-[10px] uppercase tracking-wide text-center leading-tight",
                isSelected ? "text-f1white" : "text-f1muted",
              )}
            >
              {item.label}
            </p>
            {item.sublabel && (
              <p className="font-mono text-[9px] text-f1muted text-center leading-tight">
                {item.sublabel}
              </p>
            )}

            {/* Selected indicator */}
            {isSelected && (
              <div className="w-1.5 h-1.5 rounded-full bg-f1red" />
            )}
          </button>
        );
      })}
    </div>
  );
}
