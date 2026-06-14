import "@testing-library/jest-dom"

// jsdom doesn't implement scrollIntoView — provide a no-op mock
Element.prototype.scrollIntoView = () => {}

// jsdom doesn't implement ResizeObserver — needed by Recharts ResponsiveContainer
// (rendered inside OpenUI charts) and some Radix primitives.
if (!("ResizeObserver" in globalThis)) {
  class ResizeObserverMock {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  ;(globalThis as unknown as { ResizeObserver: unknown }).ResizeObserver = ResizeObserverMock
}

// jsdom doesn't implement matchMedia — needed by the sidebar's use-mobile hook
if (!window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as unknown as MediaQueryList
}
