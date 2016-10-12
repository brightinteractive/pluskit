export interface WebpackRequireContext {
  keys(): string[]
  (id: string): any
}