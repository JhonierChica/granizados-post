import React from 'react';
import { Skeleton } from "../ui/skeleton";

interface LoadingProps {
  message?: string;
  type?: 'card' | 'table' | 'text';
}

const Loading: React.FC<LoadingProps> = ({ message = 'Cargando...', type = 'text' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4 w-full">
      {type === 'text' && (
        <div className="space-y-2 w-full max-w-md">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      )}
      {type === 'card' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 w-full rounded-xl" />
          ))}
        </div>
      )}
      {type === 'table' && (
        <div className="space-y-4 w-full">
          <Skeleton className="h-10 w-full" />
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      )}
      <p className="text-sm font-medium text-muted-foreground animate-pulse">{message}</p>
    </div>
  );
};

export default Loading;