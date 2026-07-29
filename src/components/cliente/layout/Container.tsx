import { ReactNode } from "react";
import ui from "../../../app/cliente/cliente-ui.module.css";

type ContainerSize = "full" | "large" | "medium" | "narrow";

interface ContainerProps {
  children: ReactNode;
  size?: ContainerSize;
  className?: string;
}

export default function Container({
  children,
  size = "large",
  className = "",
}: ContainerProps) {
  const sizeClass = {
    full: ui.containerFull,
    large: ui.containerLarge,
    medium: ui.containerMedium,
    narrow: ui.containerNarrow,
  }[size];

  return (
    <div className={`${ui.container} ${sizeClass} ${className}`}>
      {children}
    </div>
  );
}
