import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Accessible, mobile-friendly pagination with windowing.
 * Shows first/last pages, current neighbourhood, and ellipses.
 * All click targets are at least 40×40 px.
 */
export default function Pagination({ currentPage, totalPages, onPageChange, className = "" }) {
  if (totalPages <= 1) return null;

  const pages = getVisiblePages(currentPage, totalPages);

  return (
    <nav
      aria-label="Pagination"
      className={`flex items-center justify-center gap-1.5 ${className}`}
    >
      <PageButton
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        aria-label="Previous page"
      >
        <ChevronLeft className="w-4 h-4" />
      </PageButton>

      {pages.map((page, idx) =>
        page === "..." ? (
          <span
            key={`ellipsis-${idx}`}
            className="w-10 h-10 flex items-center justify-center text-sm text-gray-500 select-none"
            aria-hidden="true"
          >
            …
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            aria-label={`Page ${page}`}
            aria-current={page === currentPage ? "page" : undefined}
            className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
              page === currentPage
                ? "bg-brand-600 text-white shadow-lg shadow-brand-600/30"
                : "bg-surface-card border border-white/10 text-gray-400 hover:border-brand-600/40 hover:text-white"
            }`}
          >
            {page}
          </button>
        )
      )}

      <PageButton
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        aria-label="Next page"
      >
        <ChevronRight className="w-4 h-4" />
      </PageButton>
    </nav>
  );
}

function PageButton({ children, onClick, disabled, ...props }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="w-10 h-10 rounded-lg bg-surface-card border border-white/10 text-gray-400 hover:border-brand-600/40 hover:text-white transition-colors disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center"
      {...props}
    >
      {children}
    </button>
  );
}

function getVisiblePages(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages = [];
  if (current <= 3) {
    pages.push(1, 2, 3, 4, "...", total);
  } else if (current >= total - 2) {
    pages.push(1, "...", total - 3, total - 2, total - 1, total);
  } else {
    pages.push(1, "...", current - 1, current, current + 1, "...", total);
  }
  return pages;
}
