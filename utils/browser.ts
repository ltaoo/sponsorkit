import { Result } from "@/domains/result";

export function loadImage(data: string): Promise<Result<HTMLImageElement>> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      resolve(Result.Ok(img));
    };
    img.onerror = (msg) => {
      resolve(Result.Err(msg as string));
    };
    img.src = data;
  });
}

export function blobToArrayBuffer(blob: Blob): Promise<ArrayBuffer> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const buffer = reader.result;
      resolve(buffer as ArrayBuffer);
    };
    reader.readAsArrayBuffer(blob);
  });
}

export function readFileAsURL(file: File): Promise<Result<string>> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target === null) {
        return resolve(Result.Err("read failed"));
      }
      resolve(Result.Ok(reader.result as string));
    };
    reader.readAsDataURL(file);
  });
}

export function textToURL(text: string, type: string) {
  const base64SVG = btoa(encodeURIComponent(text));
  const dataURL = `data:${type};base64,${base64SVG}`;
  return dataURL;
}
export function textToFile(text: string, type: string) {
  const blob = new Blob([text], { type: `${type};charset=utf-8` });
  return URL.createObjectURL(blob);
}

export function readFileAsArrayBuffer(
  file: File
): Promise<Result<ArrayBuffer>> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target === null) {
        return resolve(Result.Err("read failed"));
      }
      const buffer = e.target.result;
      return resolve(Result.Ok(buffer as ArrayBuffer));
    };
    reader.readAsArrayBuffer(file);
  });
}
