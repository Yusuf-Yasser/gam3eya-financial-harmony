
import { ReactElement } from "react";
import { ResponsiveContainer } from "recharts";

interface ChartContainerProps {
  height?: number | string;
  children: ReactElement;
}

export function ChartContainer({ height = 300, children }: ChartContainerProps) {
  return (
    <div style={{ height: typeof height === 'number' ? `${height}px` : height }}>
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  );
}
