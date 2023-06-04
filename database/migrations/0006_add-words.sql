CREATE TYPE difficulty_type AS ENUM ('Basic', 'Intermediate', 'Advanced');
CREATE TYPE image_approval_status AS ENUM ('Pending', 'Approved', 'Rejected');
CREATE TYPE attempt_progress AS ENUM ('Learn', 'Personalisation', 'Recall', 'Quiz', 'Completed');

CREATE TABLE words
(
    id         UUID PRIMARY KEY         DEFAULT gen_random_uuid(),
    word       TEXT            NOT NULL CHECK (LENGTH(TRIM(word)) <> 0),
    definition TEXT            NOT NULL CHECK (LENGTH(TRIM(definition)) <> 0),
    sentence   TEXT            NOT NULL CHECK (LENGTH(TRIM(sentence)) <> 0),
    difficulty DIFFICULTY_TYPE NOT NULL DEFAULT 'Basic',
    comment    TEXT,
    created_at TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES users (id),
    deleted_at TIMESTAMPTZ,
    deleted_by UUID REFERENCES users (id),
    UNIQUE (word, definition)
);

CREATE TABLE audios
(
    id         UUID PRIMARY KEY     DEFAULT gen_random_uuid(),
    link       TEXT        NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES users (id),
    deleted_at TIMESTAMPTZ,
    deleted_by UUID REFERENCES users (id),
    word_id    UUID        NOT NULL REFERENCES words
);

CREATE TABLE images
(
    id         UUID PRIMARY KEY     DEFAULT gen_random_uuid(),
    link       TEXT        NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES users (id),
    deleted_at TIMESTAMPTZ,
    deleted_by UUID REFERENCES users (id),
    word_id    UUID        NOT NULL REFERENCES words
);

CREATE TABLE lessons
(
    id         UUID PRIMARY KEY     DEFAULT gen_random_uuid(),
    start_date TIMESTAMPTZ NOT NULL,
    end_date   TIMESTAMPTZ NOT NULL,
    class_id   UUID        NOT NULL REFERENCES classes,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES users (id),
    deleted_at TIMESTAMPTZ,
    deleted_by UUID REFERENCES users (id)
);

CREATE TABLE lesson_words
(
    id         UUID PRIMARY KEY     DEFAULT gen_random_uuid(),
    word_id    UUID        NOT NULL REFERENCES words,
    lesson_id  UUID        NOT NULL REFERENCES lessons,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES users (id),
    deleted_at TIMESTAMPTZ,
    deleted_by UUID REFERENCES users (id),
    UNIQUE (word_id, lesson_id)
);

CREATE TABLE word_attempts
(
    id                      UUID PRIMARY KEY               DEFAULT gen_random_uuid(),
    student_id              UUID                  NOT NULL REFERENCES students,
    lesson_word_id          UUID                  NOT NULL REFERENCES lesson_words,
    attempted_at            TIMESTAMPTZ,
    progress                attempt_progress      NOT NULL DEFAULT 'Learn',
    personalised_image_link TEXT,
    image_approval_status   IMAGE_APPROVAL_STATUS NOT NULL DEFAULT 'Pending',
    UNIQUE (student_id, lesson_word_id),
    CHECK ((progress = 'Learn' AND image_approval_status = 'Pending') OR
           ((progress IN ('Recall', 'Quiz', 'Completed')) AND image_approval_status = 'Approved'))
);

CREATE TABLE quiz_attempts
(
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attempted_at    TIMESTAMPTZ,
    score_one_total INT  NOT NULL CHECK (score_one_total >= 0),
    score_two_total INT  NOT NULL CHECK (score_two_total >= 0),
    score_one       INT CHECK (score_one >= 0),
    score_two       INT CHECK (score_two >= 0),
    unsubmitted_at  TIMESTAMPTZ,
    word_attempt_id UUID NOT NULL REFERENCES word_attempts,
    CHECK (score_one < score_one_total AND score_two < score_two_total)
);
