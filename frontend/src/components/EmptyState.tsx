import { SearchX } from 'lucide-react';

export default function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12">
      <SearchX className="w-16 h-16 text-gray-500 mb-4" />
      <h3 className="text-lg font-semibold text-gray-400">No results found</h3>
      <p className="text-sm text-gray-500">{message}</p>
    </div>
  );
}
