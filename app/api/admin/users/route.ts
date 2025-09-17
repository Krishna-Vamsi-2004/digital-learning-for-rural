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

// GET: Fetch all users
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { isAdmin, error, status } = await verifyAdmin(supabase)
    
    if (!isAdmin) {
      return NextResponse.json({ error }, { status })
    }
    
    // Get URL parameters for filtering
    const url = new URL(request.url)
    const role = url.searchParams.get('role')
    
    // Build query
    let query = supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false })
    
    // Apply role filter if provided
    if (role && ['student', 'teacher', 'admin'].includes(role)) {
      query = query.eq("role", role)
    }
    
    const { data, error: fetchError } = await query
    
    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }
    
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST: Create a new user
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { isAdmin, error, status } = await verifyAdmin(supabase)
    
    if (!isAdmin) {
      return NextResponse.json({ error }, { status })
    }
    
    const body = await request.json()
    
    // Validate required fields
    if (!body.email || !body.password || !body.role || !body.full_name) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }
    
    // Create user in auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: body.email,
      password: body.password,
      email_confirm: true,
      user_metadata: {
        full_name: body.full_name,
        role: body.role
      }
    })
    
    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 500 })
    }
    
    // Profile should be created automatically via trigger, but we'll update it with additional info
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .update({
        full_name: body.full_name,
        role: body.role,
        school_id: body.school_id,
        grade_level: body.grade_level,
        subjects: body.subjects
      })
      .eq("id", authData.user.id)
      .select()
    
    if (profileError) {
      console.error("Error updating profile:", profileError)
      // Continue anyway as the user was created
    }
    
    // Log activity
    await supabase.rpc("log_user_activity", {
      activity_type: "user_created",
      description: `Created new ${body.role}: ${body.full_name}`,
      metadata: { user_id: authData.user.id }
    })
    
    return NextResponse.json(profileData?.[0] || authData.user)
  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}