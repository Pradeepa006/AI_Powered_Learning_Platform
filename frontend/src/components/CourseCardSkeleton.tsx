export default function CourseCardSkeleton() {
  return (
    <div className="rounded-2xl glass-card overflow-hidden group flex flex-col relative h-full">
      <div className="h-44 relative bg-gray-900/40 animate-pulse" />
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          <div className="h-6 w-3/4 bg-gray-700/40 rounded animate-pulse mb-2" />
          <div className="h-4 w-1/2 bg-gray-700/40 rounded animate-pulse" />
        </div>
        <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-4">
          <div className="h-6 w-1/4 bg-gray-700/40 rounded animate-pulse" />
          <div className="h-8 w-1/3 bg-gray-700/40 rounded-lg animate-pulse" />
        </div>
      </div>
    </div>
  );
}
