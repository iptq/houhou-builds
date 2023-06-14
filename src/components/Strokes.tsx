import { DetailsHTMLAttributes } from "react";

const SVG_CELL_SIZE = 109;

export interface StrokesProps extends DetailsHTMLAttributes<HTMLDivElement> {
  strokeData: string;
  size: number;
}

export default function Strokes({ strokeData, size, style, ...props }: StrokesProps) {
  const decoded = atob(strokeData);

  const svgWidthMatch = decoded.match(/width="(\d+)px"/);
  if (!svgWidthMatch) return null;
  const svgWidth = parseInt(svgWidthMatch[1]);
  console.log("width", svgWidth);

  const numFrames = Math.round(svgWidth / SVG_CELL_SIZE);
  console.log("numFrames", numFrames);

  const keyframes = new Array(numFrames)
    .fill(0)
    .map((_, idx) => {
      const percent = Math.round(idx * (100 / (numFrames + 1)));
      const offset = -size * idx;
      return `${percent}% {
      background-position: ${offset}px;
    }`;
    })
    .join("");

  const encoded = encodeURIComponent(decoded);
  const frameDuration = 1;

  const bgHorizontal = size * numFrames;
  const bgVertical = size;

  return (
    <>
      <style>{`@keyframes kanjiStrokes { ${keyframes} }`}</style>
      <div
        style={{
          ...style,
          width: size,
          height: size,
          backgroundImage: `url("data:image/svg+xml,${encoded}")`,
          backgroundSize: `${bgHorizontal}px ${bgVertical}px`,
          animationName: "kanjiStrokes",
          animationDuration: `${frameDuration * numFrames}s`,
          animationTimingFunction: "step-end",
          animationIterationCount: "infinite",
        }}
        {...props}
      />
    </>
  );
}
