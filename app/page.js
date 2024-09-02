"use client"

import Experience from "@/components/Experience";
import { Canvas } from "@react-three/fiber";

export default function Home() {
  return (
    <div className="fixed inset-0">
      <Canvas>
        <Experience />
      </Canvas>
    </div>
  );
}
