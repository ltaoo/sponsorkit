import fs from "node:fs";
import path from "node:path";

import { NextResponse } from "next/server";

import { StorageDir } from "@/utils/paths";

export async function GET() {
  try {
    const content = fs.readFileSync(
      path.resolve(StorageDir, "config.json"),
      "utf-8"
    );
    const json = JSON.parse(content);
    return NextResponse.json({ code: 0, msg: "", data: json }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { code: 101, msg: (error as Error).message, data: null },
      { status: 200 }
    );
  }
}
