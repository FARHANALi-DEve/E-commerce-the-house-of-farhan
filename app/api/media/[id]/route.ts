import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";
import { getDatabaseForMedia, StoreError } from "@/lib/store";
import type { Binary } from "mongodb";
import { problem } from "@/lib/http";
export const runtime="nodejs";
export async function GET(_req:NextRequest,{params}:{params:Promise<{id:string}>}){
  try{
    const {id}=await params;
    const match=/^([a-f0-9-]{36})\.(jpg|png|webp)$/.exec(id);
    if(!match) throw new StoreError("Image not found.",404);
    const type=match[2]==="jpg"?"image/jpeg":match[2]==="png"?"image/png":"image/webp";
    let bytes:Buffer;
    if(process.env.MONGODB_URI?.trim()){
      const doc=await (await getDatabaseForMedia()).collection<{id:string;data:Binary}>("media").findOne({id:match[1]});
      if(!doc) throw new StoreError("Image not found.",404);
      bytes=Buffer.from(doc.data.value());
    }else{
      try{bytes=await fs.readFile(path.join(process.cwd(),".data","media",id));}
      catch(e){if((e as NodeJS.ErrnoException).code==="ENOENT")throw new StoreError("Image not found.",404);throw e;}
    }
    return new NextResponse(new Uint8Array(bytes),{headers:{"Content-Type":type,"Cache-Control":"public, max-age=31536000, immutable","X-Content-Type-Options":"nosniff"}});
  }catch(e){return problem(e);}
}
