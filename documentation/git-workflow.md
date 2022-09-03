# Git workflow
The Git workflow applied for the backend is a branch -> pull request workflow

## Prerequisites

Clone the project onto your local machine

```
git clone https://github.com/project-sight-words/sw-backend.git
cd sw-backend/
```

## General steps

1. Grab the latest changes from `main`
    
    ```
    git fetch origin main
    git merge origin/main
    ```

2. Create a new local branch with naming convention `<name>/[fix|feature]/[issue no.]`. For e.g.

    ```
    git checkout -b jiahao/fix/12
    ```

3. Make the relevant changes within the branch and push the branch to this repository

    ```
    git push origin jiahao/fix/12
    ```

4. Create a pull request from new branch to `main` branch
5. Describe the pull request in detail, providing explanations for the changes made 

## Commit messages

The general conventions for what goes into a commit message will be based off of [CS2103T's Git commit conventions](https://se-education.org/guides/conventions/git.html#git-conventions)

### Atomic commits

While not described in the guide above, please try to keep your commits as atomic as possible. This means not changing large chunks of unrelated code and committing it all at once. 

The most ideal flow when committing would be to commit once a set of related changes have been added and can be easily described with a one-liner as the subject of the commit.

