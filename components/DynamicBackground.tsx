// components/DynamicBackground.tsx
"use client";
import Image from "next/image";

export default function DynamicBackground() {
  return (
    <div className="fixed inset-0 -z-10">
      <Image
        src="/background.jpg"
        alt="Background"
        fill
        className="object-cover"
        priority
        quality={75}
      />
    </div>
  );
}
