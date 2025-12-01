import Link from "next/link";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  href?: string;
  className?: string;
}

export function Logo({ size = "md", showText = true, href = "/", className = "" }: LogoProps) {
  const sizes = {
    sm: { icon: "w-8 h-8", text: "text-lg", subtext: "text-[10px]" },
    md: { icon: "w-10 h-10", text: "text-xl", subtext: "text-xs" },
    lg: { icon: "w-12 h-12", text: "text-2xl", subtext: "text-sm" },
  };

  const content = (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Logo Icon */}
      <div className={`${sizes[size].icon} relative`}>
        <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          {/* Letter A forming arch */}
          <path d="M16 3 L4 28 L8 28 L10.5 22 L21.5 22 L24 28 L28 28 L16 3Z" fill="#78716c"/>
          {/* Inner cutout */}
          <path d="M16 11 L11.5 20 L20.5 20 L16 11Z" fill="currentColor" className="text-white"/>
          {/* Heart at peak */}
          <path d="M16 2 C14.5 0, 12.5 2, 12.5 4.5 C12.5 7, 16 10, 16 10 C16 10, 19.5 7, 19.5 4.5 C19.5 2, 17.5 0, 16 2Z" fill="#e8a4a4"/>
        </svg>
      </div>
      
      {/* Text */}
      {showText && (
        <div className="flex flex-col">
          <span className={`font-serif tracking-[0.2em] uppercase text-warm-700 ${sizes[size].text}`}>
            Aisle
          </span>
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="hover:opacity-80 transition-opacity">
        {content}
      </Link>
    );
  }

  return content;
}

// Icon only version
export function LogoIcon({ size = "md", className = "" }: { size?: "sm" | "md" | "lg"; className?: string }) {
  const sizes = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-10 h-10",
  };

  return (
    <div className={`${sizes[size]} ${className}`}>
      <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <path d="M16 3 L4 28 L8 28 L10.5 22 L21.5 22 L24 28 L28 28 L16 3Z" fill="#78716c"/>
        <path d="M16 11 L11.5 20 L20.5 20 L16 11Z" fill="currentColor" className="text-white"/>
        <path d="M16 2 C14.5 0, 12.5 2, 12.5 4.5 C12.5 7, 16 10, 16 10 C16 10, 19.5 7, 19.5 4.5 C19.5 2, 17.5 0, 16 2Z" fill="#e8a4a4"/>
      </svg>
    </div>
  );
}
