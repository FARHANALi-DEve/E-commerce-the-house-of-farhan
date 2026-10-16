import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { problem, requireAdmin } from "@/lib/http";
import { getDatabaseForMedia, StoreError } from "@/lib/store";
export const runtime="nodejs";
export async function POST(req:NextRequest){
  try{
    await requireAdmin();
    const form=await req.formData();
    const file=form.get("file");
    if(!(file instanceof File)) throw new StoreError("Choose an image to upload.");
    if(file.size>3*1024*1024||file.size===0) throw new StoreError("Image must be smaller than 3MB.");
    const bytes=Buffer.from(await file.arrayBuffer());
    let extension="",type="";
    if(bytes.length>3&&bytes[0]===0xff&&bytes[1]===0xd8&&bytes[2]===0xff){extension="jpg";type="image/jpeg";}
    else if(bytes.length>8&&bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))){extension="png";type="image/png";}
    else if(bytes.length>12&&bytes.toString("ascii",0,4)==="RIFF"&&bytes.toString("ascii",8,12)==="WEBP"){extension="webp";type="image/webp";}
    else throw new StoreError("Only JPEG, PNG and WebP photos are supported.");
    const id=randomUUID(), name=`${id}.${extension}`;
    if(process.env.MONGODB_URI?.trim()){
      const db=await getDatabaseForMedia();
      await db.collection("media").insertOne({id,contentType:type,data:bytes,createdAt:new Date().toISOString()});
    }else{
      const dir=path.join(process.cwd(),".data","media");
      await fs.mkdir(dir,{recursive:true});
      await fs.writeFile(path.join(dir,name),bytes,{flag:"wx"});
    }
    return NextResponse.json({url:`/api/media/${name}`},{status:201});
  }catch(e){return problem(e);}
}
