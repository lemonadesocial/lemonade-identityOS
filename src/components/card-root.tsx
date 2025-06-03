"use client";

import { ReactNode } from "react";

export default function CardRoot({ children }: { children?: ReactNode }) {
  return <div>{children}</div>;
}
