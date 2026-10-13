export type Tick = number

declare module 'claude-code' {
  interface PluginState {
    'clawd-buddy': { tick: Tick }
  }
}
