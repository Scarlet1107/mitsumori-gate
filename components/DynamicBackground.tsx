// components/DynamicBackground.tsx
"use client";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function DynamicBackground() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth <= 768);
  }, []);

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
