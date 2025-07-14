let ffmpegInstance: any = null;

export async function initFFmpeg(): Promise<{
    FS: (op: string, ...args: any[]) => any;
    callMain: (args: string[]) => void;
}> {
    if (ffmpegInstance) return ffmpegInstance;

    const wasmBinary = await fetch('ffmpeg.wasm')
        .then(res => res.arrayBuffer());

    const memory = new WebAssembly.Memory({ initial: 256, maximum: 512 });
    const env: any = {
        memory,
        table: new WebAssembly.Table({ initial: 0, element: 'anyfunc' }),
        abort: () => console.error('abort'),
        __memory_base: 0,
        __table_base: 0,
    };

    const { instance } = await WebAssembly.instantiate(wasmBinary, { env });

    // Fake virtual FS using Emscripten-style interface
    // @ts-ignore
    const FS: any = (instance.exports as any).FS || globalThis.FS;
    const callMain = (instance.exports as any).callMain || (globalThis as any).callMain;

    if (!FS || !callMain) {
        throw new Error("FFmpeg module does not expose FS or callMain");
    }

    ffmpegInstance = { FS, callMain };
    return ffmpegInstance;
}
