export type Tick = number
export type ClaudeState = 'idle' | 'working' | 'done'

declare module 'claude-code' {
  interface PluginState {
    'clawd-buddy': { tick: Tick; claude: ClaudeState }
  }
}
