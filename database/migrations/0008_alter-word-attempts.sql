ALTER TABLE word_attempts ALTER COLUMN attempted_at SET DEFAULT NOW();

ALTER TABLE quiz_attempts ALTER COLUMN attempted_at SET DEFAULT NOW();

ALTER TABLE quiz_attempts ALTER COLUMN score_one_total SET DEFAULT 1;

ALTER TABLE quiz_attempts ALTER COLUMN score_two_total SET DEFAULT 1;

ALTER TABLE quiz_attempts DROP CONSTRAINT quiz_attempts_check;

ALTER TABLE quiz_attempts ADD CONSTRAINT quiz_attempts_check CHECK (((score_one <= score_one_total) AND (score_two <= score_two_total)));

ALTER TABLE word_attempts DROP CONSTRAINT word_attempts_check;

ALTER TABLE word_attempts ADD CONSTRAINT word_attempts_check CHECK (((progress = 'Learn' OR progress = 'Personalisation') AND image_approval_status = 'Pending') OR ((progress IN ('Recall', 'Quiz', 'Completed')) AND image_approval_status = 'Approved'));

ALTER TABLE quiz_attempts ADD CONSTRAINT quiz_attempt_unique UNIQUE (word_attempt_id);

ALTER TABLE quiz_attempts ADD COLUMN unsubmitted_by UUID REFERENCES users(id);
