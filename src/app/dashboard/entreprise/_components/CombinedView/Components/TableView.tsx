import React from 'react';
import { Badge } from '@/components/ui/badge';
import Pagination from './Pagination';

const TableView = ({
  data = [],
  columns = [],
  onRowClick,
  emptyMessage = "Aucune donnée trouvée",
  currentPage,
  totalPages,
  onPageChange,
  rowClassName = "cursor-pointer hover:bg-gray-50",
}) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-xl">
      {data.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((column, index) => (
                  <th 
                    key={index} 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {data.map((row, rowIndex) => (
                <tr
                  key={row._id || rowIndex}
                  onClick={() => onRowClick && onRowClick(row)}
                  className={rowClassName}
                >
                  {columns.map((column, colIndex) => (
                    <td key={colIndex} className="px-6 py-4 whitespace-nowrap">
                      {column.render ? 
                        column.render(row) : 
                        column.field ? 
                          <div className={column.cellClassName || "text-sm text-gray-500"}>
                            {row[column.field] || column.defaultValue || ""}
                          </div>
                          : 
                          null
                      }
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          {emptyMessage}
        </div>
      )}

      {/* Pagination */}
      <Pagination 
        currentPage={currentPage} 
        totalPages={totalPages} 
        onPageChange={onPageChange} 
      />
    </div>
  );
};

export default TableView;