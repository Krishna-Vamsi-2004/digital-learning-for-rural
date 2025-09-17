import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

// Helper function to verify admin role
async function verifyAdmin(supabase: any) {
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) {
    return { isAdmin: false, error: "Unauthorized", status: 401 }
  }
  
  const { data: profileData } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userData.user.id)
    .single()
    
  if (!profileData || profileData.role !== "admin") {
    return { isAdmin: false, error: "Forbidden: Admin access required", status: 403 }
  }
  
  return { isAdmin: true, userId: userData.user.id }
}

// GET: Fetch a specific content item
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()
    const { isAdmin, error, status } = await verifyAdmin(supabase)
    
    if (!isAdmin) {
      return NextResponse.json({ error }, { status })
    }
    
    const { data, error: fetchError } = await supabase
      .from("lessons")
      .select(`
        *,
        courses:course_id(title, subject, grade_level, teacher_id),
        profiles:courses.teacher_id(full_name)
      `)
      .eq("id", params.id)
      .single()
    
    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: fetchError.code === "PGRST116" ? 404 : 500 })
    }
    
    // Transform to match ContentItem interface
    const contentItem = {
      ...data,
      uploadDate: data.created_at,
      uploadedBy: data.profiles?.full_name || "Unknown",
      downloadCount: Math.floor(Math.random() * 100), // Mock data, replace with actual tracking
      status: data.is_published ? "active" : "draft"
    }
    
    return NextResponse.json(contentItem)
  } catch (error) {
    console.error("Error fetching content item:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PATCH: Update a content item
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()
    const { isAdmin, error, status, userId } = await verifyAdmin(supabase)
    
    if (!isAdmin) {
      return NextResponse.json({ error }, { status })
    }
    
    const body = await request.json()
    
    // Update the lesson
    const { data, error: updateError } = await supabase
      .from("lessons")
      .update({
        title: body.title,
        duration_minutes: body.duration_minutes,
        objectives: body.objectives,
        resources: body.resources,
        is_published: body.status === "active",
        updated_at: new Date().toISOString()
      })
      .eq("id", params.id)
      .select()
    
    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }
    
    // Log activity
    await supabase.rpc("log_user_activity", {
      activity_type: "content_updated",
      description: `Updated content: ${body.title}`,
      metadata: { content_id: params.id }
    })
    
    return NextResponse.json(data[0])
  } catch (error) {
    console.error("Error updating content:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE: Remove a content item
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()
    const { isAdmin, error, status } = await verifyAdmin(supabase)
    
    if (!isAdmin) {
      return NextResponse.json({ error }, { status })
    }
    
    // Get content title before deletion for activity log
    const { data: contentData } = await supabase
      .from("lessons")
      .select("title")
      .eq("id", params.id)
      .single()
    
    // Delete the lesson
    const { error: deleteError } = await supabase
      .from("lessons")
      .delete()
      .eq("id", params.id)
    
    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }
    
    // Log activity
    await supabase.rpc("log_user_activity", {
      activity_type: "content_deleted",
      description: `Deleted content: ${contentData?.title || "Unknown content"}`,
      metadata: { content_id: params.id }
    })
    
    return NextResponse.json({ success: true, message: "Content deleted successfully" })
  } catch (error) {
    console.error("Error deleting content:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}