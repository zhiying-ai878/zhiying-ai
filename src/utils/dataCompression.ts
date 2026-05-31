export class DataCompression {
  private static instance: DataCompression;

  private constructor() {}

  public static getInstance(): DataCompression {
    if (!DataCompression.instance) {
      DataCompression.instance = new DataCompression();
    }
    return DataCompression.instance;
  }

  public async compressData(data: any): Promise<string> {
    try {
      const jsonString = JSON.stringify(data);
      const encoder = new TextEncoder();
      const uint8Array = encoder.encode(jsonString);
      
      const compressedBuffer = await this.compressBuffer(uint8Array);
      return this.arrayBufferToBase64(compressedBuffer);
    } catch (error) {
      console.error('数据压缩失败', error);
      // 如果压缩失败，返回原始JSON字符串
      return JSON.stringify(data);
    }
  }

  public async decompressData(compressedData: string): Promise<any> {
    try {
      const compressedBuffer = this.base64ToArrayBuffer(compressedData);
      const decompressedBuffer = await this.decompressBuffer(compressedBuffer);
      
      const decoder = new TextDecoder();
      const jsonString = decoder.decode(decompressedBuffer);
      return JSON.parse(jsonString);
    } catch (error) {
      console.error('数据解压缩失败', error);
      // 如果解压缩失败，尝试直接解析JSON
      try {
        return JSON.parse(compressedData);
      } catch (parseError) {
        console.error('JSON解析失败', parseError);
        return null;
      }
    }
  }

  private async compressBuffer(buffer: Uint8Array): Promise<ArrayBuffer> {
    if (!('CompressionStream' in window)) {
      console.warn('浏览器不支持CompressionStream，使用原始数据');
      return buffer.buffer as ArrayBuffer;
    }

    const compressedStream = new CompressionStream('gzip');
    const writer = compressedStream.writable.getWriter();
    await writer.write(buffer as BufferSource);
    await writer.close();

    const chunks: Uint8Array[] = [];
    const reader = compressedStream.readable.getReader();
    let result;
    
    while (!(result = await reader.read()).done) {
      chunks.push(result.value);
    }

    const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
    const concatenated = new Uint8Array(totalLength);
    let offset = 0;
    
    for (const chunk of chunks) {
      concatenated.set(chunk, offset);
      offset += chunk.length;
    }

    return concatenated.buffer as ArrayBuffer;
  }

  private async decompressBuffer(buffer: ArrayBuffer): Promise<ArrayBuffer> {
    if (!('DecompressionStream' in window)) {
      console.warn('浏览器不支持DecompressionStream，返回原始数据');
      return buffer;
    }

    const decompressedStream = new DecompressionStream('gzip');
    const writer = decompressedStream.writable.getWriter();
    await writer.write(new Uint8Array(buffer));
    await writer.close();

    const chunks: Uint8Array[] = [];
    const reader = decompressedStream.readable.getReader();
    let result;
    
    while (!(result = await reader.read()).done) {
      chunks.push(result.value);
    }

    const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
    const concatenated = new Uint8Array(totalLength);
    let offset = 0;
    
    for (const chunk of chunks) {
      concatenated.set(chunk, offset);
      offset += chunk.length;
    }

    return concatenated.buffer;
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    
    return btoa(binary);
  }

  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    
    return bytes.buffer;
  }

  public calculateCompressionRatio(originalData: any): Promise<number> {
    return new Promise(async (resolve) => {
      try {
        const originalSize = new TextEncoder().encode(JSON.stringify(originalData)).length;
        const compressedData = await this.compressData(originalData);
        const compressedSize = this.base64ToArrayBuffer(compressedData).byteLength;
        
        const ratio = (compressedSize / originalSize) * 100;
        resolve(ratio);
      } catch (error) {
        console.error('计算压缩率失败', error);
        resolve(100); // 返回100%表示没有压缩
      }
    });
  }
}