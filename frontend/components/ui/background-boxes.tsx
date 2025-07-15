"use client";
import React from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export function BackgroundBoxesDemo() {
  return (
    <div className="h-screen relative w-full overflow-hidden flex flex-col items-center justify-center rounded-lg">
      <div className="absolute inset-0 w-full h-full z-20 [mask-image:radial-gradient(transparent,white)] pointer-events-none" />

      <Boxes />
      <div className={cn("md:text-4xl text-x relative z-20")}>
        <h1 className="text-5xl md:text-6xl font-extrabold mb-4">
          Empower Your Curiosity,
          <br />
          <span className="text-[#f97316]">Stack</span> Your Knowledge
        </h1>
      </div>
      <div className="text-center mt-2 relative z-20">
        <p className="text-lg md:text-2xl text-muted-foreground max-w-2xl">
          Ask questions. Share answers. Grow together.
          <br />
          Welcome to <span className="font-bold text-[#f97316]">StackIt</span> —
          your collaborative Q&amp;A platform.
        </p>
      </div>
    </div>
  );
}

export const BoxesCore = ({ className, ...rest }: { className?: string }) => {
  const rows = new Array(150).fill(1);
  const cols = new Array(100).fill(1);
  let colors = [
    // Orange shades from lightest to darkest
    "#FFF7ED", // orange-50
    "#FFEDD5", // orange-100
    "#FED7AA", // orange-200
    "#FDBA74", // orange-300
    "#FB923C", // orange-400
    "#F97316", // orange-500
    "#EA580C", // orange-600
    "#C2410C", // orange-700
    "#9A3412", // orange-800
    "#7C2D12", // orange-900
  ];
  const getRandomColor = () => {
    return colors[Math.floor(Math.random() * colors.length)];
  };

  return (
    <div
      style={{
        transform: `translate(-40%,-60%) skewX(-48deg) skewY(14deg) scale(0.675) rotate(0deg) translateZ(0)`,
      }}
      className={cn(
        "absolute -top-1/4 left-1/4 z-0 flex h-full w-full -translate-x-1/2 -translate-y-1/2 p-4",
        className
      )}
      {...rest}
    >
      {rows.map((_, i) => (
        <motion.div
          key={`row` + i}
          className="relative h-8 w-16 border-l border-black"
        >
          {cols.map((_, j) => (
            <motion.div
              whileHover={{
                backgroundColor: `${getRandomColor()}`,
                transition: { duration: 0 },
              }}
              animate={{
                transition: { duration: 2 },
              }}
              key={`col` + j}
              className="relative h-8 w-16 border-t border-r border-gray-800"
            >
              {j % 2 === 0 && i % 2 === 0 ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="pointer-events-none absolute -top-[14px] -left-[22px] h-6 w-10 stroke-[1px] text-gray-700"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6v12m6-6H6"
                  />
                </svg>
              ) : null}
            </motion.div>
          ))}
        </motion.div>
      ))}
    </div>
  );
};

export const Boxes = React.memo(BoxesCore);
