"use client";

export function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
}: {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1) return null;

  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="mt-3 flex items-center justify-between text-sm text-[var(--muted)]">
      <p>
        {from}–{to} of {total}
      </p>
      <div className="flex items-center gap-2">
        <button onClick={() => onPageChange(page - 1)} disabled={page <= 1} className="btn btn-secondary btn-sm">
          Prev
        </button>
        <span>
          Page {page} of {totalPages}
        </span>
        <button onClick={() => onPageChange(page + 1)} disabled={page >= totalPages} className="btn btn-secondary btn-sm">
          Next
        </button>
      </div>
    </div>
  );
}
