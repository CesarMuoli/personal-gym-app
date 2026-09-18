import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [students, setStudents] = useState([]);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [loadProgression, setLoadProgression] = useState([]);
  const [emotionalHistory, setEmotionalHistory] = useState([]);
  const [financialGoals, setFinancialGoals] = useState({ monthly_goal: 0, quarterly_goal: 0 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchData = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    try {
      const [studentsRes, eventsRes, loadRes, emotionalRes, goalsRes] = await Promise.all([
        supabase.from('students').select('*').order('created_at', { ascending: false }),
        supabase.from('calendar_events').select('*'),
        supabase.from('load_progression').select('*'),
        supabase.from('emotional_history').select('*'),
        supabase.from('financial_goals').select('*').eq('id', 1).maybeSingle()
      ]);

      if (studentsRes.data) setStudents(studentsRes.data);
      if (eventsRes.data) setCalendarEvents(eventsRes.data);
      if (loadRes.data) setLoadProgression(loadRes.data);
      if (emotionalRes.data) setEmotionalHistory(emotionalRes.data);
      if (goalsRes.data) setFinancialGoals(goalsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Erro ao conectar com o banco de dados.');
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (session) {
      fetchData();
    } else {
      // Limpa os dados em logout para segurança de memória
      setStudents([]);
      setCalendarEvents([]);
      setLoadProgression([]);
      setEmotionalHistory([]);
      setFinancialGoals({ monthly_goal: 0, quarterly_goal: 0 });
    }
  }, [session, fetchData]);

  const signIn = async (email, password) => {
    return await supabase.auth.signInWithPassword({ email, password });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const addStudent = async (studentData) => {
    const payload = {
      ...studentData,
      user_id: session?.user?.id
    };
    const { data, error } = await supabase.from('students').insert([payload]).select();
    if (error) {
      console.error('Erro ao adicionar aluno:', error);
      toast.error('Erro ao adicionar aluno');
      return null;
    }
    setStudents(prev => [data[0], ...prev]);
    toast.success('Aluno adicionado com sucesso!');
    return data[0];
  };

  const addEvent = async (eventData) => {
    const payload = {
      ...eventData,
      user_id: session?.user?.id
    };
    const { data, error } = await supabase.from('calendar_events').insert([payload]).select();
    if (error) {
      console.error('Erro ao adicionar evento:', error);
      toast.error('Erro ao adicionar evento');
      return null;
    }
    setCalendarEvents(prev => [...prev, data[0]]);
    toast.success('Evento agendado!');
    return data[0];
  };

  const addLoad = async (loadData) => {
    const payload = {
      ...loadData,
      user_id: session?.user?.id
    };
    const { data, error } = await supabase.from('load_progression').insert([payload]).select();
    if (error) {
      console.error('Erro ao registrar carga:', error);
      toast.error('Erro ao registrar carga');
      return null;
    }
    setLoadProgression(prev => [...prev, data[0]]);
    toast.success('Carga registrada!');
    return data[0];
  };

  const addEmotionalScore = async (scoreData) => {
    const payload = {
      ...scoreData,
      user_id: session?.user?.id
    };
    const { data, error } = await supabase.from('emotional_history').insert([payload]).select();
    if (error) {
      console.error('Erro ao registrar humor:', error);
      toast.error('Erro ao registrar humor');
      return null;
    }
    setEmotionalHistory(prev => [...prev, data[0]]);
    toast.success('Registro salvo com sucesso!');
    return data[0];
  };

  const uploadEvaluationPhoto = async (studentId, type, file) => {
    // Sanitização e validação de nome de arquivo
    const rawExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp'];
    const fileExt = allowedExtensions.includes(rawExt) ? rawExt : 'jpg';
    const cleanFileName = `${studentId}_${type}_${Date.now()}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('evaluations')
      .upload(cleanFileName, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      toast.error('Erro ao fazer upload da imagem.');
      return null;
    }

    // Suporta tanto URLs assinadas quanto públicas
    let photoUrl = '';
    const { data: signedData } = await supabase.storage
      .from('evaluations')
      .createSignedUrl(cleanFileName, 60 * 60 * 24 * 365); // 1 ano para visualização autenticada

    if (signedData?.signedUrl) {
      photoUrl = signedData.signedUrl;
    } else {
      const { data: publicData } = supabase.storage.from('evaluations').getPublicUrl(cleanFileName);
      photoUrl = publicData.publicUrl;
    }
    
    const column = type === 'before' ? 'photo_before' : 'photo_after';
    const { error: updateError } = await supabase
      .from('students')
      .update({ [column]: photoUrl })
      .eq('id', studentId);
      
    if (updateError) {
      console.error('Update student photo error:', updateError);
      toast.error('Erro ao vincular imagem ao aluno.');
      return null;
    }
    
    // Atualização otimista
    setStudents(prev => prev.map(s => s.id === studentId ? { ...s, [column]: photoUrl } : s));
    toast.success('Foto de avaliação salva com segurança!');
    fetchData();
    return photoUrl;
  };

  const updateStudentFinance = async (studentId, financeData) => {
    // Atualização otimista imediata no estado local
    setStudents(prev => prev.map(s => s.id === studentId ? { ...s, ...financeData } : s));

    const { error } = await supabase
      .from('students')
      .update(financeData)
      .eq('id', studentId);
      
    if (error) {
      console.error('Update finance error:', error);
      toast.error('Erro ao atualizar financeiro.');
      fetchData(); // Rollback do estado
      return false;
    }
    toast.success('Financeiro atualizado com sucesso!');
    fetchData();
    return true;
  };

  const updateFinancialGoals = async (goalsData) => {
    // Atualização otimista
    setFinancialGoals(prev => ({ ...prev, ...goalsData }));

    // Usar upsert para criar o id 1 caso não exista
    const payload = {
      id: 1,
      ...goalsData,
      user_id: session?.user?.id
    };

    const { error } = await supabase
      .from('financial_goals')
      .upsert(payload);
      
    if (error) {
      console.error('Update goals error:', error);
      toast.error('Erro ao atualizar metas.');
      fetchData();
      return false;
    }
    toast.success('Metas atualizadas!');
    fetchData();
    return true;
  };

  return (
    <AppContext.Provider value={{
      session, authLoading, signIn, signOut,
      students, calendarEvents, loadProgression, emotionalHistory, financialGoals, loading,
      addStudent, addEvent, addLoad, addEmotionalScore, uploadEvaluationPhoto, updateStudentFinance, updateFinancialGoals, refreshData: fetchData
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
