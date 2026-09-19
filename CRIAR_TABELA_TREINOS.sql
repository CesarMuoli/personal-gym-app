-- ==============================================================================
-- PERSONALGYM - SCRIPT DE CRIAÇÃO DA TABELA DE TREINOS (EXECUTAR NO SUPABASE)
-- ==============================================================================
-- INSTRUÇÕES:
-- 1. Abra o Supabase Dashboard do seu projeto
-- 2. Vá em SQL Editor (ícone de código no menu lateral)
-- 3. Cole TODO este script e clique em "Run" (ou Ctrl+Enter)
-- ==============================================================================

-- 1. Criar a tabela student_workouts se não existir
CREATE TABLE IF NOT EXISTS public.student_workouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid(),
    student_id BIGINT REFERENCES public.students(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    notes TEXT,
    exercises JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Adicionar coluna de telefone/whatsapp na tabela students caso não exista
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='students' AND column_name='phone' AND table_schema='public'
    ) THEN
        ALTER TABLE public.students ADD COLUMN phone TEXT;
    END IF;
END $$;

-- 3. Ativar Row Level Security (RLS) para isolamento por professor
ALTER TABLE public.student_workouts ENABLE ROW LEVEL SECURITY;

-- 4. Criar política de isolamento multi-tenant
DROP POLICY IF EXISTS "MultiTenant: Acesso aos proprios treinos" ON public.student_workouts;
CREATE POLICY "MultiTenant: Acesso aos proprios treinos"
ON public.student_workouts FOR ALL TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 5. Criar índices para performance de consulta
CREATE INDEX IF NOT EXISTS idx_student_workouts_user_id ON public.student_workouts(user_id);
CREATE INDEX IF NOT EXISTS idx_student_workouts_student_id ON public.student_workouts(student_id);

-- 6. Verificação final
SELECT 
    schemaname, tablename, rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'student_workouts';
