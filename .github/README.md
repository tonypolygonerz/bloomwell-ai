# GitHub Configuration

This directory contains GitHub-specific configuration files for the Bloomwell AI repository.

## 📁 Contents

### `/workflows`
GitHub Actions CI/CD workflows.

- **`ci.yml`**: Continuous Integration workflow
  - Runs on push to main/develop
  - Linting and type checking
  - Build verification
  - Test execution

### `/ISSUE_TEMPLATE`
Issue templates for consistent bug reports and feature requests.

- **`bug_report.md`**: Template for reporting bugs
- **`feature_request.md`**: Template for requesting new features

### Other Files

- **`PULL_REQUEST_TEMPLATE.md`**: Template for pull requests
- **`CODEOWNERS`**: Defines code review assignments

## 🔄 GitHub Actions Workflows

### CI Workflow
Triggered on:
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop`

Steps:
1. Lint and type check
2. Build application
3. Run tests

## 📝 Using Issue Templates

When creating a new issue, select the appropriate template:

1. **Bug Report**: For reporting unexpected behavior
2. **Feature Request**: For suggesting new features

Templates ensure all necessary information is collected.

## 🔒 Code Owners

The CODEOWNERS file defines:
- Who reviews changes to specific parts of the codebase
- Automatic review requests for PRs
- Ownership of critical areas (auth, payments, database)

## 📋 Pull Request Guidelines

When creating a PR:
1. Fill out all sections in the template
2. Link related issues
3. Describe nonprofit impact
4. Complete testing checklist
5. Note any database changes
6. Request appropriate reviewers

## 🚀 Workflow Tips

- Keep PRs focused and atomic
- Write clear commit messages
- Ensure all CI checks pass
- Respond to review feedback promptly
- Keep your branch up to date with main

## 🔧 Customizing Workflows

To modify workflows:
1. Edit files in `/workflows`
2. Test changes in a feature branch
3. Review GitHub Actions documentation
4. Monitor workflow runs in GitHub UI

## 📖 Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [CODEOWNERS Documentation](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners)
- [Issue Templates Documentation](https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests)





