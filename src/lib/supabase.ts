import { createClient } from '@supabase/supabase-js';

// Get credentials from environment variables or localStorage (allows user customization without re-building)
const envUrl = import.meta.env.VITE_SUPABASE_URL || 'https://acdvkdsvpwdggkaukjmk.supabase.co';
const envAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_u1yHdyKLgTKrwQisonv6Rg_PEmxawh5';

export const getSupabaseConfig = () => {
  const customUrl = localStorage.getItem('thang_math_supabase_url');
  const customKey = localStorage.getItem('thang_math_supabase_anon_key');
  return {
    url: customUrl?.trim() || envUrl.trim(),
    anonKey: customKey?.trim() || envAnonKey.trim(),
  };
};

export const setCustomSupabaseConfig = (url: string, key: string) => {
  if (url) localStorage.setItem('thang_math_supabase_url', url.trim());
  if (key) localStorage.setItem('thang_math_supabase_anon_key', key.trim());
};

export const resetSupabaseConfig = () => {
  localStorage.removeItem('thang_math_supabase_url');
  localStorage.removeItem('thang_math_supabase_anon_key');
};

const initialConfig = getSupabaseConfig();

export const supabase = createClient(initialConfig.url, initialConfig.anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export const checkSupabaseConnection = async (): Promise<{
  connected: boolean;
  message: string;
  tablesFound?: string[];
  missingTables?: string[];
}> => {
  try {
    const config = getSupabaseConfig();
    if (!config.url || !config.anonKey) {
      return { connected: false, message: 'Chưa cấu hình URL hoặc Anon Key' };
    }

    // Try pinging a test query
    const testTables = ['classes', 'students', 'questions', 'exams', 'grade_records'];
    const tablesFound: string[] = [];
    const missingTables: string[] = [];

    for (const t of testTables) {
      const { data, error } = await supabase.from(t).select('id').limit(1);
      if (!error) {
        tablesFound.push(t);
      } else {
        missingTables.push(t);
      }
    }

    if (tablesFound.length > 0) {
      return {
        connected: true,
        message: `Kết nối thành công! Đã tìm thấy ${tablesFound.length}/${testTables.length} bảng dữ liệu.`,
        tablesFound,
        missingTables,
      };
    } else {
      return {
        connected: true,
        message: 'Kết nối máy chủ Supabase thành công! Tuy nhiên các bảng dữ liệu chưa được tạo trong SQL Editor.',
        tablesFound: [],
        missingTables,
      };
    }
  } catch (err: any) {
    return {
      connected: false,
      message: `Lỗi kết nối: ${err.message || 'Không thể liên lạc với Supabase'}`,
    };
  }
};
