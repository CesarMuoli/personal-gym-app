import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [students, setStudents] = useState([]);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [loadProgression, setLoadProgression] = useState([]);
  const [emotionalHistory, setEmotionalHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
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
    fetchData();
  }, []);

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

  return (
    <AppContext.Provider value={{
      students, calendarEvents, loadProgression, emotionalHistory, loading,
      addStudent, addEvent, addLoad, addEmotionalScore, refreshData: fetchData
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
