"use client";

import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import Link from "next/link";

const ORANGE = "#f97316";

export function Logo({
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`flex items-center font-bold text-4xl p-4 select-none ${className}`}
      {...props}
    >
      <Link href="/">
        <span>Stack</span>
        <span style={{ color: ORANGE }}>It</span>
      </Link>
    </div>
  );
}

export default Logo;
