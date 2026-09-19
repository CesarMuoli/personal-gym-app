-- ==============================================================================
-- PERSONALGYM - SCRIPT DE CORREÇÃO DEFINITIVA DA TABELA FINANCIAL_GOALS
-- ==============================================================================
-- INSTRUÇÕES:
-- 1. Abra o Supabase Dashboard do seu projeto
-- 2. Vá em SQL Editor (ícone de código no menu lateral)
-- 3. Cole TODO este script e clique em "Run" (ou Ctrl+Enter)
-- ==============================================================================

-- 1. Garantir que a coluna id tenha sequence / auto-incremento
CREATE SEQUENCE IF NOT EXISTS financial_goals_id_seq;

DO $$
BEGIN
    ALTER TABLE public.financial_goals ALTER COLUMN id SET DEFAULT nextval('financial_goals_id_seq');
EXCEPTION
    WHEN others THEN
        RAISE NOTICE 'Coluna id já possui default ou sequence.';
END $$;

-- Sincronizar o contador do sequence para o maior id atual
SELECT setval('financial_goals_id_seq', COALESCE((SELECT MAX(id) FROM public.financial_goals), 1) + 1);

-- 2. Garantir que user_id seja UNIQUE para permitir UPSERT sem conflito
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
        RAISE NOTICE 'Constraint já existe.';
END $$;

-- 3. Confirmar permissões e RLS
ALTER TABLE public.financial_goals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "MultiTenant: Acesso as proprias metas" ON public.financial_goals;
CREATE POLICY "MultiTenant: Acesso as proprias metas"
ON public.financial_goals FOR ALL TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 4. Verificação final
SELECT * FROM public.financial_goals;
