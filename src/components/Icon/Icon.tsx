import React from "react";

import type * as types from "../../lib/types";

import { Circle, Path, Rect } from "react-native-svg";

import Svg from "react-native-svg";

interface IconProps {
  name: types.IconName;
  size?: number;
  color?: string;
}

const getIconPath = (name: string, color?: string) => {
  const common = {
    stroke: color,
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  let path = null;

  switch (name) {
    case "arrow":
      path = <Path d="M5 12h14m-5-5 5 5-5 5" {...common} />;
      break;
    case "check":
      path = (
        <>
          <Circle cx="12" cy="12" r="9" {...common} />
          <Path d="m8 12 2.5 2.5L16 9" {...common} />
        </>
      );
      break;
    case "back":
      path = <Path d="m14.5 5-7 7 7 7" {...common} />;
      break;
    case "chevron":
      path = <Path d="m9 6 6 6-6 6" {...common} />;
      break;
    case "search":
      path = (
        <>
          <Circle cx="10.5" cy="10.5" r="6.5" {...common} />
          <Path d="m16 16 4 4" {...common} />
        </>
      );
      break;
    case "clock":
      path = (
        <>
          <Circle cx="12" cy="12" r="9" {...common} />
          <Path d="M12 7v5l3 2" {...common} />
        </>
      );
      break;
    case "info":
      path = (
        <>
          <Circle cx="12" cy="12" r="9" {...common} />
          <Path d="M12 11v6m0-10v.1" {...common} />
        </>
      );
      break;
    case "warning":
      path = (
        <>
          <Path d="M12 3 2.8 20h18.4L12 3Z" {...common} />
          <Path d="M12 9v4m0 3v.1" {...common} />
        </>
      );
      break;
    case "sun":
      path = (
        <>
          <Circle cx="12" cy="12" r="3.5" {...common} />
          <Path
            d="M12 2v2m0 16v2M2 12h2m16 0h2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4m0-14.2-1.4 1.4M6.3 17.7l-1.4 1.4"
            {...common}
          />
        </>
      );
      break;
    case "moon":
      path = (
        <Path
          d="M20 15.2A8.5 8.5 0 0 1 8.8 4 8.5 8.5 0 1 0 20 15.2Z"
          {...common}
        />
      );
      break;
    case "shield":
      path = (
        <>
          <Path
            d="M12 2.8 20 6v6.2c0 4.8-3.3 7.8-8 9.5-4.7-1.7-8-4.7-8-9.5V6l8-3.2Z"
            {...common}
          />
          <Path d="m8.3 12.2 2.4 2.4 5-5" {...common} />
        </>
      );
      break;
    case "car":
      path = (
        <>
          <Path d="m5 10 2-5h10l2 5M3 10h18v8H3v-8Z" {...common} />
          <Path d="M6 18v2m12-2v2M6.5 14h1m9 0h1" {...common} />
        </>
      );
      break;
    case "file":
      path = (
        <>
          <Path d="M14 3H6v18h12V7l-4-4Z" {...common} />
          <Path d="M14 3v4h4M9 12h6m-6 4h6" {...common} />
        </>
      );
      break;
    case "database":
      path = (
        <>
          <Path
            d="M4 6c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3Z"
            {...common}
          />
          <Path
            d="M4 6v6c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"
            {...common}
          />
        </>
      );
      break;
    case "car":
      path = <Rect x="8" y="10" width="8" height="1" fill="transparent" />;
      break;
    default:
      path = null;
      break;
  }

  return path;
};

export const Icon: React.FC<IconProps> = (props) => {
  const { name, size = 22, color = "#211B18" } = props;

  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      accessibilityElementsHidden
    >
      {getIconPath(name, color)}
    </Svg>
  );
};
