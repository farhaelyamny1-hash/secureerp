import { useEffect, useRef } from "react";
import JsBarcode from "jsbarcode";

interface BarcodeDisplayProps {
  value: string;
  width?: number;
  height?: number;
  fontSize?: number;
  className?: string;
}

const BarcodeDisplay = ({ value, width = 1.5, height = 40, fontSize = 10, className }: BarcodeDisplayProps) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (svgRef.current && value) {
      try {
        JsBarcode(svgRef.current, value, {
          format: "CODE128",
          width,
          height,
          fontSize,
          displayValue: true,
          margin: 2,
          textMargin: 2,
        });
      } catch {
        // Invalid barcode value
      }
    }
  }, [value, width, height, fontSize]);

  if (!value) return null;

  return <svg ref={svgRef} className={className} />;
};

export default BarcodeDisplay;
