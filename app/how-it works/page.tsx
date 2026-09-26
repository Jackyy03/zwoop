import Header from '@/components/Header'

const STEPS = [
  { title: 'Sign up with your college email', desc: 'Verify with a quick email link — no passwords to remember.' },
  { title: 'Browse or post', desc: 'Find items, PGs, bikes and events near your college, or list your own in a couple minutes.' },
  { title: 'Contact directly', desc: 'Reach out on WhatsApp to the seller or organizer — no in-app chat, no middleman.' },
  { title: 'Meet safely', desc: 'Meet on campus, check the item, and complete things directly between the two of you.' },
]

export default function HowItWorks() {
  return (
    <main className="min-h-screen bg-white text-[#14161A]">
      <Header />
      <div className="mx-auto max-w-2xl px-6 py-16">
        <h1 className="mb-6 text-3xl font-bold">How Zwoop works</h1>
        <div className="flex flex-col gap-6">
          {STEPS.map((s, i) => (
            <div key={i} className="flex gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#FF5A36] text-sm font-bold text-white">{i + 1}</div>
              <div>
                <p className="font-semibold">{s.title}</p>
                <p className="text-sm text-[#6B7280]">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}