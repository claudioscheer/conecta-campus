import Svg, { Path } from "react-native-svg";
import { colors } from "@/theme/tokens";

interface ChevronLeftIconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export function ChevronLeftIcon({
  size = 24,
  color = colors.ink,
  strokeWidth = 2.5,
}: ChevronLeftIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M15 19l-7-7 7-7"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
