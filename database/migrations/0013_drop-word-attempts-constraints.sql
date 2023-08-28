-- Drop the word_attempts_check constraint
ALTER TABLE word_attempts
DROP CONSTRAINT IF EXISTS word_attempts_check;
