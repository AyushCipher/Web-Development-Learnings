// All Supabase API calls in one place for easy management

import { supabase } from './supabase-client';
import type { Task } from './types';

// TASK OPERATIONS

export const fetchAllTasks = async (): Promise<Task[]> => {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};


export const createTask = async (
  title: string,
  description: string,
  imageUrl: string | null,
  userEmail: string
): Promise<Task | null> => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .insert({
        title,
        description,
        image_url: imageUrl,
        email: userEmail,
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Task creation error:', error);
      throw new Error(error.message || 'Failed to create task');
    }

    console.log('✅ Task created:', data);
    return data;
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    console.error('🔥 Create task error:', errorMsg);
    throw new Error(errorMsg);
  }
};

export const updateTask = async (
  id: number,
  title: string,
  description: string
): Promise<Task | null> => {
  try {
    console.log('📝 Updating task with id:', id);
    const { data, error } = await supabase
      .from('tasks')
      .update({ title, description, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Update error:', error);
      throw new Error(error.message || 'Failed to update task');
    }

    console.log('✅ Task updated:', data);
    return data;
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    console.error('🔥 Update task error:', errorMsg);
    throw new Error(errorMsg);
  }
};

export const deleteTask = async (id: number): Promise<void> => {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

// IMAGE UPLOAD

const BUCKET_NAME = 'tasks-buckets';

export const uploadImage = async (file: File): Promise<string> => {
  try {
    // Validate file
    if (!file) {
      throw new Error('No file provided');
    }

    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new Error('File size must be less than 5MB');
    }

    // Sanitize filename
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const validExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    
    if (!validExtensions.includes(fileExt)) {
      throw new Error(`Invalid file type. Allowed: ${validExtensions.join(', ')}`);
    }

    const fileName = `task-${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;

    console.log('📤 Uploading file to bucket:', BUCKET_NAME);
    console.log('📁 File name:', fileName);
    console.log('📊 File size:', (file.size / 1024).toFixed(2), 'KB');

    // Upload file
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('❌ Storage upload error:', error);
      
      // Check if bucket exists
      if (error.message.includes('not found') || error.message.includes('Bucket')) {
        throw new Error(
          `Storage bucket "${BUCKET_NAME}" not found. Please check SETUP_SUPABASE_BUCKET.md for setup instructions.`
        );
      }
      
      throw new Error(`Upload failed: ${error.message}`);
    }

    console.log('✅ File uploaded successfully:', fileName);

    // Get public URL for the uploaded file
    const { data: publicUrlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(fileName);

    if (!publicUrlData?.publicUrl) {
      throw new Error('Failed to generate public URL');
    }

    console.log('🔗 Public URL:', publicUrlData.publicUrl);
    return publicUrlData.publicUrl;
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('🔥 Upload error:', errorMessage);
    throw new Error(errorMessage);
  }
};

// REAL-TIME SUBSCRIPTIONS

export const subscribeToTaskChanges = (
  callback: (newTask: Task) => void,
  userEmail: string,
  onDelete?: (taskId: number) => void,
  onStatusChange?: (status: 'connecting' | 'connected' | 'error') => void
): (() => void) => {
  if (onStatusChange) onStatusChange('connecting');

  const channel = supabase
    .channel('public:tasks', { config: { broadcast: { self: true } } })
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'tasks',
        filter: `email=eq.${userEmail}`,
      },
      (payload) => {
        if (payload.new) {
          callback(payload.new as Task);
        }
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'tasks',
        filter: `email=eq.${userEmail}`,
      },
      (payload) => {
        if (payload.new) {
          callback(payload.new as Task);
        }
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'DELETE',
        schema: 'public',
        table: 'tasks',
        filter: `email=eq.${userEmail}`,
      },
      (payload) => {
        if (onDelete && payload.old?.id) {
          onDelete(payload.old.id);
        }
      }
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        if (onStatusChange) onStatusChange('connected');
      } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
        if (onStatusChange) onStatusChange('error');
      }
    });

  return () => {
    supabase.removeChannel(channel);
  };
};

// Check if Realtime is working - a standalone diagnostic, not called from
// the UI anywhere; run it manually (e.g. from the browser console) if
// real-time updates ever seem to not be arriving.
export const testRealtimeConnection = async () => {
  try {
    let isRealtimeEnabled = false;
    
    return new Promise((resolve) => {
      const testChannel = supabase
        .channel('test-realtime-check', { config: { broadcast: { self: true } } })
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            isRealtimeEnabled = true;
            supabase.removeChannel(testChannel);
            resolve(true);
          } else if (status === 'CHANNEL_ERROR') {
            supabase.removeChannel(testChannel);
            resolve(false);
          }
        });
      
      setTimeout(() => {
        if (!isRealtimeEnabled) {
          supabase.removeChannel(testChannel);
          resolve(false);
        }
      }, 5000);
    });
  } catch (err) {
    return false;
  }
};
