import User from "@/lib/database/models/user.model";
import { connectToDatabase } from "@/lib/database/mongoose";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const addr = new URL(req.url).searchParams.get("addr");
  try {
    
    await connectToDatabase();
    const user = await User.findOne({
      wallet_address: addr,
    });

    
    if (!user) {
      return NextResponse.json({
        success: false,
        message: "User Not Found",
      });
    }

    return NextResponse.json({
      success: true,
      message: "User Found",
      data: user,
    });
  } catch (error) {
    
    return NextResponse.json({
      success: false,
      message: "Internal Server Error",
    });
  }
}

export async function POST(req: Request) {
  const body = await req.json();
  const { wallet_address, username, first_name, last_name } = body;
  try {
    if (!wallet_address || !username || !first_name) {
      return NextResponse.json({
        success: false,
        message: "Please provide all fields",
      });
    }
    await connectToDatabase();

    const existingUser = await User.findOne({
      wallet_address,
    });
    if (existingUser) {
      return NextResponse.json({
        success: false,
        message: "User Already Exists",
      });
    }
    const user = await User.create({
      wallet_address,
      username,
      first_name,
      last_name: last_name || "",
    });

    return NextResponse.json({
      success: true,
      message: "User Created",
      data: user,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "Internal Server Error",
    });
  }
}
//   setUser(null);
