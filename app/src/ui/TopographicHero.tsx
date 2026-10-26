import { StyleSheet, View } from "react-native";
import Svg, { G, Path, Rect } from "react-native-svg";
import { colors } from "@/theme/tokens";

type TopographicHeroProps = {
  height?: number;
};

// Contour styling
const cThick = "rgba(255, 255, 255, 0.32)";
const cMed = "rgba(255, 255, 255, 0.20)";
const cThin = "rgba(255, 255, 255, 0.12)";
const cFill = "rgba(255, 255, 255, 0.05)";

// Bottom wave: curves down from left (y=230) through center-right dip (y=295) and sweeps to right (y=265)
const wavePath =
  "M 0 230 C 80 220, 175 255, 250 295 C 300 320, 350 300, 390 265 L 390 340 L 0 340 Z";

const contours = [
  // Peak A (Upper Left-Center ~110, 85)
  { d: "M 105 80 C 115 75, 125 82, 120 92 C 114 98, 98 94, 105 80 Z", stroke: cThick, fill: cFill, w: 1.5 },
  { d: "M 94 72 C 118 60, 138 74, 132 98 C 126 116, 92 112, 84 96 C 80 84, 84 76, 94 72 Z", stroke: cMed, fill: "none", w: 1.2 },
  { d: "M 80 62 C 122 45, 154 65, 145 108 C 138 132, 85 128, 70 108 C 60 92, 65 72, 80 62 Z", stroke: cMed, fill: "none", w: 1.2 },
  { d: "M 66 50 C 128 28, 172 56, 160 120 C 150 152, 75 145, 52 118 C 40 96, 46 66, 66 50 Z", stroke: cThick, fill: cFill, w: 1.5 },
  { d: "M 52 38 C 132 12, 192 48, 178 132 C 165 170, 65 162, 36 128 C 22 102, 28 58, 52 38 Z", stroke: cThin, fill: "none", w: 1 },

  // Peak B (Upper Right ~295, 65)
  { d: "M 292 60 C 302 55, 312 62, 308 72 C 302 78, 286 76, 292 60 Z", stroke: cThick, fill: cFill, w: 1.5 },
  { d: "M 280 50 C 310 38, 330 52, 324 78 C 318 96, 276 92, 270 76 C 265 65, 270 56, 280 50 Z", stroke: cMed, fill: "none", w: 1.2 },
  { d: "M 264 40 C 318 22, 348 42, 340 88 C 332 116, 260 110, 250 90 C 242 74, 250 50, 264 40 Z", stroke: cMed, fill: "none", w: 1.2 },
  { d: "M 248 28 C 326 6, 368 30, 356 100 C 346 135, 245 126, 230 100 C 220 78, 230 42, 248 28 Z", stroke: cThick, fill: cFill, w: 1.5 },

  // Saddle enclosing Peak A and B
  { d: "M 38 28 C 140 -8, 360 -6, 372 110 C 360 150, 230 142, 185 125 C 150 110, 140 148, 80 162 C 30 150, 10 90, 38 28 Z", stroke: cThin, fill: "none", w: 1 },

  // Peak C (Mid-Right / Lower ~285, 175)
  { d: "M 280 170 C 290 165, 298 170, 294 180 C 288 188, 274 184, 280 170 Z", stroke: cThick, fill: cFill, w: 1.5 },
  { d: "M 268 158 C 300 146, 320 160, 312 188 C 304 208, 262 202, 254 184 C 248 172, 256 164, 268 158 Z", stroke: cMed, fill: "none", w: 1.2 },
  { d: "M 250 146 C 310 130, 338 150, 328 200 C 318 228, 245 220, 234 196 C 226 178, 234 158, 250 146 Z", stroke: cMed, fill: "none", w: 1.2 },
  { d: "M 235 134 C 320 115, 355 140, 344 212 C 332 248, 230 238, 215 208 C 205 186, 216 148, 235 134 Z", stroke: cThick, fill: cFill, w: 1.5 },

  // Island / Lake loop near right (330, 140)
  { d: "M 342 145 C 352 140, 360 148, 355 158 C 348 165, 334 158, 342 145 Z", stroke: cMed, fill: cFill, w: 1.2 },

  // Peak D (Lower-Left elevation ~70, 195)
  { d: "M 65 190 C 78 182, 90 190, 85 202 C 80 210, 58 205, 65 190 Z", stroke: cMed, fill: "none", w: 1.2 },
  { d: "M 50 178 C 88 165, 110 180, 102 212 C 95 230, 42 225, 34 205 C 28 190, 38 182, 50 178 Z", stroke: cThin, fill: "none", w: 1 },

  // Sweeping undulating contour curves
  { d: "M -20 150 C 40 165, 110 190, 180 170 C 210 160, 215 125, 195 105 C 180 90, 185 60, 215 45 C 240 30, 260 -5, 240 -30", stroke: cThin, fill: "none", w: 1 },
  { d: "M -20 185 C 45 200, 120 220, 190 205 C 235 195, 260 225, 310 215 C 360 205, 385 185, 410 175", stroke: cMed, fill: "none", w: 1.2 },
  { d: "M -10 215 C 60 230, 140 250, 210 235 C 260 225, 310 248, 365 230 C 390 220, 400 205, 410 195", stroke: cThick, fill: "none", w: 1.5 },
  { d: "M -10 245 C 70 260, 150 280, 225 265 C 275 252, 330 270, 410 240", stroke: cThin, fill: "none", w: 1 },
  { d: "M -10 100 C 20 60, 50 0, 120 -10 C 180 -20, 210 20, 215 50", stroke: cThin, fill: "none", w: 1 },
  { d: "M 150 -20 C 170 20, 200 50, 220 30 C 240 10, 290 -20, 330 -20", stroke: cThin, fill: "none", w: 1 },
  { d: "M 320 240 C 350 225, 380 210, 410 195", stroke: cMed, fill: "none", w: 1.2 },
  { d: "M 300 265 C 340 248, 380 235, 410 220", stroke: cThin, fill: "none", w: 1 },
];

export function TopographicHero({ height = 340 }: TopographicHeroProps) {
  return (
    <View style={[styles.container, { height }]}>
      <Svg
        width="100%"
        height="100%"
        viewBox="0 0 390 340"
        preserveAspectRatio="none"
      >
        {/* Navy Primary Base */}
        <Rect width="390" height="340" fill={colors.primary} />
        {/* Subtle deep shade */}
        <Rect width="390" height="340" fill={colors.primaryDeep} opacity={0.3} />

        {/* Topographic Elevation Curves */}
        <G fill="none" strokeLinecap="round" strokeLinejoin="round">
          {contours.map((c, i) => (
            <Path
              key={i}
              d={c.d}
              stroke={c.stroke}
              strokeWidth={c.w}
              fill={c.fill}
            />
          ))}
        </G>

        {/* Organic Bottom Wave Divider transitioning into paper background */}
        <Path d={wavePath} fill={colors.paper} />
        <Path
          d="M 0 230 C 80 220, 175 255, 250 295 C 300 320, 350 300, 390 265"
          fill="none"
          stroke={colors.paper}
          strokeWidth={2.5}
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: colors.primary,
    overflow: "hidden",
  },
});
