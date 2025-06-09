import { PropsWithChildren } from "react";

export default function CardWrapper({ children }: PropsWithChildren) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 21,
        padding: 35,
        maxWidth: 400,
        margin: "auto",
        width: "100%",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#000000",
        borderRadius: 21,
      }}
    >
      {children}
    </div>
  );
}
