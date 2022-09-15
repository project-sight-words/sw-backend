# Database Schema

The database schema for this project is represented with an [ERD](https://lucid.app/lucidchart/7567209b-871d-4a5b-a318-fd1c88fc3386/edit?invitationId=inv_83543ce0-ce4b-4fbd-8f11-8907ad20cb8e).
Log in to edit the document.

## Design Decisions

### Soft Deletion

Consideration:

Maintain deleted user records.

Options: 

1. deleted_at column to store deleted records.
2. Create an archive table for deleted records.

Decision: 
Use a deleted_at column within the user table and if needed, convert to 
archive table for maintain deleted records in future.

### Joint Tables

Consideration: 

1. Clean way to store information and relation between users and
student/teacher/admin.
2. Access roles from users table
3. Automatically update mapping table when deleting records in role table.

Options:

1. 3 mapping tables for student, teacher and admin respectively. This is more
messy due to the number of tables created.
2. 1 mapping table with actable type/id.
Only can cascade in one direction.
3. SQL inheritance.
Doesn't work in the case where users have multiple roles.
eg. a user is both a teacher and an admin.

Decision:
3 mapping tables for each role.

### Flexible requirements

Consideration:

Given requirements might be subjected to change in the future.
eg. Student might belong to more than one class.

Decision:

Design relation to be flexible and extensible.

### Words with multiple meanings

Consideration:

Ascertain dual meaning words to have one specific meaning
when interpreted through image/audio/category.

Decision:

A word is determined by its meaning and not be its name.
So each word will have images and audios related to its meaning.