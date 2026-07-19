"use client";
import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Environment, ContactShadows } from "@react-three/drei";
import type * as THREE from "three";
import type { Crop, CropCategory } from "@/data/crops/types";

type StyleKey = "cereal" | "fruit" | "vegetable" | "pulse" | "leaf" | "spice";

function styleForCategory(cat?: CropCategory): StyleKey {
  switch (cat) {
    case "Cereal":
    case "Millet": return "cereal";
    case "Fruit": return "fruit";
    case "Vegetable":
    case "Horticulture": return "vegetable";
    case "Pulse":
    case "Oilseed": return "pulse";
    case "Spice":
    case "Medicinal": return "spice";
    default: return "leaf";
  }
}

function paletteFor(style: StyleKey) {
  switch (style) {
    case "cereal": return { leaf: "#4ade80", accent: "#fbbf24", pot: "#78350f" };
    case "fruit": return { leaf: "#16a34a", accent: "#ef4444", pot: "#7c2d12" };
    case "vegetable": return { leaf: "#22c55e", accent: "#f97316", pot: "#6b21a8" };
    case "pulse": return { leaf: "#34d399", accent: "#84cc16", pot: "#713f12" };
    case "spice": return { leaf: "#65a30d", accent: "#dc2626", pot: "#78350f" };
    default: return { leaf: "#22c55e", accent: "#a3e635", pot: "#4c1d95" };
  }
}

function Plant({ style, colors, reducedMotion }: { style: StyleKey; colors: ReturnType<typeof paletteFor>; reducedMotion?: boolean }) {
  const group = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!group.current) return;
    if (reducedMotion) {
      // Freeze the plant in a pleasant static pose — no scroll or time rotation.
      group.current.rotation.y = 0.4;
      group.current.rotation.x = 0.05;
      return;
    }
    const el = typeof document !== "undefined" ? document.documentElement : null;
    const p = el ? el.scrollTop / Math.max(1, el.scrollHeight - el.clientHeight) : 0;
    group.current.rotation.y = state.clock.elapsedTime * 0.35 + p * Math.PI * 2;
    group.current.rotation.x = Math.sin(p * Math.PI) * 0.18;
  });

  // Leaves — 5 elliptical planes fanned around the stem
  const leaves = useMemo(() => new Array(5).fill(0).map((_, i) => i), []);

  return (
    <group ref={group} position={[0, -0.6, 0]}>
      {/* pot */}
      <mesh position={[0, -0.8, 0]} castShadow>
        <cylinderGeometry args={[0.55, 0.42, 0.5, 24]} />
        <meshStandardMaterial color={colors.pot} roughness={0.9} />
      </mesh>
      {/* soil */}
      <mesh position={[0, -0.56, 0]}>
        <cylinderGeometry args={[0.53, 0.53, 0.06, 24]} />
        <meshStandardMaterial color="#3f2711" roughness={1} />
      </mesh>
      {/* stem */}
      <mesh position={[0, 0.1, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.07, 1.6, 12]} />
        <meshStandardMaterial color="#166534" roughness={0.7} />
      </mesh>

      {/* leaves */}
      {leaves.map((i) => {
        const angle = (i / leaves.length) * Math.PI * 2;
        const y = 0.1 + (i % 2 === 0 ? 0.15 : -0.15);
        return (
          <group key={i} position={[0, y, 0]} rotation={[0, angle, 0.6]}>
            <mesh position={[0.45, 0.05, 0]} castShadow>
              <sphereGeometry args={[0.35, 24, 24]} />
              <meshStandardMaterial color={colors.leaf} roughness={0.55} metalness={0.05} />
            </mesh>
          </group>
        );
      })}

      {/* Top ornament — depends on style */}
      {style === "cereal" && (
        <group position={[0, 0.95, 0]}>
          {new Array(6).fill(0).map((_, i) => (
            <mesh key={i} position={[0, i * 0.09, 0]} castShadow>
              <sphereGeometry args={[0.11 - i * 0.008, 16, 16]} />
              <meshStandardMaterial color={colors.accent} roughness={0.4} />
            </mesh>
          ))}
        </group>
      )}
      {style === "fruit" && (
        <mesh position={[0, 0.95, 0]} castShadow>
          <sphereGeometry args={[0.35, 32, 32]} />
          <meshStandardMaterial color={colors.accent} roughness={0.35} />
        </mesh>
      )}
      {style === "vegetable" && (
        <mesh position={[0, 0.95, 0]} castShadow>
          <icosahedronGeometry args={[0.32, 0]} />
          <meshStandardMaterial color={colors.accent} roughness={0.55} flatShading />
        </mesh>
      )}
      {style === "pulse" && (
        <group position={[0, 0.95, 0]}>
          {[0, 1, 2].map((i) => (
            <mesh key={i} position={[Math.cos(i * 2) * 0.18, i * 0.12, Math.sin(i * 2) * 0.18]} castShadow>
              <capsuleGeometry args={[0.08, 0.22, 6, 12]} />
              <meshStandardMaterial color={colors.accent} roughness={0.4} />
            </mesh>
          ))}
        </group>
      )}
      {style === "spice" && (
        <group position={[0, 0.95, 0]}>
          {[0, 1, 2, 3].map((i) => (
            <mesh key={i} position={[Math.cos(i) * 0.14, i * 0.08, Math.sin(i) * 0.14]} rotation={[0, i, 0.4]} castShadow>
              <capsuleGeometry args={[0.05, 0.28, 6, 10]} />
              <meshStandardMaterial color={colors.accent} roughness={0.35} />
            </mesh>
          ))}
        </group>
      )}
      {style === "leaf" && (
        <mesh position={[0, 1.05, 0]} rotation={[0, 0, 0.5]} castShadow>
          <sphereGeometry args={[0.28, 24, 24]} />
          <meshStandardMaterial color={colors.leaf} roughness={0.5} />
        </mesh>
      )}
    </group>
  );
}

export function CropModelScene({ crop }: { crop: Crop }) {
  const style = styleForCategory(crop.category);
  const colors = paletteFor(style);

  return (
    <Canvas
      shadows
      dpr={[1, 1.5]}
      camera={{ position: [0, 0.6, 3.4], fov: 42 }}
      gl={{ antialias: true, powerPreference: "high-performance", alpha: true }}
      style={{ background: "transparent" }}
    >
      <ambientLight intensity={0.55} />
      <directionalLight position={[3, 5, 2]} intensity={1.2} castShadow shadow-mapSize={[1024, 1024]} />
      <directionalLight position={[-3, 2, -2]} intensity={0.4} color="#7dd3fc" />
      <Float speed={1.2} rotationIntensity={0.3} floatIntensity={0.6}>
        <Plant style={style} colors={colors} />
      </Float>
      <ContactShadows position={[0, -1.35, 0]} opacity={0.4} scale={5} blur={2.5} far={2} />
      <Environment preset="sunset" />
    </Canvas>
  );
}
