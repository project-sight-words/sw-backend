# Git workflow

The workflow applied for the backend is a
[Git Feature Branch Workflow](https://www.atlassian.com/git/tutorials/comparing-workflows/feature-branch-workflow).

## Prerequisites

Clone the project onto your local machine.

```shell
git clone https://github.com/project-sight-words/sw-backend.git
cd sw-backend/
```

## General steps

1. Grab the latest changes from `development`.

   ```shell
   git checkout development
   git fetch origin development
   git reset --hard origin/development
   ```

2. Create a new local feature branch as per our naming convention
   `<name>/[fix|feature]/<issue number>`. An example is shown below.

   ```shell
   git checkout -b jiahao/fix/12
   ```

3. Make the relevant changes within the branch.

4. Commit your changes. The general convention for what goes into a commit
   message is based off of
   [CS2103T’s Git commit conventions.](https://se-education.org/guides/conventions/git.html#git-conventions)

   ```shell
   git add <files>
   git commit -m "Add ..."
   ```

5. Push the feature branch to the Github remote repository.

   ```shell
   git push -u origin jiahao/fix/12
   ```

   **Note:** A push can fail if the Markdown files in the repository are not
   properly formatted. To fix the formatting, run `yarn lint:markdown:fix` and
   commit the relevant Markdown files changed.

6. Create a pull request from your new feature branch to `development`.

7. Describe the pull request in detail, providing explanations for the changes
   made.

## Guidelines

### Creating issues

Before creating a new branch, always ensure that a new issue is created first so
that the branch can properly target that issue.

Without an issue, it is harder to track the progress and reasons why the
feature/fix was made.

For bug reports, please include the following information as a starting point to
help the assigned developer replicate the issue.

1. Steps taken to encounter the bug.
2. Environment you are using when the bug occurred.
3. Additional information about the bug.

### Atomic commits

While not described in the guide above, please try to keep your commits as
[atomic](https://en.wikipedia.org/wiki/Atomic_commit) as possible. This means
not changing large chunks of unrelated code and committing it all at once.

The most ideal flow when committing would be to commit once a set of related
changes have been added and can be easily described with a one-liner as the
subject of the commit.
