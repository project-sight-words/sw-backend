-- TODO: Confirm if created_by needs to be referencing users or teachers
CREATE TABLE words
(
    word       TEXT PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES users (id),
    deleted_at TIMESTAMPTZ,
    deleted_by UUID REFERENCES users (id)
);

CREATE TABLE word_meanings
(
    id         UUID PRIMARY KEY     DEFAULT gen_random_uuid(),
    word       TEXT        NOT NULL REFERENCES words (word),
    definition TEXT        NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES users (id),
    deleted_at TIMESTAMPTZ,
    deleted_by UUID REFERENCES users (id)
);

CREATE TABLE labels
(
    name       TEXT PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES users (id),
    deleted_at TIMESTAMPTZ,
    deleted_by UUID REFERENCES users (id)
);

CREATE TABLE word_labels
(
    word       TEXT        NOT NULL REFERENCES words,
    label      TEXT        NOT NULL REFERENCES labels,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES users (id),
    deleted_at TIMESTAMPTZ,
    deleted_by UUID REFERENCES users (id)
);

CREATE TABLE audios
(
    id         UUID PRIMARY KEY     DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES users (id),
    deleted_at TIMESTAMPTZ,
    deleted_by UUID REFERENCES users (id),
    link       TEXT        NOT NULL
);

CREATE TABLE images
(
    id         UUID PRIMARY KEY     DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES users (id),
    deleted_at TIMESTAMPTZ,
    deleted_by UUID REFERENCES users (id),
    link       TEXT        NOT NULL
);

CREATE TABLE word_meaning_audios
(
    word_meaning_id UUID        NOT NULL REFERENCES word_meanings,
    audio_id        UUID        NOT NULL REFERENCES audios,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by      UUID REFERENCES users (id),
    deleted_at      TIMESTAMPTZ,
    deleted_by      UUID REFERENCES users (id)
);

CREATE TABLE word_meaning_images
(
    word_meaning_id UUID        NOT NULL REFERENCES word_meanings,
    image_id        UUID        NOT NULL REFERENCES images,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by      UUID REFERENCES users (id),
    deleted_at      TIMESTAMPTZ,
    deleted_by      UUID REFERENCES users (id)
);

CREATE TABLE student_words
(
    student_id   UUID NOT NULL REFERENCES students,
    word         TEXT NOT NUlL REFERENCES words,
    attempted_at TIMESTAMPTZ
);
