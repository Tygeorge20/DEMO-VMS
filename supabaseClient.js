import { createClient } from '@supabase/supabase-js'
const supabaseUrl = 'https://tdzkqqevnbfvxresdizc.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkemtxcWV2bmJmdnhyZXNkaXpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5ODY3NzksImV4cCI6MjA2OTU2Mjc3OX0.w0lmAQ_szUkPKUMx_4KORSHOmzLuxyXCJjV_Whw0cfQ'
export const supabase = createClient(supabaseUrl, supabaseKey);
