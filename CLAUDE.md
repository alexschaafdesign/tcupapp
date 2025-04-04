# CLAUDE.md - Developer Guidelines

## Build Commands
- Frontend: `cd frontend && npm start`
- Backend: `cd backend && npm run dev`
- Frontend tests: `cd frontend && npm test`
- Run single test: `cd frontend && npm test -- -t "testName"`
- Migrations: `cd backend && npm run migrate`

## Code Style Guidelines
- **JavaScript**: Follow React-app ESLint rules
- **Imports**: Group by external, internal, then components/styles
- **Naming**: camelCase for variables/functions, PascalCase for components/classes
- **Error Handling**: Use try/catch with detailed error messages, log context
- **React Components**: Functional components with hooks preferred
- **Backend**: ES modules with explicit exports
- **Python Scrapers**: Document functions, handle exceptions, include comments
- **CSS**: Use Material UI styled components
- **Git Commits**: Descriptive, concise, reference issue numbers