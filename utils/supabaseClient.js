const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://lnmuabnzxgxrbbdwvhsj.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxubXVhYm56eGd4cmJiZHd2aHNqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDY2MTMwNCwiZXhwIjoyMTAwMjM3MzA0fQ.PLsxNHnn3azj8fJoqT2lL2ZZ4Fqg3b7YmFTeNEa19FI';

module.exports = createClient(SUPABASE_URL, SUPABASE_KEY);
