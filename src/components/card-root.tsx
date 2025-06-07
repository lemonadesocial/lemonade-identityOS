"use client";

import { ReactNode } from "react";

export default function CardRoot({ children }: { children?: ReactNode }) {
  return <div style={{ backgroundColor: "white" }}>{children}</div>;
}
