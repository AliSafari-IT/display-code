# Contributing to @asafarim/display-code

Thank you for your interest in contributing to @asafarim/display-code! This document provides guidelines and instructions to help you contribute effectively.

## Code of Conduct

Please be respectful and considerate of others when contributing to this project. We aim to foster an inclusive and welcoming community.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v14 or higher)
- [pnpm](https://pnpm.io/) (v8.15.2 or higher)
- Git

### Setting Up the Development Environment

1. Fork the repository on GitHub
2. Clone your fork locally:

   ```bash
   git clone https://github.com/YOUR-USERNAME/display-code.git
   cd display-code
   ```

3. Install dependencies:

   ```bash
   pnpm install
   ```

4. Build the package:

   ```bash
   pnpm run build
   ```

5. Run the demo to verify everything works:

   ```bash
   pnpm run demo
   ```

## Development Workflow

### Project Structure

```text
├── src/                  # Source code
│   ├── components/       # React components
│   ├── types/            # TypeScript type definitions
│   ├── utils/            # Utility functions
│   └── index.ts          # Main entry point
├── demo/                 # Demo application
├── dist/                 # Compiled output (generated)
├── .github/              # GitHub configuration
└── package.json          # Package configuration
```

### Making Changes

1. Create a new branch for your feature or bugfix:

   ```bash
   git checkout -b feature/your-feature-name
   ```

   or

   ```bash
   git checkout -b fix/issue-you-are-fixing
   ```

2. Make your changes to the codebase

3. Test your changes:
   - Build the package: `pnpm run build`
   - Run the demo: `pnpm run demo`
   - Verify your changes work as expected

4. Commit your changes with a descriptive commit message:

   ```bash
   git commit -m "Add feature: your feature description"
   ```

### Pull Requests

1. Push your branch to your fork:

   ```bash
   git push origin feature/your-feature-name
   ```

2. Open a pull request against the `main` branch of the original repository

3. In your pull request description:
   - Clearly describe the changes you've made
   - Reference any related issues
   - Include screenshots or GIFs if applicable

4. Wait for maintainers to review your pull request

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Ensure proper type definitions for all functions and components
- Avoid using `any` type when possible

### React Components

- Use functional components with hooks
- Document props using TypeScript interfaces
- Keep components focused on a single responsibility

### CSS

- Use CSS Modules for component styling
- Follow the existing naming conventions

### Testing

- Add tests for new features when applicable
- Ensure all tests pass before submitting a pull request

## Documentation

When adding new features or making significant changes:

1. Update the README.md with examples and descriptions
2. Document props and functions with clear descriptions
3. Update the demo application to showcase the new functionality

## Release Process

The maintainers will handle the release process, which includes:

1. Updating the version in package.json
2. Creating a new release on GitHub
3. Publishing to npm

## Reporting Issues

If you find a bug or have a feature request:

1. Check if the issue already exists in the [GitHub Issues](https://github.com/AliSafari-IT/display-code/issues)
2. If not, create a new issue with:
   - A clear title and description
   - Steps to reproduce the issue
   - Expected and actual behavior
   - Screenshots if applicable
   - Version information

## Questions and Discussions

For questions or discussions about the project:

- Open a [GitHub Discussion](https://github.com/AliSafari-IT/display-code/discussions) if available
- Reach out to the maintainers

## License

By contributing to this project, you agree that your contributions will be licensed under the project's [MIT License](LICENSE).

---

Thank you for contributing to @asafarim/display-code! Your efforts help make this project better for everyone.
