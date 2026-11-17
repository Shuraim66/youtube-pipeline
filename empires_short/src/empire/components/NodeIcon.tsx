import React from "react";
import {
  AlertTriangle,
  Crown,
  Gavel,
  Handshake,
  Lock,
  Skull,
  Store,
  TrendingDown,
  Wifi,
  type LucideIcon,
} from "lucide-react";
import type { IconKey } from "../types";

const ICONS: Record<IconKey, LucideIcon> = {
  store: Store,
  handshake: Handshake,
  crown: Crown,
  wifi: Wifi,
  trendingDown: TrendingDown,
  gavel: Gavel,
  lock: Lock,
  skull: Skull,
  alert: AlertTriangle,
};

interface NodeIconProps {
  icon: IconKey;
  color: string;
  size?: number;
}

export const NodeIcon: React.FC<NodeIconProps> = ({ icon, color, size = 72 }) => {
  const Icon = ICONS[icon];
  return <Icon size={size} color={color} strokeWidth={2.4} />;
};
