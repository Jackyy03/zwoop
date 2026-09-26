import Header from '@/components/Header'
import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="min-h-screen bg-white text-[#14161A]">
      <Header />
      <div className="mx-auto max-w-xl px-6 py-24 text-center">
        <h1 className="text-3xl font-bold">Page not found</h1>
        <p className="mt-2 text-[#6B7280]">The page you're looking for doesn't exist.</p>
        <Link href="/" className="mt-6 inline-block rounded-full bg-[#FF5A36] px-6 py-3 text-sm font-semibold text-white">
          Back to homepage
        </Link>
      </div>
    </main>
  )
}