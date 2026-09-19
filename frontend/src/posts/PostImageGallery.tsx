import { useState } from "react";
import type { Post } from "./PostDetailPage";

export function PostImageGallery({ images }: { images: Post["images"] }) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const index = Math.min(selectedIndex, images.length - 1);
  const image = images[index];

  if (!image) return null;

  const arrowClass =
    "absolute top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-slate-900 shadow-md transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400 disabled:cursor-default disabled:opacity-30";

  return (
    <div
      role="region"
      aria-label="Post images"
      className="relative mb-8 overflow-hidden rounded-2xl bg-slate-950 sm:mb-10"
    >
      <img
        src={image.path}
        alt={`Post image ${index + 1}`}
        className="h-80 w-full object-contain sm:h-128"
      />

      {images.length > 1 && (
        <>
          <span
            aria-live="polite"
            aria-atomic="true"
            className="absolute top-3 right-3 rounded-full bg-black/70 px-3 py-1 text-xs font-medium text-white"
          >
            <span aria-hidden="true">
              {index + 1} / {images.length}
            </span>
            <span
              className="sr-only" // Screen reader only.
            >
              Image {index + 1} of {images.length}
            </span>
          </span>

          <button
            type="button"
            aria-label="Previous image"
            disabled={index === 0}
            onClick={() => setSelectedIndex(index - 1)}
            className={`${arrowClass} left-3`}
          >
            {/* ‹ */}
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-5"
            >
              <path d="m15 6-6 6 6 6" />
            </svg>
          </button>

          <button
            type="button"
            aria-label="Next image"
            disabled={index === images.length - 1}
            onClick={() => setSelectedIndex(index + 1)}
            className={`${arrowClass} right-3`}
          >
            {/* › */}
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-5"
            >
              <path d="m9 6 6 6-6 6" />
            </svg>
          </button>
        </>
      )}
    </div>
  );
}
