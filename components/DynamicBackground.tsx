// components/DynamicBackground.tsx
"use client";
import { useState } from "react";
import Image from "next/image";

export default function DynamicBackground() {
  const [isMobile] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }
    return window.innerWidth <= 768;
  });

  const src = isMobile ? "/mobileBackground.png" : "/background.png";

  return (
    <div className="fixed inset-0 -z-10">
      <Image
        src={src}
        alt="Background"
        fill
        className="select-none object-contain object-bottom"
        draggable={false}
        priority
      />
    </div>
  );
}
