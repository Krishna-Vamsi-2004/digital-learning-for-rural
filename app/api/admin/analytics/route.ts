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

// GET: Fetch analytics data
export async function GET() {
  try {
    const supabase = await createClient()
    const { isAdmin, error, status } = await verifyAdmin(supabase)
    
    if (!isAdmin) {
      return NextResponse.json({ error }, { status })
    }
    
    // Get user counts by role
    const { data: userCounts, error: userError } = await supabase
      .from("profiles")
      .select("role, count")
      .group("role")
    
    // Get content counts by status
    const { data: contentCounts, error: contentError } = await supabase
      .from("lessons")
      .select("is_published, count")
      .group("is_published")
    
    // Get recent activity logs
    const { data: recentActivity, error: activityError } = await supabase
      .from("activity_logs")
      .select(`
        *,
        profiles:user_id(full_name, role)
      `)
      .order("created_at", { ascending: false })
      .limit(10)
    
    // Get top downloaded content (using mock data for now)
    const { data: topContent, error: topContentError } = await supabase
      .from("lessons")
      .select(`
        id,
        title,
        courses:course_id(subject, grade_level),
        is_published
      `)
      .limit(5)
    
    // Transform top content to include mock download counts
    const topDownloads = topContent?.map((item, index) => ({
      ...item,
      downloadCount: 100 - (index * 15) + Math.floor(Math.random() * 10)
    })) || []
    
    // Format user data
    const userStats = {
      total: userCounts?.reduce((sum, item) => sum + parseInt(item.count), 0) || 0,
      teachers: userCounts?.find(item => item.role === 'teacher')?.count || 0,
      students: userCounts?.find(item => item.role === 'student')?.count || 0,
      admins: userCounts?.find(item => item.role === 'admin')?.count || 0
    }
    
    // Format content data
    const contentStats = {
      total: contentCounts?.reduce((sum, item) => sum + parseInt(item.count), 0) || 0,
      active: contentCounts?.find(item => item.is_published === true)?.count || 0,
      draft: contentCounts?.find(item => item.is_published === false)?.count || 0
    }
    
    return NextResponse.json({
      userStats,
      contentStats,
      recentActivity,
      topDownloads
    })
  } catch (error) {
    console.error("Error fetching analytics:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}