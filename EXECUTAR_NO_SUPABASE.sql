-- ==============================================================================
-- PERSONALGYM - SCRIPT DE CORREÇÃO DE ISOLAMENTO DE DADOS (EXECUTAR NO SUPABASE)
-- ==============================================================================
-- INSTRUÇÕES:
-- 1. Abra o Supabase Dashboard do seu projeto
-- 2. Vá em SQL Editor (ícone de código no menu lateral)
-- 3. Cole TODO este script
-- 4. Clique em "Run" (ou Ctrl+Enter)
-- 5. Verifique se não houve erros
-- ==============================================================================

-- ---------------------------------------------------------------
-- PASSO 1: Garantir que a coluna user_id existe em TODAS as tabelas
-- ---------------------------------------------------------------
DO $$ 
BEGIN
    -- students
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='students' AND column_name='user_id' AND table_schema='public') THEN
        ALTER TABLE public.students ADD COLUMN user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid();
    END IF;

    -- calendar_events
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='calendar_events' AND column_name='user_id' AND table_schema='public') THEN
        ALTER TABLE public.calendar_events ADD COLUMN user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid();
    END IF;

    -- load_progression
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='load_progression' AND column_name='user_id' AND table_schema='public') THEN
        ALTER TABLE public.load_progression ADD COLUMN user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid();
    END IF;

    -- emotional_history
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='emotional_history' AND column_name='user_id' AND table_schema='public') THEN
        ALTER TABLE public.emotional_history ADD COLUMN user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid();
    END IF;

    -- financial_goals
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='financial_goals' AND column_name='user_id' AND table_schema='public') THEN
        ALTER TABLE public.financial_goals ADD COLUMN user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid();
    END IF;
END $$;

-- ---------------------------------------------------------------
-- PASSO 2: Associar dados órfãos (sem user_id) ao PRIMEIRO usuário
-- Isso evita que dados antigos desapareçam após ativar o RLS.
-- Se você quiser associar a um usuário específico, substitua o
-- subselect abaixo pelo UUID do usuário desejado.
-- Exemplo: UPDATE public.students SET user_id = 'SEU-UUID-AQUI' WHERE user_id IS NULL;
-- ---------------------------------------------------------------
DO $$
DECLARE
    first_user_id UUID;
BEGIN
    -- Pegar o ID do primeiro usuário cadastrado
    SELECT id INTO first_user_id FROM auth.users ORDER BY created_at ASC LIMIT 1;
    
    IF first_user_id IS NOT NULL THEN
        UPDATE public.students SET user_id = first_user_id WHERE user_id IS NULL;
        UPDATE public.calendar_events SET user_id = first_user_id WHERE user_id IS NULL;
        UPDATE public.load_progression SET user_id = first_user_id WHERE user_id IS NULL;
        UPDATE public.emotional_history SET user_id = first_user_id WHERE user_id IS NULL;
        UPDATE public.financial_goals SET user_id = first_user_id WHERE user_id IS NULL;
        
        RAISE NOTICE 'Dados órfãos associados ao usuário: %', first_user_id;
    ELSE
        RAISE NOTICE 'Nenhum usuário encontrado. Dados órfãos não foram atualizados.';
    END IF;
END $$;

-- ---------------------------------------------------------------
-- PASSO 3: Habilitar RLS (Row Level Security) em TODAS as tabelas
-- ---------------------------------------------------------------
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.load_progression ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emotional_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_goals ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------
-- PASSO 4: Criar políticas de segurança (DROP + CREATE para idempotência)
-- ---------------------------------------------------------------

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

-- financial_goals
DROP POLICY IF EXISTS "MultiTenant: Acesso as proprias metas" ON public.financial_goals;
CREATE POLICY "MultiTenant: Acesso as proprias metas"
ON public.financial_goals FOR ALL TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Garantir UNIQUE constraint no user_id de financial_goals
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
    WHEN duplicate_object THEN
        RAISE NOTICE 'Constraint já existe, ignorando.';
END $$;

-- ---------------------------------------------------------------
-- PASSO 5: Verificação final
-- ---------------------------------------------------------------
SELECT 
    schemaname, tablename, rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('students', 'calendar_events', 'load_progression', 'emotional_history', 'financial_goals');

-- Se a coluna "rowsecurity" estiver TRUE para todas, está tudo certo! ✅
