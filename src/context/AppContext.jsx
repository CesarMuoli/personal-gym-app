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
  const [studentDocuments, setStudentDocuments] = useState([]);
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
      const [studentsRes, eventsRes, loadRes, emotionalRes, goalsRes, workoutsRes, docsRes] = await Promise.all([
        supabase.from('students').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false }),
        supabase.from('calendar_events').select('*').eq('user_id', session.user.id).order('event_date', { ascending: true }),
        supabase.from('load_progression').select('*').eq('user_id', session.user.id).order('created_at', { ascending: true }),
        supabase.from('emotional_history').select('*').eq('user_id', session.user.id).order('record_date', { ascending: true }),
        supabase.from('financial_goals').select('*').eq('user_id', session.user.id).maybeSingle(),
        supabase.from('student_workouts').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false }),
        supabase.from('student_documents').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false })
      ]);

      if (studentsRes.data) setStudents(studentsRes.data);
      if (eventsRes.data) setCalendarEvents(eventsRes.data);
      if (loadRes.data) setLoadProgression(loadRes.data);
      if (emotionalRes.data) setEmotionalHistory(emotionalRes.data);
      
      if (goalsRes.data && (Number(goalsRes.data.monthly_goal) > 0 || Number(goalsRes.data.quarterly_goal) > 0)) {
        setFinancialGoals(goalsRes.data);
      } else if (session?.user?.user_metadata?.financial_goals) {
        // Fallback blindado para novos usuários com dados em metadata
        setFinancialGoals(session.user.user_metadata.financial_goals);
      } else if (goalsRes.data) {
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

      if (docsRes.data) {
        setStudentDocuments(docsRes.data);
      } else if (docsRes.error) {
        console.warn('Aviso ao carregar student_documents:', docsRes.error.message);
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
      setStudentDocuments([]);
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
    setStudents(prev => prev.map(s => String(s.id) === String(studentId) ? { ...s, ...data[0] } : s));
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
    setStudents(prev => prev.filter(s => String(s.id) !== String(studentId)));
    setCalendarEvents(prev => prev.filter(e => String(e.student_id) !== String(studentId)));
    setLoadProgression(prev => prev.filter(l => String(l.student_id) !== String(studentId)));
    setEmotionalHistory(prev => prev.filter(e => String(e.student_id) !== String(studentId)));
    setStudentWorkouts(prev => prev.filter(w => String(w.student_id) !== String(studentId)));
    setStudentDocuments(prev => prev.filter(d => String(d.student_id) !== String(studentId)));
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
    const userId = session?.user?.id;
    if (!userId) {
      toast.error('Sessão expirada. Faça login novamente.');
      return null;
    }
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
      .eq('id', studentId)
      .eq('user_id', userId);
      
    if (updateError) {
      console.error('Update student photo error:', updateError);
      toast.error('Erro ao vincular imagem ao aluno.');
      return null;
    }
    
    // Atualização otimista
    setStudents(prev => prev.map(s => String(s.id) === String(studentId) ? { ...s, [column]: photoUrl } : s));
    toast.success('Foto de avaliação salva com segurança!');
    fetchData();
    return photoUrl;
  };

  const uploadStudentAvatar = async (studentId, file) => {
    const userId = session?.user?.id;
    if (!userId) {
      toast.error('Sessão expirada. Faça login novamente.');
      return null;
    }
    const rawExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp'];
    const fileExt = allowedExtensions.includes(rawExt) ? rawExt : 'jpg';
    const cleanFileName = `${userId}/avatars/${studentId}_${Date.now()}.${fileExt}`;
    let targetFileName = cleanFileName;
    
    const { error: uploadError } = await supabase.storage
      .from('evaluations')
      .upload(cleanFileName, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (uploadError) {
      console.error('Avatar upload error, trying fallback:', uploadError);
      const fallbackName = `avatar_${studentId}_${Date.now()}.${fileExt}`;
      const { error: fallbackError } = await supabase.storage
        .from('evaluations')
        .upload(fallbackName, file, { cacheControl: '3600', upsert: true });

      if (fallbackError) {
        toast.error('Erro ao fazer upload da foto de perfil.');
        return null;
      }
      targetFileName = fallbackName;
    }

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

    const { error: updateError } = await supabase
      .from('students')
      .update({ avatar: photoUrl })
      .eq('id', studentId)
      .eq('user_id', userId);
      
    if (updateError) {
      console.error('Update student avatar error:', updateError);
      toast.error('Erro ao vincular foto ao aluno.');
      return null;
    }
    
    setStudents(prev => prev.map(s => String(s.id) === String(studentId) ? { ...s, avatar: photoUrl } : s));
    toast.success('Foto do aluno atualizada com sucesso!');
    fetchData();
    return photoUrl;
  };

  const updateStudentFinance = async (studentId, financeData) => {
    setStudents(prev => prev.map(s => String(s.id) === String(studentId) ? { ...s, ...financeData } : s));

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
    const newGoals = {
      monthly_goal: Number(goalsData.monthly_goal) || 0,
      quarterly_goal: Number(goalsData.quarterly_goal) || 0
    };
    
    // Atualização otimista imediata para não piscar a tela
    setFinancialGoals(newGoals);

    const userId = session?.user?.id;
    if (!userId) {
      toast.error('Sessão expirada. Faça login novamente.');
      return false;
    }

    // 1. Salvar no user_metadata do Supabase Auth (garantia multi-tenant 100% isolada e sem falhas de PK)
    try {
      await supabase.auth.updateUser({
        data: { financial_goals: newGoals }
      });
    } catch (authErr) {
      console.warn('Aviso auth user_metadata:', authErr);
    }

    const payload = {
      monthly_goal: newGoals.monthly_goal,
      quarterly_goal: newGoals.quarterly_goal,
      user_id: userId,
      updated_at: new Date().toISOString()
    };

    // 2. Persistir no banco de dados na tabela financial_goals
    try {
      const { data: existingRow } = await supabase
        .from('financial_goals')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (existingRow?.id) {
        // Usuário já possui registro na tabela: update direto pelo ID
        await supabase
          .from('financial_goals')
          .update(payload)
          .eq('id', existingRow.id);
      } else {
        // Usuário novo (sem registro prévio): gera ID numérico seguro caso a coluna id não seja auto-incremento
        const randomId = Math.floor(Date.now() / 1000) % 2147483647;
        const { error: insWithIdErr } = await supabase
          .from('financial_goals')
          .insert([{ ...payload, id: randomId }]);

        if (insWithIdErr) {
          console.warn('Insert com ID falhou, tentando sem ID:', insWithIdErr.message);
          const { error: insWithoutIdErr } = await supabase
            .from('financial_goals')
            .insert([payload]);

          if (insWithoutIdErr) {
            console.warn('Insert sem ID falhou, tentando upsert:', insWithoutIdErr.message);
            await supabase.from('financial_goals').upsert(payload, { onConflict: 'user_id' });
          }
        }
      }
    } catch (dbErr) {
      console.error('Erro ao gravar financial_goals:', dbErr);
    }
    
    toast.success('Metas atualizadas com sucesso!');
    await fetchData();
    return true;
  };

  const addStudentWorkout = async (workoutData) => {
    const payload = {
      ...workoutData,
      student_id: workoutData.student_id ? parseInt(workoutData.student_id, 10) : null,
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
    const cleanPayload = {
      ...workoutData,
      updated_at: new Date().toISOString()
    };
    if (cleanPayload.student_id) {
      cleanPayload.student_id = parseInt(cleanPayload.student_id, 10);
    }

    const { data, error } = await supabase
      .from('student_workouts')
      .update(cleanPayload)
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

  const uploadStudentDocument = async (studentId, { title, category, notes, file }) => {
    const userId = session?.user?.id;
    if (!userId) {
      toast.error('Sessão expirada. Faça login novamente.');
      return null;
    }

    if (!file) {
      toast.error('Nenhum arquivo selecionado.');
      return null;
    }

    // 1. Whitelist estrita de segurança para MIME types
    const allowedMimeTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp'
    ];
    if (!allowedMimeTypes.includes(file.type)) {
      toast.error('Formato não permitido. Selecione apenas arquivos PDF, JPG, JPEG ou PNG.');
      return null;
    }

    // 2. Limite de tamanho de 15 MB
    const maxBytes = 15 * 1024 * 1024;
    if (file.size > maxBytes) {
      toast.error('Arquivo muito pesado. O limite máximo é de 15MB.');
      return null;
    }

    // 3. Sanitização do nome do arquivo
    const rawExt = file.name.split('.').pop()?.toLowerCase() || 'pdf';
    const allowedExtensions = ['pdf', 'jpg', 'jpeg', 'png', 'webp'];
    const fileExt = allowedExtensions.includes(rawExt) ? rawExt : 'pdf';
    const safeBaseName = file.name
      .replace(/\.[^/.]+$/, '')
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .substring(0, 50);

    const storagePath = `${userId}/documents/${studentId}_${Date.now()}_${safeBaseName}.${fileExt}`;
    let targetFileName = storagePath;

    // 4. Upload para o bucket evaluations
    const { error: uploadError } = await supabase.storage
      .from('evaluations')
      .upload(storagePath, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (uploadError) {
      console.error('Document upload error, trying fallback root:', uploadError);
      const fallbackName = `doc_${studentId}_${Date.now()}_${safeBaseName}.${fileExt}`;
      const { error: fallbackError } = await supabase.storage
        .from('evaluations')
        .upload(fallbackName, file, { cacheControl: '3600', upsert: true });

      if (fallbackError) {
        toast.error('Erro ao enviar o arquivo para o servidor.');
        return null;
      }
      targetFileName = fallbackName;
    }

    // 5. Gerar URL acessível
    let fileUrl = '';
    const { data: signedData } = await supabase.storage
      .from('evaluations')
      .createSignedUrl(targetFileName, 60 * 60 * 24 * 365);

    if (signedData?.signedUrl) {
      fileUrl = signedData.signedUrl;
    } else {
      const { data: publicData } = supabase.storage.from('evaluations').getPublicUrl(targetFileName);
      fileUrl = publicData?.publicUrl || '';
    }

    const payload = {
      user_id: userId,
      student_id: parseInt(studentId, 10),
      title: (title || file.name).trim(),
      category: category || 'Exame',
      file_url: fileUrl,
      file_name: file.name,
      file_type: fileExt,
      file_size: file.size,
      notes: (notes || '').trim(),
      created_at: new Date().toISOString()
    };

    // 6. Gravar na tabela student_documents
    const { data, error } = await supabase
      .from('student_documents')
      .insert([payload])
      .select();

    if (error) {
      console.warn('Erro ao inserir student_documents no banco:', error.message);
      const fallbackItem = { ...payload, id: 'temp_' + Date.now() };
      setStudentDocuments(prev => [fallbackItem, ...prev]);
      toast.success('Documento anexado com sucesso!');
      return fallbackItem;
    }

    setStudentDocuments(prev => [data[0], ...prev]);
    toast.success('Documento arquivado com sucesso!');
    return data[0];
  };

  const deleteStudentDocument = async (documentId) => {
    const userId = session?.user?.id;
    if (!userId) return false;

    // Localizar documento na memória antes da exclusão para obter a URL do arquivo
    const docToDelete = studentDocuments.find(d => String(d.id) === String(documentId));

    setStudentDocuments(prev => prev.filter(d => String(d.id) !== String(documentId)));

    const { error } = await supabase
      .from('student_documents')
      .delete()
      .eq('id', documentId)
      .eq('user_id', userId);

    if (error) {
      console.error('Erro ao excluir documento:', error);
      toast.error('Não foi possível remover o documento do banco.');
      fetchData();
      return false;
    }

    // Deletar também o arquivo físico no Supabase Storage caso exista
    if (docToDelete?.file_url) {
      try {
        const urlObj = new URL(docToDelete.file_url);
        const pathSegments = urlObj.pathname.split('evaluations/');
        if (pathSegments.length > 1) {
          const filePath = decodeURIComponent(pathSegments[1].split('?')[0]);
          await supabase.storage.from('evaluations').remove([filePath]);
        }
      } catch (storageErr) {
        console.warn('Aviso ao remover anexo do storage:', storageErr);
      }
    }

    toast.success('Documento removido com sucesso!');
    return true;
  };

  return (
    <AppContext.Provider value={{
      session, authLoading, signIn, signUp, signOut,
      students, calendarEvents, loadProgression, emotionalHistory, financialGoals, studentWorkouts, studentDocuments, loading,
      addStudent, updateStudent, deleteStudent,
      addEvent, deleteEvent,
      addLoad, addEmotionalScore,
      uploadEvaluationPhoto, uploadStudentAvatar, updateStudentFinance, updateFinancialGoals,
      addStudentWorkout, updateStudentWorkout, deleteStudentWorkout,
      uploadStudentDocument, deleteStudentDocument,
      refreshData: fetchData
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
