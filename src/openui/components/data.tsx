import { defineComponent } from "@openuidev/react-lang"
import { z } from "zod/v4"
import { cn } from "@/lib/utils"
import { ArrowDown, ArrowUp } from "lucide-react"
import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

const KpiItemSchema = z.object({
  label: z.string().describe("Metric name."),
  value: z.string().describe("Formatted value e.g. '2.4x' or '$1.2M'."),
  delta: z
    .number()
    .optional()
    .describe("Fractional change e.g. 0.15 means +15%. Negative = bad unless positive_direction is false."),
  positive_direction: z
    .boolean()
    .optional()
    .describe("Whether positive delta is good. Default true."),
  spark: z.array(z.number()).optional().describe("Sparkline series for this tile."),
})

export const LsKpiRow = defineComponent({
  name: "LsKpiRow",
  description:
    "Horizontal row of KPI tiles. Each tile shows label, value, and optional delta badge. Use for top-line metrics.",
  props: z.object({
    items: z.array(KpiItemSchema).describe("KPI tiles, 1–6 items."),
  }),
  component: ({ props }) => (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {props.items.map((item, i) => {
        const isPositiveMove =
          item.delta !== undefined &&
          (item.positive_direction !== false ? item.delta >= 0 : item.delta <= 0)
        const deltaColor =
          item.delta === undefined ? "" : isPositiveMove ? "text-[var(--positive)]" : "text-[var(--negative)]"
        return (
          <div key={i} className="rounded-lg border border-border bg-surface-dark p-3">
            <p className="section-label truncate">{item.label}</p>
            <p className="mt-1 text-lg font-semibold tabular-nums text-foreground">{item.value}</p>
            {item.delta !== undefined && (
              <p className={cn("mt-0.5 flex items-center gap-0.5 text-[10px] font-medium tabular-nums", deltaColor)}>
                {item.delta >= 0 ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />}
                {item.delta >= 0 ? "+" : ""}
                {(item.delta * 100).toFixed(1)}%
              </p>
            )}
            {item.spark && item.spark.length > 0 && (
              <div className="mt-1.5 h-6 w-16">
                <ResponsiveContainer width={64} height={24}>
                  <LineChart data={item.spark.map((v, si) => ({ i: si, v }))}>
                    <Line
                      type="monotone"
                      dataKey="v"
                      stroke="var(--primary)"
                      strokeWidth={1.5}
                      dot={false}
                      isAnimationActive={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )
      })}
    </div>
  ),
})

export const LsDataTable = defineComponent({
  name: "LsDataTable",
  description:
    "Simple data table with header row and data rows. Use for attribution breakdowns, channel comparisons, tabular results.",
  props: z.object({
    headers: z.array(z.string()).describe("Column header labels."),
    rows: z.array(z.array(z.string())).describe("Data rows, each matching the headers array length."),
    caption: z.string().optional().describe("Optional table caption shown below."),
  }),
  component: ({ props }) => (
    <div className="w-full overflow-auto rounded-lg border border-border">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-border bg-accent">
            {props.headers.map((h, i) => (
              <th
                key={i}
                className="px-4 py-2 text-left text-[10px] font-medium uppercase tracking-wider text-muted-foreground"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {props.rows.map((row, ri) => (
            <tr
              key={ri}
              className="border-b border-border transition-colors last:border-0 hover:bg-row-highlight"
            >
              {row.map((cell, ci) => (
                <td key={ci} className="px-4 py-2 tabular-nums text-foreground">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {props.caption && <p className="px-4 py-2 text-xs text-muted-foreground">{props.caption}</p>}
    </div>
  ),
})

export const LsComparison = defineComponent({
  name: "LsComparison",
  description:
    "Three-column comparison table (Metric | Option A | Option B). Use for before/after or action/inaction metric comparisons.",
  props: z.object({
    headers: z
      .tuple([z.string(), z.string(), z.string()])
      .describe("Exactly 3 column headers: [metric, option_a, option_b]."),
    rows: z.array(z.array(z.string())).describe("Data rows with 3 cells each."),
  }),
  component: ({ props }) => (
    <div className="w-full overflow-auto rounded-lg border border-border">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-border bg-accent">
            {props.headers.map((h, i) => (
              <th
                key={i}
                className={cn(
                  "px-4 py-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground",
                  i === 0 ? "text-left" : "text-right"
                )}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {props.rows.map((row, ri) => (
            <tr
              key={ri}
              className="border-b border-border transition-colors last:border-0 hover:bg-row-highlight"
            >
              {row.map((cell, ci) => (
                <td
                  key={ci}
                  className={cn(
                    "px-4 py-2",
                    ci === 0
                      ? "text-left text-muted-foreground"
                      : "text-right font-medium tabular-nums text-foreground"
                  )}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ),
})

const ChartDataPointSchema = z.object({
  name: z.string(),
  value: z.number(),
  value2: z.number().optional(),
})

export const LsChart = defineComponent({
  name: "LsChart",
  description:
    "Bar or line chart. Use for time-series, channel performance, scenario curves. Supports one or two data series.",
  props: z.object({
    type: z.enum(["bar", "line"]).describe("Chart type. 'bar' for categorical, 'line' for time-series."),
    data: z
      .array(ChartDataPointSchema)
      .describe(
        "Data points with name and value (and optional value2 for dual-series)."
      ),
    label: z.string().optional().describe("Y-axis label or chart description."),
    label2: z.string().optional().describe("Second series label for dual-series charts."),
    height: z.number().optional().describe("Chart height in px. Default 220."),
    options: z
      .object({
        area: z.boolean().optional().describe("Fill the area under a line series."),
        referenceLines: z
          .array(z.object({ value: z.number(), label: z.string().optional() }))
          .optional()
          .describe("Dashed horizontal reference lines (e.g. targets, thresholds)."),
        unit: z
          .string()
          .optional()
          .describe("Unit appended to Y-axis ticks and tooltip values, e.g. '%' or '$K'."),
      })
      .optional()
      .describe("Optional chart enhancements: area fill, reference lines, value unit."),
  }),
  component: ({ props }) => {
    const h = props.height ?? 220
    const color1 = "var(--chart-1)"
    const color2 = "var(--chart-3)"
    const hasSecond = props.data.some((d) => d.value2 !== undefined)
    const unit = props.options?.unit
    const referenceLines = props.options?.referenceLines
    const useArea = props.options?.area === true && props.type === "line"

    const fmt = (v: number | string) => (unit ? `${v}${unit}` : `${v}`)
    const yTickFormatter = unit ? (v: number) => fmt(v) : undefined
    const tooltipFormatter = unit
      ? (value: number | string) => fmt(value)
      : undefined
    const gradId1 = "ls-chart-grad-1"
    const gradId2 = "ls-chart-grad-2"
    const areaId1 = "ls-chart-area-1"
    const areaId2 = "ls-chart-area-2"

    const sharedAxes = (
      <>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis
          dataKey="name"
          tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={yTickFormatter}
        />
        <Tooltip
          formatter={tooltipFormatter}
          contentStyle={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: 6,
            color: "var(--foreground)",
          }}
        />
        {referenceLines?.map((rl, ri) => (
          <ReferenceLine
            key={ri}
            y={rl.value}
            stroke="var(--muted-foreground)"
            strokeDasharray="4 4"
            strokeOpacity={0.6}
            label={
              rl.label
                ? { value: rl.label, fill: "var(--muted-foreground)", fontSize: 10, position: "insideTopRight" }
                : undefined
            }
          />
        ))}
      </>
    )

    return (
      <div className="w-full">
        {props.label && <p className="mb-2 text-xs text-muted-foreground">{props.label}</p>}
        <ResponsiveContainer width="100%" height={h}>
          {props.type === "line" ? (
            useArea ? (
              <ComposedChart data={props.data}>
                <defs>
                  <linearGradient id={areaId1} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color1} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={color1} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id={areaId2} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color2} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={color2} stopOpacity={0} />
                  </linearGradient>
                </defs>
                {sharedAxes}
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={color1}
                  strokeWidth={2}
                  fill={`url(#${areaId1})`}
                  dot={false}
                  name={props.label ?? "Value"}
                />
                {hasSecond && (
                  <Area
                    type="monotone"
                    dataKey="value2"
                    stroke={color2}
                    strokeWidth={2}
                    fill={`url(#${areaId2})`}
                    dot={false}
                    name={props.label2 ?? "Value 2"}
                  />
                )}
              </ComposedChart>
            ) : (
              <LineChart data={props.data}>
                {sharedAxes}
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={color1}
                  strokeWidth={2}
                  dot={false}
                  name={props.label ?? "Value"}
                />
                {hasSecond && (
                  <Line
                    type="monotone"
                    dataKey="value2"
                    stroke={color2}
                    strokeWidth={2}
                    dot={false}
                    name={props.label2 ?? "Value 2"}
                  />
                )}
              </LineChart>
            )
          ) : (
            <BarChart data={props.data}>
              <defs>
                <linearGradient id={gradId1} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color1} stopOpacity={0.95} />
                  <stop offset="100%" stopColor={color1} stopOpacity={0.35} />
                </linearGradient>
                <linearGradient id={gradId2} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color2} stopOpacity={0.95} />
                  <stop offset="100%" stopColor={color2} stopOpacity={0.35} />
                </linearGradient>
              </defs>
              {sharedAxes}
              <Bar
                dataKey="value"
                fill={`url(#${gradId1})`}
                radius={[3, 3, 0, 0]}
                name={props.label ?? "Value"}
              />
              {hasSecond && (
                <Bar
                  dataKey="value2"
                  fill={`url(#${gradId2})`}
                  radius={[3, 3, 0, 0]}
                  name={props.label2 ?? "Value 2"}
                />
              )}
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    )
  },
})
