import Header from './Header'

export default function ComingSoon({ title, message }: { title: string; message: string }) {
  return (
    <main className="min-h-screen bg-white text-[#14161A]">
      <Header />
      <div className="mx-auto max-w-2xl px-6 py-24 text-center">
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="mt-3 text-[#6B7280]">{message}</p>
      </div>
    </main>
  )
}