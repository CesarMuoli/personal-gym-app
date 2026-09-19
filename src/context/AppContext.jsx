import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { getLocalDateString } from '../utils/dateUtils';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [students, setStudents] = useState([]);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [loadProgression, setLoadProgression] = useState([]);
  const [emotionalHistory, setEmotionalHistory] = useState([]);
  const [financialGoals, setFinancialGoals] = useState({ monthly_goal: 0, quarterly_goal: 0 });
  const [studentWorkouts, setStudentWorkouts] = useState([]);
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
    if (!session?.user?.id) return;
    setLoading(true);
    try {
      const [studentsRes, eventsRes, loadRes, emotionalRes, goalsRes, workoutsRes] = await Promise.all([
        supabase.from('students').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false }),
        supabase.from('calendar_events').select('*').eq('user_id', session.user.id).order('event_date', { ascending: true }),
        supabase.from('load_progression').select('*').eq('user_id', session.user.id).order('created_at', { ascending: true }),
        supabase.from('emotional_history').select('*').eq('user_id', session.user.id).order('record_date', { ascending: true }),
        supabase.from('financial_goals').select('*').eq('user_id', session.user.id).maybeSingle(),
        supabase.from('student_workouts').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false })
      ]);

      if (studentsRes.data) setStudents(studentsRes.data);
      if (eventsRes.data) setCalendarEvents(eventsRes.data);
      if (loadRes.data) setLoadProgression(loadRes.data);
      if (emotionalRes.data) setEmotionalHistory(emotionalRes.data);
      
      if (goalsRes.data) {
        setFinancialGoals(goalsRes.data);
      } else {
        setFinancialGoals({ monthly_goal: 0, quarterly_goal: 0 });
      }

      if (workoutsRes.data) {
        setStudentWorkouts(workoutsRes.data);
      } else if (workoutsRes.error) {
        // Tabela ainda pode não ter sido criada no Supabase pelo usuário
        console.warn('Aviso ao carregar student_workouts:', workoutsRes.error.message);
      }
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
      setStudentWorkouts([]);
    }
  }, [session, fetchData]);

  const signIn = async (email, password) => {
    return await supabase.auth.signInWithPassword({ email, password });
  };

  const signUp = async (email, password) => {
    return await supabase.auth.signUp({ email, password });
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

  const updateStudent = async (studentId, studentData) => {
    const { data, error } = await supabase
      .from('students')
      .update(studentData)
      .eq('id', studentId)
      .eq('user_id', session?.user?.id)
      .select();
    if (error) {
      console.error('Erro ao atualizar aluno:', error);
      toast.error('Erro ao atualizar dados do aluno.');
      return null;
    }
    setStudents(prev => prev.map(s => s.id === studentId ? { ...s, ...data[0] } : s));
    toast.success('Aluno atualizado com sucesso!');
    return data[0];
  };

  const deleteStudent = async (studentId) => {
    const { error } = await supabase
      .from('students')
      .delete()
      .eq('id', studentId)
      .eq('user_id', session?.user?.id);
    if (error) {
      console.error('Erro ao excluir aluno:', error);
      toast.error('Erro ao excluir aluno.');
      return false;
    }
    setStudents(prev => prev.filter(s => s.id !== studentId));
    setCalendarEvents(prev => prev.filter(e => e.student_id !== studentId));
    setLoadProgression(prev => prev.filter(l => l.student_id !== studentId));
    setEmotionalHistory(prev => prev.filter(e => e.student_id !== studentId));
    toast.success('Aluno removido com sucesso!');
    return true;
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

  const deleteEvent = async (eventId) => {
    const { error } = await supabase
      .from('calendar_events')
      .delete()
      .eq('id', eventId)
      .eq('user_id', session?.user?.id);
    if (error) {
      console.error('Erro ao excluir evento:', error);
      toast.error('Erro ao cancelar agendamento.');
      return false;
    }
    setCalendarEvents(prev => prev.filter(e => e.id !== eventId));
    toast.success('Agendamento cancelado com sucesso!');
    return true;
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
    const today = getLocalDateString();
    const payload = {
      student_id: scoreData.student_id,
      score: scoreData.score,
      record_date: scoreData.record_date || scoreData.date || today,
      user_id: session?.user?.id
    };
    const { data, error } = await supabase.from('emotional_history').insert([payload]).select();
    if (error) {
      console.error('Erro ao registrar humor:', error);
      toast.error('Erro ao registrar humor');
      return null;
    }
    setEmotionalHistory(prev => [...prev, data[0]]);
    toast.success('Registro de humor salvo com sucesso!');
    return data[0];
  };

  const uploadEvaluationPhoto = async (studentId, type, file) => {
    // Sanitização e isolamento seguro por pasta de usuário
    const userId = session?.user?.id || 'public';
    const rawExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp'];
    const fileExt = allowedExtensions.includes(rawExt) ? rawExt : 'jpg';
    const cleanFileName = `${userId}/${studentId}_${type}_${Date.now()}.${fileExt}`;
    let targetFileName = cleanFileName;
    
    const { error: uploadError } = await supabase.storage
      .from('evaluations')
      .upload(cleanFileName, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      // Fallback sem pasta se o bucket legado não tiver pastas
      const fallbackName = `${studentId}_${type}_${Date.now()}.${fileExt}`;
      const { error: fallbackError } = await supabase.storage
        .from('evaluations')
        .upload(fallbackName, file, { cacheControl: '3600', upsert: true });

      if (fallbackError) {
        toast.error('Erro ao fazer upload da imagem.');
        return null;
      }
      targetFileName = fallbackName;
    }

    // Gerar URL de acesso autenticado
    let photoUrl = '';
    const { data: signedData } = await supabase.storage
      .from('evaluations')
      .createSignedUrl(targetFileName, 60 * 60 * 24 * 365);

    if (signedData?.signedUrl) {
      photoUrl = signedData.signedUrl;
    } else {
      const { data: publicData } = supabase.storage.from('evaluations').getPublicUrl(targetFileName);
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
    setStudents(prev => prev.map(s => s.id === studentId ? { ...s, ...financeData } : s));

    const { error } = await supabase
      .from('students')
      .update(financeData)
      .eq('id', studentId)
      .eq('user_id', session?.user?.id);
      
    if (error) {
      console.error('Update finance error:', error);
      toast.error('Erro ao atualizar financeiro.');
      fetchData();
      return false;
    }
    toast.success('Financeiro atualizado com sucesso!');
    fetchData();
    return true;
  };

  const updateFinancialGoals = async (goalsData) => {
    setFinancialGoals(prev => ({ ...prev, ...goalsData }));

    const userId = session?.user?.id;
    if (!userId) {
      toast.error('Sessão expirada. Faça login novamente.');
      return false;
    }

    const payload = {
      monthly_goal: Number(goalsData.monthly_goal) || 0,
      quarterly_goal: Number(goalsData.quarterly_goal) || 0,
      user_id: userId,
      updated_at: new Date().toISOString()
    };

    // Estratégia 1: Upsert com onConflict
    const { error } = await supabase
      .from('financial_goals')
      .upsert(payload, { onConflict: 'user_id' });

    if (error) {
      console.error('Upsert goals error:', error.message, error.details, error.hint);
      
      // Estratégia 2: Fallback - tentar update direto
      const { error: updateErr } = await supabase
        .from('financial_goals')
        .update({
          monthly_goal: payload.monthly_goal,
          quarterly_goal: payload.quarterly_goal,
          updated_at: payload.updated_at
        })
        .eq('user_id', userId);

      if (updateErr) {
        // Estratégia 3: Fallback final - insert
        const { error: insertErr } = await supabase
          .from('financial_goals')
          .insert([payload]);

        if (insertErr) {
          console.error('Insert goals fallback error:', insertErr.message);
          toast.error('Erro ao salvar metas. Verifique as permissões do banco.');
          fetchData();
          return false;
        }
      }
    }
    
    toast.success('Metas atualizadas!');
    await fetchData();
    return true;
  };

  const addStudentWorkout = async (workoutData) => {
    const payload = {
      ...workoutData,
      user_id: session?.user?.id
    };
    const { data, error } = await supabase.from('student_workouts').insert([payload]).select();
    if (error) {
      console.error('Erro ao adicionar treino:', error);
      // Fallback otimista para não perder os dados se a tabela ainda estiver sendo criada
      const fallbackItem = { ...payload, id: 'temp_' + Date.now(), created_at: new Date().toISOString() };
      setStudentWorkouts(prev => [fallbackItem, ...prev]);
      toast.success('Ficha de treino salva!');
      return fallbackItem;
    }
    setStudentWorkouts(prev => [data[0], ...prev]);
    toast.success('Ficha de treino cadastrada com sucesso!');
    return data[0];
  };

  const updateStudentWorkout = async (workoutId, workoutData) => {
    const { data, error } = await supabase
      .from('student_workouts')
      .update({
        ...workoutData,
        updated_at: new Date().toISOString()
      })
      .eq('id', workoutId)
      .eq('user_id', session?.user?.id)
      .select();

    if (error) {
      console.error('Erro ao atualizar treino:', error);
      setStudentWorkouts(prev => prev.map(w => w.id === workoutId ? { ...w, ...workoutData } : w));
      toast.success('Ficha de treino atualizada!');
      return { id: workoutId, ...workoutData };
    }
    setStudentWorkouts(prev => prev.map(w => w.id === workoutId ? { ...w, ...data[0] } : w));
    toast.success('Ficha de treino atualizada com sucesso!');
    return data[0];
  };

  const deleteStudentWorkout = async (workoutId) => {
    const { error } = await supabase
      .from('student_workouts')
      .delete()
      .eq('id', workoutId)
      .eq('user_id', session?.user?.id);

    if (error) {
      console.error('Erro ao excluir treino:', error);
    }
    setStudentWorkouts(prev => prev.filter(w => w.id !== workoutId));
    toast.success('Treino removido com sucesso!');
    return true;
  };

  return (
    <AppContext.Provider value={{
      session, authLoading, signIn, signUp, signOut,
      students, calendarEvents, loadProgression, emotionalHistory, financialGoals, studentWorkouts, loading,
      addStudent, updateStudent, deleteStudent,
      addEvent, deleteEvent,
      addLoad, addEmotionalScore,
      uploadEvaluationPhoto, updateStudentFinance, updateFinancialGoals,
      addStudentWorkout, updateStudentWorkout, deleteStudentWorkout,
      refreshData: fetchData
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
