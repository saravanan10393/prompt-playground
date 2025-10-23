export default function GamesPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 via-transparent to-blue-900/10 pointer-events-none" />
      
      <div className="container mx-auto px-4 py-8 relative">
        <div className="text-center">
          <div className="glass-card max-w-md mx-auto p-12 rounded-2xl">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-500 to-gray-600 flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold text-foreground mb-3">No game found</h3>
            <p className="text-muted-foreground">The games listing has been moved to the admin page.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

