import { Tooltip, type TooltipProps } from "@mantine/core";
import { Info } from "lucide-react";

export function InfoTooltip({
  label,
  position = "top",
}: {
  label: string;
  position?: TooltipProps["position"];
}) {
  return (
    <Tooltip label={label} position={position} multiline>
      <span
        tabIndex={0}
        style={{
          display: "inline-block",
          position: "relative",
          width: 18,
          height: 18,
          marginLeft: 8,
          cursor: "pointer",
        }}
      >
        <Info
          size={16}
          color="#7b7b7b"
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        />
      </span>
    </Tooltip>
  );
}

export default InfoTooltip;
