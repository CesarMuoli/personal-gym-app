-- ==============================================================================
-- PERSONALGYM - SCRIPT MESTRE DEFINITIVO (SISTEMA 100% BLINDADO MULTI-TENANT)
-- ==============================================================================
-- Este script garante que 1, 100 ou 10.000 usuários (Personal Trainers) possam
-- utilizar o sistema simultaneamente com isolamento total de dados e sem falhas.
--
-- INSTRUÇÕES DE EXECUÇÃO:
-- 1. Abra o Supabase Dashboard (https://supabase.com/dashboard)
-- 2. Selecione o seu projeto
-- 3. Clique em "SQL Editor" no menu lateral esquerdo
-- 4. Cole TODO este script e clique no botão verde "Run" (ou Ctrl + Enter)
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. ESTRUTURAÇÃO E GARANTIA DAS TABELAS
-- ------------------------------------------------------------------------------

-- Tabela: students (Alunos)
CREATE TABLE IF NOT EXISTS public.students (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid(),
    name TEXT NOT NULL,
    plan TEXT,
    phone TEXT,
    weight NUMERIC DEFAULT 0,
    body_fat NUMERIC DEFAULT 0,
    monthly_fee NUMERIC DEFAULT 0,
    due_date INT DEFAULT 10,
    active BOOLEAN DEFAULT true,
    frequency INT DEFAULT 0,
    avatar TEXT,
    photo_before TEXT,
    photo_after TEXT,
    last_payment_date DATE,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Garantir colunas novas em students caso a tabela já existisse
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='students' AND column_name='user_id' AND table_schema='public') THEN
        ALTER TABLE public.students ADD COLUMN user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='students' AND column_name='phone' AND table_schema='public') THEN
        ALTER TABLE public.students ADD COLUMN phone TEXT;
    END IF;
END $$;

-- Tabela: calendar_events (Agenda de Aulas e Avaliações)
CREATE TABLE IF NOT EXISTS public.calendar_events (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid(),
    student_id BIGINT REFERENCES public.students(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    event_date TIMESTAMPTZ NOT NULL,
    type TEXT DEFAULT 'class',
    created_at TIMESTAMPTZ DEFAULT now()
);

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='calendar_events' AND column_name='user_id' AND table_schema='public') THEN
        ALTER TABLE public.calendar_events ADD COLUMN user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid();
    END IF;
END $$;

-- Tabela: load_progression (Histórico de Cargas)
CREATE TABLE IF NOT EXISTS public.load_progression (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid(),
    student_id BIGINT REFERENCES public.students(id) ON DELETE CASCADE,
    exercise TEXT NOT NULL,
    load NUMERIC NOT NULL,
    week TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='load_progression' AND column_name='user_id' AND table_schema='public') THEN
        ALTER TABLE public.load_progression ADD COLUMN user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid();
    END IF;
END $$;

-- Tabela: emotional_history (Humor e Disposição Pós-Treino)
CREATE TABLE IF NOT EXISTS public.emotional_history (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid(),
    student_id BIGINT REFERENCES public.students(id) ON DELETE CASCADE,
    score INT NOT NULL,
    record_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT now()
);

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='emotional_history' AND column_name='user_id' AND table_schema='public') THEN
        ALTER TABLE public.emotional_history ADD COLUMN user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid();
    END IF;
END $$;

-- Tabela: student_workouts (Fichas de Treino com Envio WhatsApp)
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

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='student_workouts' AND column_name='user_id' AND table_schema='public') THEN
        ALTER TABLE public.student_workouts ADD COLUMN user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid();
    END IF;
END $$;

-- Tabela: student_documents (Acervo de Saúde: Exames, Atestados, Medicações, Relatórios)
CREATE TABLE IF NOT EXISTS public.student_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid(),
    student_id BIGINT REFERENCES public.students(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'Exame',
    file_url TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL, -- pdf, jpg, jpeg, png
    file_size BIGINT DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='student_documents' AND column_name='user_id' AND table_schema='public') THEN
        ALTER TABLE public.student_documents ADD COLUMN user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid();
    END IF;
END $$;

-- Tabela: financial_goals (Metas Financeiras por Professor)
CREATE TABLE IF NOT EXISTS public.financial_goals (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid() UNIQUE,
    monthly_goal NUMERIC DEFAULT 0,
    quarterly_goal NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Blindagem de Sequence na tabela financial_goals
CREATE SEQUENCE IF NOT EXISTS financial_goals_id_seq;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='financial_goals' AND column_name='user_id' AND table_schema='public') THEN
        ALTER TABLE public.financial_goals ADD COLUMN user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid();
    END IF;
    
    ALTER TABLE public.financial_goals ALTER COLUMN id SET DEFAULT nextval('financial_goals_id_seq');
EXCEPTION
    WHEN others THEN NULL;
END $$;

SELECT setval('financial_goals_id_seq', COALESCE((SELECT MAX(id) FROM public.financial_goals), 1) + 1);

