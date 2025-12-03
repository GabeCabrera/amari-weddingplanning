"use client";

export default function InspoPage() {
  return (
    <div className="h-full flex flex-col items-center justify-center p-8">
      {/* Placeholder illustration */}
      <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-rose-100 to-amber-100 flex items-center justify-center mb-6">
        <svg className="w-12 h-12 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
        </svg>
      </div>
      
      <h1 className="font-serif text-2xl text-ink mb-2">Inspo Board</h1>
      <p className="text-ink-soft text-center max-w-md mb-8">
        Collect and organize your wedding inspiration. 
        Save images, create mood boards, and let your vision come to life.
      </p>
      
      {/* Coming soon badge */}
      <div className="px-4 py-2 rounded-full bg-rose-100 text-rose-700 text-sm font-medium">
        Coming Soon
      </div>
      
      {/* Feature preview */}
      <div className="mt-12 grid grid-cols-3 gap-4 max-w-lg opacity-50">
        {[...Array(6)].map((_, i) => (
          <div 
            key={i} 
            className="aspect-square rounded-lg bg-gradient-to-br from-stone-100 to-stone-200"
          />
        ))}
      </div>
    </div>
  );
}
