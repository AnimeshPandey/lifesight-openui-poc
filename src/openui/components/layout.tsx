import { defineComponent, useRenderNode } from "@openuidev/react-lang"
import { z } from "zod/v4"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export const LsStack = defineComponent({
  name: "LsStack",
  description:
    "Root layout container. Stacks children vertically (default) or horizontally. Use as the outermost element for every response.",
  props: z.object({
    direction: z
      .enum(["vertical", "horizontal"])
      .optional()
      .describe("Layout axis. Default: vertical."),
    gap: z.enum(["sm", "md", "lg"]).optional().describe("Gap between children. Default: md."),
    children: z.array(z.any()).optional().describe("Child components."),
  }),
  component: ({ props }) => {
    const renderNode = useRenderNode()
    const gapClass = { sm: "gap-3", md: "gap-5", lg: "gap-8" }[props.gap ?? "md"]
    const dirClass = props.direction === "horizontal" ? "flex flex-row flex-wrap" : "flex flex-col"
    return (
      <div className={cn(dirClass, gapClass, "w-full")}>
        {(props.children ?? []).map((c, i) => (
          <div key={i}>{renderNode(c)}</div>
        ))}
      </div>
    )
  },
})

export const LsCard = defineComponent({
  name: "LsCard",
  description:
    "Surfaced content block with optional title. Wraps KPIs, tables, charts, or any grouped content.",
  props: z.object({
    title: z.string().optional().describe("Card heading shown above content."),
    children: z.array(z.any()).optional().describe("Child components inside the card."),
  }),
  component: ({ props }) => {
    const renderNode = useRenderNode()
    return (
      <Card className="border-border bg-card ring-1 ring-foreground/10">
        {props.title && (
          <CardHeader className="px-4 py-2.5">
            <CardTitle className="text-sm font-medium text-muted-foreground">{props.title}</CardTitle>
          </CardHeader>
        )}
        <CardContent className={cn("flex flex-col gap-4", props.title ? "pt-0" : "pt-4")}>
          {(props.children ?? []).map((c, i) => (
            <div key={i}>{renderNode(c)}</div>
          ))}
        </CardContent>
      </Card>
    )
  },
})

export const LsTabs = defineComponent({
  name: "LsTabs",
  description:
    "Tabbed container. Each tab has a label and children. Use for multi-view content like Simulation / Evidence / Trace.",
  props: z.object({
    tabs: z
      .array(
        z.object({
          label: z.string().describe("Tab button text."),
          children: z.array(z.any()).optional().describe("Content for this tab."),
        })
      )
      .describe("Array of tab definitions."),
    defaultTab: z.string().optional().describe("Label of the initially active tab."),
  }),
  component: ({ props }) => {
    const renderNode = useRenderNode()
    const first = props.tabs[0]?.label ?? ""
    return (
      <Tabs defaultValue={props.defaultTab ?? first}>
        <TabsList className="h-8 bg-accent">
          {props.tabs.map((t) => (
            <TabsTrigger key={t.label} value={t.label} className="text-xs h-7">
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {props.tabs.map((t) => (
          <TabsContent key={t.label} value={t.label} className="mt-4 flex flex-col gap-4">
            {(t.children ?? []).map((c, i) => (
              <div key={i}>{renderNode(c)}</div>
            ))}
          </TabsContent>
        ))}
      </Tabs>
    )
  },
})
