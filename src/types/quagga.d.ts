declare module 'quagga' {
  interface QuaggaConfig {
    inputStream: {
      name?: string;
      type?: string;
      target?: HTMLElement;
      constraints?: {
        width?: number;
        height?: number;
        facingMode?: string;
      };
    };
    locator?: {
      patchSize?: string;
      halfSample?: boolean;
    };
    numOfWorkers?: number;
    decoder?: {
      readers?: string[];
    };
    locate?: boolean;
  }

  interface Box {
    x: number;
    y: number;
    width: number;
    height: number;
  }

  interface Line {
    x: number[];
    y: number[];
  }

  interface CodeResult {
    code: string;
    format: string;
  }

  interface ProcessResult {
    boxes?: Box[];
    box?: Box;
    line?: Line;
    codeResult?: CodeResult;
  }

  interface QuaggaResult {
    codeResult: CodeResult;
  }

  interface Canvas {
    ctx: {
      overlay: CanvasRenderingContext2D;
    };
    dom: {
      overlay: HTMLCanvasElement;
    };
  }

  interface ImageDebug {
    drawPath: (path: Box | Line, start: { x: any; y: any }, ctx: CanvasRenderingContext2D, style: { color: string; lineWidth: number }) => void;
  }

  const canvas: Canvas;
  const ImageDebug: ImageDebug;

  function init(config: QuaggaConfig, callback?: (err: Error | null) => void): void;
  function start(): void;
  function stop(): void;
  function onDetected(callback: (result: QuaggaResult) => void): void;
  function onProcessed(callback: (result: ProcessResult | null) => void): void;
}

export default Quagga; 