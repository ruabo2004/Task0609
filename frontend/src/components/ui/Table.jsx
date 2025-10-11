import React, { useState } from 'react';
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from './LoadingSpinner';

/**
 * Table component with sorting, pagination, and loading states
 * @param {Object} props - Component props
 * @param {Array} props.columns - Array of column definitions
 * @param {Array} props.data - Array of data rows
 * @param {boolean} props.loading - Whether table is loading
 * @param {React.ReactNode} props.emptyMessage - Message when no data
 * @param {boolean} props.sortable - Whether columns are sortable
 * @param {Object} props.sortConfig - Current sort configuration { key, direction }
 * @param {Function} props.onSort - Sort handler
 * @param {boolean} props.striped - Whether to show striped rows
 * @param {boolean} props.hoverable - Whether rows are hoverable
 * @param {string} props.size - Table size (sm, md, lg)
 * @param {string} props.className - Additional CSS classes
 * @returns {React.ReactElement} Table component
 */
const Table = ({
  columns = [],
  data = [],
  loading = false,
  emptyMessage = 'No data available',
  sortable = true,
  sortConfig = null,
  onSort,
  striped = false,
  hoverable = true,
  size = 'md',
  className = '',
}) => {
  const [localSortConfig, setLocalSortConfig] = useState(null);
  
  // Use external sort config if provided, otherwise use local state
  const currentSortConfig = sortConfig || localSortConfig;

  // Handle column sorting
  const handleSort = (key) => {
    if (!sortable) return;

    let direction = 'asc';
    if (currentSortConfig && currentSortConfig.key === key && currentSortConfig.direction === 'asc') {
      direction = 'desc';
    }

    const newSortConfig = { key, direction };
    
    if (onSort) {
      onSort(newSortConfig);
    } else {
      setLocalSortConfig(newSortConfig);
    }
  };

  // Sort data if no external sort handler provided
  const sortedData = React.useMemo(() => {
    if (!currentSortConfig || onSort) return data;

    const { key, direction } = currentSortConfig;
    const column = columns.find(col => col.key === key);
    
    return [...data].sort((a, b) => {
      let aValue = a[key];
      let bValue = b[key];

      // Use custom sort function if provided
      if (column?.sortFn) {
        return column.sortFn(a, b, direction);
      }

      // Handle null/undefined values
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return direction === 'asc' ? -1 : 1;
      if (bValue == null) return direction === 'asc' ? 1 : -1;

      // Convert to comparable values
      if (typeof aValue === 'string') aValue = aValue.toLowerCase();
      if (typeof bValue === 'string') bValue = bValue.toLowerCase();

      if (aValue < bValue) return direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, currentSortConfig, columns, onSort]);

  // Size classes
  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const cellPaddingClasses = {
    sm: 'px-3 py-2',
    md: 'px-4 py-3',
    lg: 'px-6 py-4',
  };

  // Render cell content
  const renderCell = (row, column, rowIndex) => {
    const value = row[column.key];
    
    if (column.render) {
      return column.render(row, rowIndex);
    }
    
    if (value == null) {
      return <span className="text-gray-400">—</span>;
    }
    
    return value;
  };

  // Render sort icon
  const renderSortIcon = (columnKey) => {
    if (!sortable) return null;
    
    const isSorted = currentSortConfig?.key === columnKey;
    const direction = currentSortConfig?.direction;
    
    return (
      <span className="ml-1 flex-shrink-0">
        {isSorted ? (
          direction === 'asc' ? (
            <ChevronUpIcon className="h-4 w-4" />
          ) : (
            <ChevronDownIcon className="h-4 w-4" />
          )
        ) : (
          <div className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <ChevronUpIcon className="h-4 w-4" />
          </div>
        )}
      </span>
    );
  };

  return (
    <div className={`overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg ${className}`}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-300">
          {/* Table Header */}
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={`
                    ${cellPaddingClasses[size]} text-left ${sizeClasses[size]} font-medium text-gray-900 uppercase tracking-wider
                    ${sortable && column.sortable !== false ? 'cursor-pointer select-none group hover:bg-gray-100' : ''}
                    ${column.className || ''}
                  `}
                  style={{ width: column.width }}
                  onClick={() => column.sortable !== false && handleSort(column.key)}
                >
                  <div className="flex items-center">
                    <span>{column.title}</span>
                    {column.sortable !== false && renderSortIcon(column.key)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className={`bg-white divide-y divide-gray-200 ${striped ? 'divide-y-0' : ''}`}>
            {loading ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className={`${cellPaddingClasses[size]} text-center`}
                >
                  <div className="flex items-center justify-center py-8">
                    <LoadingSpinner size="md" className="mr-2" />
                    <span className="text-gray-500">Loading...</span>
                  </div>
                </td>
              </tr>
            ) : sortedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className={`${cellPaddingClasses[size]} text-center text-gray-500 py-8`}
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              sortedData.map((row, rowIndex) => (
                <tr
                  key={row.id || rowIndex}
                  className={`
                    ${striped && rowIndex % 2 === 0 ? 'bg-white' : striped ? 'bg-gray-50' : 'bg-white'}
                    ${hoverable ? 'hover:bg-gray-50' : ''}
                    transition-colors duration-150
                  `}
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={`
                        ${cellPaddingClasses[size]} ${sizeClasses[size]} text-gray-900
                        ${column.cellClassName || ''}
                      `}
                    >
                      {renderCell(row, column, rowIndex)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/**
 * TablePagination component for table pagination
 */
export const TablePagination = ({
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  itemsPerPage = 10,
  onPageChange,
  onItemsPerPageChange,
  showItemsPerPage = true,
  itemsPerPageOptions = [10, 25, 50, 100],
  className = '',
}) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      onPageChange?.(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      onPageChange?.(currentPage + 1);
    }
  };

  const handlePageClick = (page) => {
    onPageChange?.(page);
  };

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 7;
    
    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 4) {
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  return (
    <div className={`bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 ${className}`}>
      <div className="flex-1 flex justify-between sm:hidden">
        <button
          onClick={handlePreviousPage}
          disabled={currentPage <= 1}
          className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <button
          onClick={handleNextPage}
          disabled={currentPage >= totalPages}
          className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
      
      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div className="flex items-center">
          <p className="text-sm text-gray-700">
            Showing <span className="font-medium">{startItem}</span> to{' '}
            <span className="font-medium">{endItem}</span> of{' '}
            <span className="font-medium">{totalItems}</span> results
          </p>
          
          {showItemsPerPage && (
            <div className="ml-6 flex items-center">
              <label htmlFor="items-per-page" className="mr-2 text-sm text-gray-700">
                Show:
              </label>
              <select
                id="items-per-page"
                value={itemsPerPage}
                onChange={(e) => onItemsPerPageChange?.(Number(e.target.value))}
                className="border-gray-300 rounded-md text-sm focus:ring-primary-500 focus:border-primary-500"
              >
                {itemsPerPageOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
          )}
        </div>
        
        <div>
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            <button
              onClick={handlePreviousPage}
              disabled={currentPage <= 1}
              className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="sr-only">Previous</span>
              <ChevronUpIcon className="h-5 w-5 transform -rotate-90" />
            </button>
            
            {getPageNumbers().map((page, index) => (
              page === '...' ? (
                <span
                  key={index}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                >
                  ...
                </span>
              ) : (
                <button
                  key={page}
                  onClick={() => handlePageClick(page)}
                  className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                    page === currentPage
                      ? 'z-10 bg-primary-50 border-primary-500 text-primary-600'
                      : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              )
            ))}
            
            <button
              onClick={handleNextPage}
              disabled={currentPage >= totalPages}
              className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="sr-only">Next</span>
              <ChevronDownIcon className="h-5 w-5 transform rotate-90" />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Table;
