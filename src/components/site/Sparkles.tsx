export function Sparkles({ className = "" }: { className?: string }) {
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden>
      <span className="absolute left-[8%] top-[15%] text-2xl animate-twinkle">✨</span>
      <span className="absolute left-[85%] top-[10%] text-xl animate-twinkle [animation-delay:0.6s]">⭐</span>
      <span className="absolute left-[70%] top-[60%] text-2xl animate-twinkle [animation-delay:1.2s]">✨</span>
      <span className="absolute left-[20%] top-[70%] text-lg animate-twinkle [animation-delay:0.3s]">💫</span>
      <span className="absolute left-[50%] top-[25%] text-sm animate-twinkle [animation-delay:0.9s]">⭐</span>
    </div>
  );
}
