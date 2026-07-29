import { ReactNode } from "react";
import Container from "./Container";
import ui from "../../../app/cliente/cliente-ui.module.css";

interface MainContentProps {
  children: ReactNode;
  containerSize?: "full" | "large" | "medium" | "narrow";
  className?: string;
}

export default function MainContent({
  children,
  containerSize = "large",
  className = "",
}: MainContentProps) {
  return (
    <main className={`${ui.mainContent} ${className}`}>
      <Container size={containerSize}>
        {children}
      </Container>
    </main>
  );
}
