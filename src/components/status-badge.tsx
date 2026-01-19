import type { ReadingStatus } from "../data/mockLibrary";

interface StatusBadgeProps {
  status: ReadingStatus;
}

const statusStyles: Record<ReadingStatus, string> = {
  reading: "bg-blue-500/10 text-blue-600 border-blue-500/20 dark:bg-blue-500/20 dark:text-blue-400",
  finished: "bg-green-500/10 text-green-600 border-green-500/20 dark:bg-green-500/20 dark:text-green-400",
  wishlist: "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:bg-amber-500/20 dark:text-amber-400",
  paused: "bg-zinc-500/10 text-zinc-600 border-zinc-500/20 dark:bg-zinc-500/20 dark:text-zinc-400",
  abandoned: "bg-red-500/10 text-red-600 border-red-500/20 dark:bg-red-500/20 dark:text-red-400",
  owned: "bg-purple-500/10 text-purple-600 border-purple-500/20 dark:bg-purple-500/20 dark:text-purple-400",
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const styles = statusStyles[status] || "bg-gray-100 text-gray-800 border-gray-200";

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles} capitalize transition-colors`}>
      {status}
    </span>
  );
}
