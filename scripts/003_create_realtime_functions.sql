-- Function to log user activity
CREATE OR REPLACE FUNCTION public.log_user_activity(
  activity_type TEXT,
  description TEXT,
  metadata JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  activity_id UUID;
BEGIN
  INSERT INTO public.activity_logs (user_id, activity_type, description, metadata)
  VALUES (auth.uid(), activity_type, description, metadata)
  RETURNING id INTO activity_id;
  
  RETURN activity_id;
END;
$$;

-- Function to update lesson progress
CREATE OR REPLACE FUNCTION public.update_lesson_progress(
  lesson_id UUID,
  progress_percentage INTEGER,
  time_spent INTEGER DEFAULT 0
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.lesson_progress (student_id, lesson_id, progress_percentage, time_spent_minutes, last_accessed)
  VALUES (auth.uid(), lesson_id, progress_percentage, time_spent, NOW())
  ON CONFLICT (student_id, lesson_id)
  DO UPDATE SET
    progress_percentage = EXCLUDED.progress_percentage,
    time_spent_minutes = lesson_progress.time_spent_minutes + EXCLUDED.time_spent_minutes,
    last_accessed = NOW(),
    completed_at = CASE WHEN EXCLUDED.progress_percentage = 100 THEN NOW() ELSE lesson_progress.completed_at END,
    status = CASE 
      WHEN EXCLUDED.progress_percentage = 100 THEN 'completed'
      WHEN EXCLUDED.progress_percentage > 0 THEN 'in_progress'
      ELSE 'not_started'
    END;
    
  -- Log the activity
  PERFORM public.log_user_activity(
    'lesson_progress',
    'Updated progress for lesson',
    jsonb_build_object('lesson_id', lesson_id, 'progress', progress_percentage)
  );
END;
$$;
