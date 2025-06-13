import { PropsWithChildren } from "react";

export default function CardWrapper({ children }: PropsWithChildren) {
  return <div className="card-wrapper">{children}</div>;
}
