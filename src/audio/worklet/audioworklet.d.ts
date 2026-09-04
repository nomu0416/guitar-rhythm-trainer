// lib.dom.d.ts には AudioWorkletGlobalScope 側の型(AudioWorkletProcessor, registerProcessor,
// sampleRate, currentTime 等)が含まれていないため、最小限のアンビエント宣言を手動で用意する。
// (外部 @types パッケージはメンテナンス頻度が低いため使わない。design.md 6章参照)

declare class AudioWorkletProcessor {
  readonly port: MessagePort
  constructor(options?: AudioWorkletNodeOptions)
  process(
    inputs: Float32Array[][],
    outputs: Float32Array[][],
    parameters: Record<string, Float32Array>,
  ): boolean
}

declare function registerProcessor(
  name: string,
  processorCtor: new (options?: AudioWorkletNodeOptions) => AudioWorkletProcessor,
): void

declare const sampleRate: number
declare const currentTime: number
