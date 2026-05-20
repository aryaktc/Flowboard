export function CardSkeleton({ className = '' }) {
  return (
    <div className={`skeleton h-32 rounded-xl ${className}`} />
  );
}

export function TableRowSkeleton({ columns = 5, className = '' }) {
  return (
    <div className={`flex items-center gap-4 px-4 py-3 ${className}`}>
      {[...Array(columns)].map((_, i) => (
        <div
          key={i}
          className="skeleton h-4 rounded-md"
          style={{
            width: i === 0 ? '35%' : `${Math.floor(65 / (columns - 1))}%`,
          }}
        />
      ))}
    </div>
  );
}

export function KanbanSkeleton() {
  return (
    <div className="grid grid-cols-4 gap-5 animate-fade-in">
      {[...Array(4)].map((_, colIdx) => (
        <div key={colIdx} className="space-y-3">
          {/* Column header */}
          <div className="skeleton h-8 w-28 rounded-lg mb-4" />
          {/* Cards */}
          {[...Array(colIdx === 0 ? 3 : colIdx === 1 ? 2 : colIdx === 2 ? 2 : 1)].map(
            (_, cardIdx) => (
              <div
                key={cardIdx}
                className="skeleton rounded-xl"
                style={{
                  height: `${Math.floor(Math.random() * 40) + 100}px`,
                  animationDelay: `${(colIdx * 3 + cardIdx) * 0.1}s`,
                }}
              />
            )
          )}
        </div>
      ))}
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="glass rounded-2xl p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div className="skeleton h-4 w-20 rounded-md" />
        <div className="skeleton h-9 w-9 rounded-lg" />
      </div>
      <div className="skeleton h-8 w-16 rounded-md" />
      <div className="skeleton h-3 w-32 rounded-md" />
    </div>
  );
}

export function ListSkeleton({ rows = 5 }) {
  return (
    <div className="space-y-2 animate-fade-in">
      {[...Array(rows)].map((_, i) => (
        <TableRowSkeleton
          key={i}
          columns={4}
          className="glass rounded-xl"
        />
      ))}
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="glass rounded-2xl p-8 space-y-6 max-w-2xl mx-auto animate-fade-in">
      <div className="flex items-center gap-4">
        <div className="skeleton w-16 h-16 rounded-xl" />
        <div className="space-y-2 flex-1">
          <div className="skeleton h-6 w-40 rounded-md" />
          <div className="skeleton h-4 w-56 rounded-md" />
        </div>
      </div>
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="skeleton h-3 w-20 rounded-md" />
            <div className="skeleton h-10 w-full rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  );
}
