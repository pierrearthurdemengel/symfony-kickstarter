import type { Column } from '@/types';

// Directions de tri
type SortOrder = 'asc' | 'desc';

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onSort?: (key: string) => void;
  sortBy?: string;
  sortOrder?: SortOrder;
  isLoading?: boolean;
}

// Lignes de skeleton pendant le chargement
function SkeletonRows({ columns, count = 5 }: { columns: number; count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, rowIndex) => (
        <tr key={`skeleton-${rowIndex}`}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <td key={`skeleton-${rowIndex}-${colIndex}`} className="px-4 py-3">
              <div className="h-4 animate-pulse rounded bg-secondary-200 dark:bg-gray-700" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export default function DataTable<T extends object>({
  data,
  columns,
  onSort,
  sortBy,
  sortOrder,
  isLoading = false,
}: DataTableProps<T>) {
  // Indicateur de tri dans l'en-tete
  const renderSortIcon = (key: string) => {
    if (sortBy !== key) {
      return (
        <svg
          className="ml-1 inline h-4 w-4 text-secondary-400 dark:text-gray-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }

    return (
      <svg
        className="ml-1 inline h-4 w-4 text-primary-600 dark:text-primary-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d={sortOrder === 'asc' ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'}
        />
      </svg>
    );
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-secondary-200 dark:border-gray-700">
      <table className="w-full min-w-full table-auto">
        <thead className="bg-secondary-50 dark:bg-gray-800">
          <tr>
            {columns.map((column) => (
              <th
                key={String(column.key)}
                className={`
                  px-4 py-3 text-left text-sm font-semibold text-secondary-700
                  dark:text-gray-300
                  ${column.sortable && onSort ? 'cursor-pointer select-none hover:bg-secondary-100 dark:hover:bg-gray-700' : ''}
                `.trim()}
                onClick={column.sortable && onSort ? () => onSort(String(column.key)) : undefined}
              >
                <span className="inline-flex items-center">
                  {column.label}
                  {column.sortable && onSort && renderSortIcon(String(column.key))}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-secondary-200 dark:divide-gray-700">
          {isLoading ? (
            <SkeletonRows columns={columns.length} />
          ) : data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-8 text-center text-sm text-secondary-500 dark:text-gray-400"
              >
                Aucun resultat
              </td>
            </tr>
          ) : (
            data.map((item, index) => (
              <tr
                key={index}
                className="bg-white hover:bg-secondary-50 dark:bg-gray-900 dark:hover:bg-gray-800"
              >
                {columns.map((column) => (
                  <td
                    key={String(column.key)}
                    className="px-4 py-3 text-sm text-secondary-900 dark:text-gray-200"
                  >
                    {column.render
                      ? column.render(item)
                      : String(item[column.key as keyof T] ?? '')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
