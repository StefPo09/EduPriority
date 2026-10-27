"use client";

import Image from "next/image";
import type { ComponentProps } from "react";
import { useTheme } from "./ThemeContext";

type BrandLogoProps = Pick<ComponentProps<typeof Image>, "className">;

export default function BrandLogo({
  className,
  width = 240,
  height = 60,
}: BrandLogoProps & { width?: number; height?: number }) {
  const { theme } = useTheme();

  return (
    <Image
      src={
        theme === "dark"
          ? "/edupriority-logo-white.webp"
          : "/edupriority-logo.webp"
      }
      alt="EduPriority"
      width={width}
      height={height}
      className={className}
      priority
    />
  );
}
