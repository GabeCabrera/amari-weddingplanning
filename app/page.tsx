import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="text-center max-w-md">
        <div className="w-16 h-px bg-warm-400 mx-auto mb-8" />
        
        <h1 className="text-5xl font-serif font-light tracking-widest uppercase mb-2">
          Aisle
        </h1>
        <p className="text-sm tracking-[0.3em] uppercase text-warm-500 mb-12">
          Wedding Planner
        </p>
        
        <div className="w-16 h-px bg-warm-400 mx-auto mb-12" />
        
        <Link
          href="/login"
          className="inline-block px-8 py-3 border border-warm-400 text-warm-600 
                     tracking-widest uppercase text-sm hover:bg-warm-50 
                     transition-colors duration-300"
        >
          Sign In
        </Link>
      </div>
    </main>
  );
}
