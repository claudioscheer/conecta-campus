import Svg, { Path } from "react-native-svg";

type GoogleIconProps = {
  size?: number;
  color?: string;
};

export function GoogleIcon({ size = 18, color = "#FFFFFF" }: GoogleIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M23.04 12.261c0-.85-.07-1.666-.213-2.455H12v4.643h6.19c-.267 1.442-1.077 2.663-2.296 3.48v2.89h3.72c2.176-2.003 3.426-4.954 3.426-8.558z"
        fill={color}
      />
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 23.498c3.104 0 5.707-1.028 7.61-2.784l-3.72-2.89c-1.03.69-2.348 1.097-3.89 1.097-2.992 0-5.525-2.02-6.43-4.737H1.724v2.981C3.633 21.002 7.532 23.498 12 23.498z"
        fill={color}
      />
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M5.57 14.184c-.23-.69-.362-1.428-.362-2.184s.132-1.494.362-2.184V6.835H1.724C.95 8.375.5 10.134.5 12s.45 3.625 1.224 5.165l3.846-2.981z"
        fill={color}
      />
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 4.75c1.688 0 3.203.58 4.397 1.719l3.298-3.298C17.702 1.34 15.099.5 12 .5 7.532.5 3.633 2.998 1.724 6.835l3.846 2.981C6.475 7.1 9.008 4.75 12 4.75z"
        fill={color}
      />
    </Svg>
  );
}
