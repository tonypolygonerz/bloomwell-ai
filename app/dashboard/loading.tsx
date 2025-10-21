export default function DashboardLoading() {
  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar Skeleton */}
      <aside className="flex w-70 flex-col border-r border-gray-200 bg-gray-50">
        <div className="flex h-16 items-center border-b border-gray-200 px-6">
          <div className="h-8 w-32 animate-pulse rounded bg-gray-200"></div>
        </div>
        <nav className="flex-1 space-y-2 px-3 py-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-10 animate-pulse rounded-lg bg-gray-200"></div>
          ))}
        </nav>
      </aside>

      {/* Main Content Skeleton */}
      <main className="flex-1 overflow-y-auto bg-white">
        <div className="border-b border-gray-200 bg-white px-8 py-6">
          <div className="h-8 w-64 animate-pulse rounded bg-gray-200"></div>
          <div className="mt-2 h-4 w-48 animate-pulse rounded bg-gray-200"></div>
        </div>
        <div className="px-8 py-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 animate-pulse rounded-lg bg-gray-100"></div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}

