import React, { createContext, useContext, useState, useEffect } from 'react';
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

  const fetchData = async () => {
    if (!session) return;
    setLoading(true);
    try {
      const [studentsRes, eventsRes, loadRes, emotionalRes] = await Promise.all([
        supabase.from('students').select('*').order('created_at', { ascending: false }),
        supabase.from('calendar_events').select('*'),
        supabase.from('load_progression').select('*'),
        supabase.from('emotional_history').select('*')
      ]);

      if (studentsRes.data) setStudents(studentsRes.data);
      if (eventsRes.data) setCalendarEvents(eventsRes.data);
      if (loadRes.data) setLoadProgression(loadRes.data);
      if (emotionalRes.data) setEmotionalHistory(emotionalRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Erro ao conectar com o banco de dados.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchData();
    } else {
      // Clear data if logged out
      setStudents([]);
      setCalendarEvents([]);
      setLoadProgression([]);
      setEmotionalHistory([]);
    }
  }, [session]);

  const signIn = async (email, password) => {
    return await supabase.auth.signInWithPassword({ email, password });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const addStudent = async (studentData) => {
    const { data, error } = await supabase.from('students').insert([studentData]).select();
    if (error) {
      toast.error('Erro ao adicionar aluno');
      return null;
    }
    setStudents([data[0], ...students]);
    toast.success('Aluno adicionado com sucesso!');
    return data[0];
  };

  const addEvent = async (eventData) => {
    const { data, error } = await supabase.from('calendar_events').insert([eventData]).select();
    if (error) {
      toast.error('Erro ao adicionar evento');
      return null;
    }
    setCalendarEvents([...calendarEvents, data[0]]);
    toast.success('Evento agendado!');
    return data[0];
  };

  const addLoad = async (loadData) => {
    const { data, error } = await supabase.from('load_progression').insert([loadData]).select();
    if (error) {
      toast.error('Erro ao registrar carga');
      return null;
    }
    setLoadProgression([...loadProgression, data[0]]);
    toast.success('Carga registrada!');
    return data[0];
  };

  const addEmotionalScore = async (scoreData) => {
    const { data, error } = await supabase.from('emotional_history').insert([scoreData]).select();
    if (error) {
      toast.error('Erro ao registrar humor');
      return null;
    }
    setEmotionalHistory([...emotionalHistory, data[0]]);
    toast.success('Registro salvo com sucesso!');
    return data[0];
  };

  const uploadEvaluationPhoto = async (studentId, type, file) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${studentId}_${type}_${Date.now()}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('evaluations')
      .upload(fileName, file);

    if (uploadError) {
      console.error(uploadError);
      toast.error('Erro ao fazer upload da imagem.');
      return null;
    }

    const { data } = supabase.storage.from('evaluations').getPublicUrl(fileName);
    
    const column = type === 'before' ? 'photo_before' : 'photo_after';
    const { error: updateError } = await supabase
      .from('students')
      .update({ [column]: data.publicUrl })
      .eq('id', studentId);
      
    if (updateError) {
      toast.error('Erro ao vincular imagem ao aluno.');
      return null;
    }
    
    toast.success('Foto de avaliação salva!');
    fetchData(); // Recarrega os alunos
    return data.publicUrl;
  };

  return (
    <AppContext.Provider value={{
      session, authLoading, signIn, signOut,
      students, calendarEvents, loadProgression, emotionalHistory, loading,
      addStudent, addEvent, addLoad, addEmotionalScore, uploadEvaluationPhoto, refreshData: fetchData
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
