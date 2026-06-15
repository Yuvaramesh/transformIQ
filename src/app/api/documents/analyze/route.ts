import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { analyzePdfWithClaude } from "@/lib/claude";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { documentId, userId } = await request.json();

    if (!documentId || !userId) {
      return NextResponse.json(
        { error: "Document ID and User ID are required" },
        { status: 400 }
      );
    }

    // Get document from database
    const { data: document, error: docError } = await supabase
      .from("documents")
      .select("*")
      .eq("id", documentId)
      .eq("user_id", userId)
      .single();

    if (docError || !document) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    // Download file from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from("project-files")
      .download(document.file_path);

    if (downloadError || !fileData) {
      console.error("Download error:", downloadError);
      return NextResponse.json(
        { error: "Failed to download file" },
        { status: 500 }
      );
    }

    // Convert file to base64
    const buffer = await fileData.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");

    // Analyze with Claude
    const analysisResult = await analyzePdfWithClaude(base64);

    // Store analysis result in database
    const { data: extractedData, error: insertError } = await supabase
      .from("extracted_data")
      .insert([
        {
          document_id: documentId,
          user_id: userId,
          requirements: analysisResult.requirements,
          risks: analysisResult.risks,
          constraints: analysisResult.constraints,
          raw_response: analysisResult,
        },
      ])
      .select()
      .single();

    if (insertError) {
      console.error("Insert error:", insertError);
      return NextResponse.json(
        { error: "Failed to save analysis" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        analysis: extractedData,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
