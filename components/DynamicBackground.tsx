// components/DynamicBackground.tsx
"use client";

export default function DynamicBackground() {
  return (
    <div className="fixed inset-0 -z-10 bg-[url('/background.jpg')] bg-cover bg-center bg-no-repeat" />
  );
};
