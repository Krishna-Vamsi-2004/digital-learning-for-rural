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

// GET: Fetch a specific user
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()
    const { isAdmin, error, status } = await verifyAdmin(supabase)
    
    if (!isAdmin) {
      return NextResponse.json({ error }, { status })
    }
    
    const { data, error: fetchError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", params.id)
      .single()
    
    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: fetchError.code === "PGRST116" ? 404 : 500 })
    }
    
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PATCH: Update a user
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()
    const { isAdmin, error, status } = await verifyAdmin(supabase)
    
    if (!isAdmin) {
      return NextResponse.json({ error }, { status })
    }
    
    const body = await request.json()
    
    // Update profile
    const { data, error: updateError } = await supabase
      .from("profiles")
      .update({
        full_name: body.full_name,
        role: body.role,
        school_id: body.school_id,
        grade_level: body.grade_level,
        subjects: body.subjects,
        updated_at: new Date().toISOString()
      })
      .eq("id", params.id)
      .select()
    
    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }
    
    // Update email if provided
    if (body.email) {
      const { error: authUpdateError } = await supabase.auth.admin.updateUserById(
        params.id,
        { email: body.email }
      )
      
      if (authUpdateError) {
        console.error("Error updating user email:", authUpdateError)
        // Continue anyway as the profile was updated
      }
    }
    
    // Update password if provided
    if (body.password) {
      const { error: passwordUpdateError } = await supabase.auth.admin.updateUserById(
        params.id,
        { password: body.password }
      )
      
      if (passwordUpdateError) {
        console.error("Error updating user password:", passwordUpdateError)
        // Continue anyway as the profile was updated
      }
    }
    
    // Log activity
    await supabase.rpc("log_user_activity", {
      activity_type: "user_updated",
      description: `Updated user: ${body.full_name || data[0].full_name}`,
      metadata: { user_id: params.id }
    })
    
    return NextResponse.json(data[0])
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE: Remove a user
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()
    const { isAdmin, error, status } = await verifyAdmin(supabase)
    
    if (!isAdmin) {
      return NextResponse.json({ error }, { status })
    }
    
    // Get user info before deletion for activity log
    const { data: userData } = await supabase
      .from("profiles")
      .select("full_name, role")
      .eq("id", params.id)
      .single()
    
    // Delete the user
    const { error: deleteError } = await supabase.auth.admin.deleteUser(params.id)
    
    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }
    
    // Log activity
    await supabase.rpc("log_user_activity", {
      activity_type: "user_deleted",
      description: `Deleted ${userData?.role || 'user'}: ${userData?.full_name || 'Unknown user'}`,
      metadata: { user_id: params.id }
    })
    
    return NextResponse.json({ success: true, message: "User deleted successfully" })
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}