import React, { ReactNode } from 'react';
import {
  Table as ShadcnTable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

export interface Column<T> {
  header: string;
  field?: keyof T | string;
  render?: (row: T) => ReactNode;
}

export interface CustomAction<T> {
  label: string | ((row: T) => string);
  onClick: (row: T) => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'info' | 'edit' | 'delete';
  show?: (row: T) => boolean;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  actions?: boolean | CustomAction<T>[];
}

const Table = <T extends Record<string, any>>({
  columns,
  data,
  onEdit,
  onDelete,
  actions = true
}: TableProps<T>) => {
  const hasCustomActions = Array.isArray(actions) && actions.length > 0;
  const showActions = actions === true || hasCustomActions;

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="overflow-x-auto">
        <ShadcnTable>
          <TableHeader className="bg-muted/50">
            <TableRow>
              {columns.map((column, index) => (
                <TableHead key={index} className="text-xs font-bold text-muted-foreground uppercase tracking-widest py-4">
                  {column.header}
                </TableHead>
              ))}
              {showActions && <TableHead className="text-xs font-bold text-muted-foreground uppercase tracking-widest py-4 text-center">Acciones</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data && data.length > 0 ? (
              data.map((row, rowIndex) => (
                <TableRow key={rowIndex} className="hover:bg-muted/30 transition-colors group">
                  {columns.map((column, colIndex) => (
                    <TableCell key={colIndex} className="text-sm font-medium py-4">
                      {column.render ? column.render(row) : (column.field ? (row as any)[column.field] : null)}
                    </TableCell>
                  ))}
                  {showActions && (
                    <TableCell className="py-4 text-center">
                      <div className="flex justify-center gap-2">
                        {hasCustomActions ? (
                          (actions as CustomAction<T>[]).map((action, actionIndex) => {
                            if (action.show && !action.show(row)) {
                              return null;
                            }
                            const label = typeof action.label === 'function' ? action.label(row) : action.label;
                            return (
                              <button
                                key={actionIndex}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95 ${
                                  action.variant === 'danger' ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : 
                                  'bg-primary text-primary-foreground hover:bg-primary/90'
                                }`}
                                onClick={() => action.onClick(row)}
                                title={label}
                              >
                                {label}
                              </button>
                            );
                          })
                        ) : (
                          <>
                            {onEdit && (
                              <button
                                className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-all"
                                onClick={() => onEdit(row)}
                                title="Editar"
                              >
                                ✏️
                              </button>
                            )}
                            {onDelete && (
                              <button
                                className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-all"
                                onClick={() => onDelete(row)}
                                title="Eliminar"
                              >
                                🗑️
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length + (showActions ? 1 : 0)} className="py-10 text-center text-muted-foreground italic">
                  No hay datos disponibles
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </ShadcnTable>
      </div>
    </div>
  );
};

export default Table;