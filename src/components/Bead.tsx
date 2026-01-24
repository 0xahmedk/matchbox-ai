import { Box, Text } from "@mantine/core";

export function Bead({
  color = "#e74c3c",
  size = 14,
  label,
}: {
  color?: string;
  size?: number;
  label?: string;
}) {
  return (
    <Box
      component="span"
      style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
    >
      <span
        aria-hidden
        style={{
          width: size,
          height: size,
          backgroundColor: color,
          borderRadius: "50%",
          display: "inline-block",
          boxShadow: "0 0 0 1px rgba(0,0,0,0.06) inset",
        }}
      />
      {label ? (
        <Text component="span" size="sm">
          {label}
        </Text>
      ) : null}
    </Box>
  );
}
