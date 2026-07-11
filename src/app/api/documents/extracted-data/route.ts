import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const documentId = searchParams.get("documentId");
    const userId = searchParams.get("userId");

    if (!documentId || !userId) {
      return NextResponse.json(
        { error: "Document ID and User ID are required" },
        { status: 400 }
      );
    }

    // Get extracted data for document
    const { data, error } = await supabase
      .from("extracted_data")
      .select("*")
      .eq("document_id", documentId)
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 is "no rows found"
      console.error("Database error:", error);
      return NextResponse.json(
        { error: "Failed to fetch extracted data" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: data || null,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { dataId, userId, reviewed } = await request.json();

    if (!dataId || !userId) {
      return NextResponse.json(
        { error: "Data ID and User ID are required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("extracted_data")
      .update({
        reviewed,
        reviewed_at: reviewed ? new Date().toISOString() : null,
      })
      .eq("id", dataId)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      console.error("Update error:", error);
      return NextResponse.json(
        { error: "Failed to update extracted data" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
