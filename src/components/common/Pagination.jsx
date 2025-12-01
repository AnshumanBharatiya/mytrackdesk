// components/common/Pagination.jsx - Reusable Pagination Component
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Reusable Pagination Component
 * 
 * @param {number} currentPage - Current active page (1-indexed)
 * @param {number} totalPages - Total number of pages
 * @param {function} onPageChange - Callback function when page changes
 * @param {number} itemsPerPage - Number of items per page (for display)
 * @param {number} totalItems - Total number of items (for display)
 * @param {number} maxVisiblePages - Maximum number of page buttons to show (default: 7)
 * 
 * Usage Example:
 * <Pagination
 *   currentPage={currentPage}
 *   totalPages={Math.ceil(totalItems / itemsPerPage)}
 *   onPageChange={(page) => setCurrentPage(page)}
 *   itemsPerPage={10}
 *   totalItems={transactions.length}
 * />
 */
export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage = 10,
  totalItems = 0,
  maxVisiblePages = 7
}) {
  // Don't render if no pages
  if (totalPages <= 1) return null;

  // Calculate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    
    // If total pages is less than max visible, show all
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
      return pages;
    }

    // Always show first page
    pages.push(1);

    // Calculate range around current page
    const halfVisible = Math.floor((maxVisiblePages - 3) / 2); // -3 for first, last, and one ellipsis
    let startPage = Math.max(2, currentPage - halfVisible);
    let endPage = Math.min(totalPages - 1, currentPage + halfVisible);

    // Adjust if we're near the start
    if (currentPage <= halfVisible + 2) {
      endPage = Math.min(totalPages - 1, maxVisiblePages - 2);
    }

    // Adjust if we're near the end
    if (currentPage >= totalPages - halfVisible - 1) {
      startPage = Math.max(2, totalPages - maxVisiblePages + 3);
    }

    // Add ellipsis after first page if needed
    if (startPage > 2) {
      pages.push('ellipsis-start');
    }

    // Add middle pages
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    // Add ellipsis before last page if needed
    if (endPage < totalPages - 1) {
      pages.push('ellipsis-end');
    }

    // Always show last page
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  // Calculate item range for current page
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4 my-6 px-4">
      {/* Items info */}
      <div className="text-sm text-gray-600">
        Showing <span className="font-semibold text-blue-600">{startItem}</span> to{' '}
        <span className="font-semibold text-blue-600">{endItem}</span> of{' '}
        <span className="font-semibold text-gray-900">{totalItems}</span> entries
      </div>

      {/* Pagination buttons */}
      <div className="flex items-center space-x-2">
        {/* Previous button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`flex items-center justify-center w-10 h-10 rounded-lg border-2 transition-all transform hover:scale-105 ${
            currentPage === 1
              ? 'border-gray-300 text-gray-400 cursor-not-allowed'
              : 'border-blue-500 text-blue-600 hover:bg-blue-50 hover:shadow-md'
          }`}
          title="Previous page"
        >
          <ChevronLeft size={15} />
        </button>

        {/* Page numbers */}
        <div className="flex items-center space-x-1">
          {pageNumbers.map((page, index) => {
            if (typeof page === 'string') {
              // Render ellipsis
              return (
                <span
                  key={`${page}-${index}`}
                  className="flex items-center justify-center w-10 h-10 text-gray-500"
                >
                  ...
                </span>
              );
            }

            // Render page number
            return (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`flex items-center justify-center w-10 h-10 rounded-lg border-2 font-semibold transition-all transform hover:scale-105 ${
                  currentPage === page
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white border-transparent shadow-lg'
                    : 'border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-500 hover:shadow-md'
                }`}
                title={`Go to page ${page}`}
              >
                {page}
              </button>
            );
          })}
        </div>

        {/* Next button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`flex items-center justify-center w-10 h-10 rounded-lg border-2 transition-all transform hover:scale-105 ${
            currentPage === totalPages
              ? 'border-gray-300 text-gray-400 cursor-not-allowed'
              : 'border-blue-500 text-blue-600 hover:bg-blue-50 hover:shadow-md'
          }`}
          title="Next page"
        >
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
}