import Header from '@/components/Header'

export default function Loading() {
  return (
    <main className="min-h-screen bg-white text-[#14161A]">
      <Header />
      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse rounded-2xl border border-[#E5E7EB] p-4">
              <div className="mb-3 h-32 w-full rounded-xl bg-[#F0F0F2]" />
              <div className="mb-2 h-3 w-3/4 rounded bg-[#F0F0F2]" />
              <div className="h-3 w-1/2 rounded bg-[#F0F0F2]" />
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}