import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

// GET: Fetch all content items
export async function GET() {
  try {
    const supabase = await createClient()
    
    // Verify admin role
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const { data: profileData } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userData.user.id)
      .single()
      
    if (!profileData || profileData.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }
    
    // Fetch content (lessons)
    const { data: lessons, error } = await supabase
      .from("lessons")
      .select(`
        *,
        courses:course_id(title, subject, grade_level, teacher_id),
        profiles:courses.teacher_id(full_name)
      `)
      .order("created_at", { ascending: false })
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    // Transform data to match ContentItem interface
    const contentItems = lessons.map(lesson => ({
      ...lesson,
      uploadDate: lesson.created_at,
      uploadedBy: lesson.profiles?.full_name || "Unknown",
      downloadCount: Math.floor(Math.random() * 100), // Mock data, replace with actual tracking
      status: lesson.is_published ? "active" : "draft"
    }))
    
    return NextResponse.json(contentItems)
  } catch (error) {
    console.error("Error fetching content:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST: Create new content
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    
    // Verify admin role
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const { data: profileData } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userData.user.id)
      .single()
      
    if (!profileData || profileData.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }
    
    // Insert new lesson
    const { data, error } = await supabase
      .from("lessons")
      .insert({
        course_id: body.course_id,
        title: body.title,
        lesson_order: body.lesson_order || 1,
        duration_minutes: body.duration_minutes,
        objectives: body.objectives,
        resources: body.resources,
        is_published: body.status === "active"
      })
      .select()
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    // Log activity
    await supabase.rpc("log_user_activity", {
      activity_type: "content_created",
      description: `Created new content: ${body.title}`,
      metadata: { content_id: data[0].id }
    })
    
    return NextResponse.json(data[0])
  } catch (error) {
    console.error("Error creating content:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}