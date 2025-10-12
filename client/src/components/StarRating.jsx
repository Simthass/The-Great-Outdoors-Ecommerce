import { useMemo } from "react";

export default function StarRating({ value = 0, onChange, size = "text-xl" }) {
  const stars = useMemo(() => [1, 2, 3, 4, 5], []);
  const isEditable = typeof onChange === "function";

  return (
    <div className="inline-flex items-center gap-1">
      {stars.map((n) => (
        <button
          key={n}
          type="button"
          className={`select-none ${size} ${isEditable ? "cursor-pointer" : "cursor-default"}`}
          onClick={isEditable ? () => onChange(n) : undefined}
          aria-label={`Star ${n}`}
        >
          <span className={n <= value ? "text-yellow-500" : "text-gray-300"}>★</span>
        </button>
      ))}
    </div>
  );
}
