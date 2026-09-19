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
      <div
        className="flex w-full transition-transform duration-300 ease-out motion-reduce:transition-none"
        style={{ transform: `translateX(${-index * 100}%)` }}
      >
        {images.map((item, slideIndex) => (
          <div
            key={item.id}
            aria-hidden={slideIndex !== index}
            className="relative w-full min-w-0 flex-none overflow-hidden"
          >
            {/* Decorative background */}
            <img
              src={item.path}
              alt=""
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 size-full scale-110 object-cover opacity-100 blur-xl"
            />

            {/* Main image */}
            <img
              src={item.path}
              alt={`Post image ${slideIndex + 1}`}
              className="relative h-80 w-full object-contain sm:h-128"
            />
          </div>
        ))}
      </div>

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