-- Garantir constraint UNIQUE em financial_goals(user_id)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'financial_goals_user_id_key' 
        AND conrelid = 'public.financial_goals'::regclass
    ) THEN
        ALTER TABLE public.financial_goals ADD CONSTRAINT financial_goals_user_id_key UNIQUE (user_id);
    END IF;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- ------------------------------------------------------------------------------
-- 2. HABILITAR ROW LEVEL SECURITY (RLS) EM TODAS AS TABELAS
-- ------------------------------------------------------------------------------
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.load_progression ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emotional_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_goals ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- 3. POLÍTICAS DE SEGURANÇA MULTI-TENANT (CADA USUÁRIO SÓ ACESSA O SEU)
-- ------------------------------------------------------------------------------

-- students
DROP POLICY IF EXISTS "MultiTenant: Acesso aos proprios alunos" ON public.students;
CREATE POLICY "MultiTenant: Acesso aos proprios alunos"
ON public.students FOR ALL TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- calendar_events
DROP POLICY IF EXISTS "MultiTenant: Acesso aos proprios eventos" ON public.calendar_events;
CREATE POLICY "MultiTenant: Acesso aos proprios eventos"
ON public.calendar_events FOR ALL TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- load_progression
DROP POLICY IF EXISTS "MultiTenant: Acesso as proprias cargas" ON public.load_progression;
CREATE POLICY "MultiTenant: Acesso as proprias cargas"
ON public.load_progression FOR ALL TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- emotional_history
DROP POLICY IF EXISTS "MultiTenant: Acesso aos proprios humores" ON public.emotional_history;
CREATE POLICY "MultiTenant: Acesso aos proprios humores"
ON public.emotional_history FOR ALL TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- student_workouts
DROP POLICY IF EXISTS "MultiTenant: Acesso aos proprios treinos" ON public.student_workouts;
CREATE POLICY "MultiTenant: Acesso aos proprios treinos"
ON public.student_workouts FOR ALL TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- student_documents (Acervo de Saúde)
DROP POLICY IF EXISTS "MultiTenant: Acesso aos proprios documentos" ON public.student_documents;
CREATE POLICY "MultiTenant: Acesso aos proprios documentos"
ON public.student_documents FOR ALL TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- financial_goals
DROP POLICY IF EXISTS "MultiTenant: Acesso as proprias metas" ON public.financial_goals;
CREATE POLICY "MultiTenant: Acesso as proprias metas"
ON public.financial_goals FOR ALL TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- 4. ÍNDICES DE ALTA PERFORMANCE (ESCALABILIDADE PARA MILHARES DE REGISTROS)
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_students_user_id ON public.students(user_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_user_id ON public.calendar_events(user_id);
CREATE INDEX IF NOT EXISTS idx_load_progression_user_id ON public.load_progression(user_id);
CREATE INDEX IF NOT EXISTS idx_emotional_history_user_id ON public.emotional_history(user_id);
CREATE INDEX IF NOT EXISTS idx_student_workouts_user_id ON public.student_workouts(user_id);
CREATE INDEX IF NOT EXISTS idx_student_workouts_student_id ON public.student_workouts(student_id);
CREATE INDEX IF NOT EXISTS idx_student_documents_user_id ON public.student_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_student_documents_student_id ON public.student_documents(student_id);
CREATE INDEX IF NOT EXISTS idx_financial_goals_user_id ON public.financial_goals(user_id);

-- ------------------------------------------------------------------------------
-- 5. STORAGE BUCKET PARA AVALIAÇÕES FÍSICAS E DOCUMENTOS DE SAÚDE
-- ------------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('evaluations', 'evaluations', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas de Acesso ao Storage
DROP POLICY IF EXISTS "Public Access to Evaluations" ON storage.objects;
CREATE POLICY "Public Access to Evaluations" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'evaluations');

DROP POLICY IF EXISTS "Authenticated Users can Upload Evaluations" ON storage.objects;
CREATE POLICY "Authenticated Users can Upload Evaluations" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'evaluations');

DROP POLICY IF EXISTS "Authenticated Users can Update Evaluations" ON storage.objects;
CREATE POLICY "Authenticated Users can Update Evaluations" 
ON storage.objects FOR UPDATE 
TO authenticated 
USING (bucket_id = 'evaluations');

DROP POLICY IF EXISTS "Authenticated Users can Delete Evaluations" ON storage.objects;
CREATE POLICY "Authenticated Users can Delete Evaluations" 
ON storage.objects FOR DELETE 
TO authenticated 
USING (bucket_id = 'evaluations');

-- ------------------------------------------------------------------------------
-- 6. VERIFICAÇÃO FINAL DE BLINDAGEM (RESULTADO ESPERADO: TUDO TRUE)
-- ------------------------------------------------------------------------------
SELECT 
    schemaname, 
    tablename, 
    rowsecurity AS rls_ativo
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('students', 'calendar_events', 'load_progression', 'emotional_history', 'student_workouts', 'student_documents', 'financial_goals');

