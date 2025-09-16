-- Create users profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL CHECK (role IN ('student', 'teacher', 'admin')) DEFAULT 'student',
  school_id UUID,
  grade_level TEXT,
  subjects TEXT[],
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create schools table
CREATE TABLE IF NOT EXISTS public.schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  location TEXT,
  principal_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create courses table
CREATE TABLE IF NOT EXISTS public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  subject TEXT NOT NULL,
  grade_level TEXT NOT NULL,
  teacher_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create lessons table
CREATE TABLE IF NOT EXISTS public.lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  lesson_order INTEGER NOT NULL,
  duration_minutes INTEGER,
  objectives TEXT[],
  resources JSONB DEFAULT '[]',
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create student_enrollments table
CREATE TABLE IF NOT EXISTS public.student_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT CHECK (status IN ('active', 'completed', 'dropped')) DEFAULT 'active',
  UNIQUE(student_id, course_id)
);

-- Create lesson_progress table
CREATE TABLE IF NOT EXISTS public.lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('not_started', 'in_progress', 'completed')) DEFAULT 'not_started',
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  time_spent_minutes INTEGER DEFAULT 0,
  last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  UNIQUE(student_id, lesson_id)
);

-- Create assignments table
CREATE TABLE IF NOT EXISTS public.assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMP WITH TIME ZONE,
  max_points INTEGER DEFAULT 100,
  assignment_type TEXT CHECK (assignment_type IN ('quiz', 'homework', 'project', 'exam')) DEFAULT 'homework',
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create assignment_submissions table
CREATE TABLE IF NOT EXISTS public.assignment_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID REFERENCES public.assignments(id) ON DELETE CASCADE,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT,
  attachments JSONB DEFAULT '[]',
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  grade INTEGER,
  feedback TEXT,
  graded_at TIMESTAMP WITH TIME ZONE,
  graded_by UUID REFERENCES public.profiles(id),
  UNIQUE(assignment_id, student_id)
);

-- Create activity_logs table for realtime tracking
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for schools (admins and teachers can manage)
CREATE POLICY "Users can view schools" ON public.schools FOR SELECT USING (true);
CREATE POLICY "Admins can manage schools" ON public.schools FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- RLS Policies for courses
CREATE POLICY "Users can view courses" ON public.courses FOR SELECT USING (true);
CREATE POLICY "Teachers can manage their courses" ON public.courses FOR ALL USING (
  teacher_id = auth.uid() OR 
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- RLS Policies for lessons
CREATE POLICY "Users can view published lessons" ON public.lessons FOR SELECT USING (
  is_published = true OR 
  EXISTS (SELECT 1 FROM public.courses WHERE id = course_id AND teacher_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Teachers can manage lessons in their courses" ON public.lessons FOR ALL USING (
  EXISTS (SELECT 1 FROM public.courses WHERE id = course_id AND teacher_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- RLS Policies for student enrollments
CREATE POLICY "Students can view their enrollments" ON public.student_enrollments FOR SELECT USING (student_id = auth.uid());
CREATE POLICY "Students can enroll themselves" ON public.student_enrollments FOR INSERT WITH CHECK (student_id = auth.uid());
CREATE POLICY "Teachers and admins can manage enrollments" ON public.student_enrollments FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('teacher', 'admin'))
);

-- RLS Policies for lesson progress
CREATE POLICY "Students can view their own progress" ON public.lesson_progress FOR SELECT USING (student_id = auth.uid());
CREATE POLICY "Students can update their own progress" ON public.lesson_progress FOR ALL USING (student_id = auth.uid());
CREATE POLICY "Teachers can view progress in their courses" ON public.lesson_progress FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.lessons l 
    JOIN public.courses c ON l.course_id = c.id 
    WHERE l.id = lesson_id AND c.teacher_id = auth.uid()
  )
);

-- RLS Policies for assignments
CREATE POLICY "Users can view published assignments" ON public.assignments FOR SELECT USING (
  is_published = true OR 
  EXISTS (SELECT 1 FROM public.courses WHERE id = course_id AND teacher_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Teachers can manage assignments in their courses" ON public.assignments FOR ALL USING (
  EXISTS (SELECT 1 FROM public.courses WHERE id = course_id AND teacher_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- RLS Policies for assignment submissions
CREATE POLICY "Students can view their own submissions" ON public.assignment_submissions FOR SELECT USING (student_id = auth.uid());
CREATE POLICY "Students can create their own submissions" ON public.assignment_submissions FOR INSERT WITH CHECK (student_id = auth.uid());
CREATE POLICY "Students can update their own submissions" ON public.assignment_submissions FOR UPDATE USING (student_id = auth.uid());
CREATE POLICY "Teachers can view submissions for their assignments" ON public.assignment_submissions FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.assignments a 
    JOIN public.courses c ON a.course_id = c.id 
    WHERE a.id = assignment_id AND c.teacher_id = auth.uid()
  )
);
CREATE POLICY "Teachers can grade submissions" ON public.assignment_submissions FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.assignments a 
    JOIN public.courses c ON a.course_id = c.id 
    WHERE a.id = assignment_id AND c.teacher_id = auth.uid()
  )
);

-- RLS Policies for activity logs
CREATE POLICY "Users can view their own activity" ON public.activity_logs FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create their own activity" ON public.activity_logs FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admins can view all activity" ON public.activity_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
