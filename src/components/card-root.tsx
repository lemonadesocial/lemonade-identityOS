"use client";

import { PropsWithChildren } from "react";

export default function CardRoot({ children }: PropsWithChildren) {
  return <div className="card-root">{children}</div>;
}
