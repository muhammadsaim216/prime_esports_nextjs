import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fafafa]">
      <div className="text-center px-4">
        <h1 className="mb-4 text-7xl font-black italic uppercase tracking-tighter text-zinc-900">404</h1>
        <p className="mb-6 text-sm font-black uppercase tracking-widest text-zinc-400">Oops! This sector does not exist.</p>
        <Link href="/" className="inline-flex items-center justify-center h-12 px-8 bg-black text-white font-black uppercase italic text-xs tracking-widest hover:bg-[#e91e63] transition-colors">
          Return to Home
        </Link>
      </div>
    </div>
  );
}
