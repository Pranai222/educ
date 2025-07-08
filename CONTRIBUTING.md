# Contributing to eVidya

Thank you for considering contributing to eVidya! This document provides guidelines and instructions for contributing to this project.

## Table of Contents
- [Contributing to eVidya](#contributing-to-evidya)
	- [Table of Contents](#table-of-contents)
	- [Code of Conduct](#code-of-conduct)
	- [Getting Started](#getting-started)
	- [How to Contribute](#how-to-contribute)
		- [Reporting Bugs](#reporting-bugs)
		- [Suggesting Features](#suggesting-features)
		- [Pull Requests](#pull-requests)
	- [Style Guidelines](#style-guidelines)
		- [Code Formatting](#code-formatting)
		- [Commit Messages](#commit-messages)
	- [Development Setup](#development-setup)
	- [Project Structure](#project-structure)
	- [License](#license)

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for everyone. Please be kind and considerate to others, and avoid any form of harassment or offensive behavior.

## Getting Started

Before contributing, please ensure you have:
1. Forked the repository
2. Cloned your fork locally
3. Set up the development environment (see [Development Setup](#development-setup))

## How to Contribute

### Reporting Bugs

If you find a bug, please create an issue with the following information:
- Clear and descriptive title
- Steps to reproduce the issue
- Expected behavior
- Actual behavior
- Screenshots (if applicable)
- Browser/device information

### Suggesting Features

We welcome feature suggestions! When suggesting a feature:
- Use a clear and descriptive title
- Provide a detailed explanation of the feature
- Explain why this feature would be useful
- Consider including mockups or examples

### Pull Requests

1. Create a branch for your changes (`git checkout -b feature/your-feature-name`)
2. Make your changes
3. Ensure code passes all tests
4. Commit your changes with descriptive commit messages
5. Push to your fork
6. Submit a pull request to the `main` branch
7. Include a description of your changes in the pull request

For significant changes, please open an issue first to discuss your proposed changes.

## Style Guidelines

### Code Formatting

- Use 2 space indentation for HTML and CSS
- Use semicolons in JavaScript
- Follow consistent naming conventions
- Add comments for complex code sections

### Commit Messages

- Use the present tense ("Add feature" not "Added feature")
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters or less
- Reference issues and pull requests liberally after the first line

## Development Setup

This project is a static website that can be run locally without any build tools.

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/eVidya.git
   cd eVidya
   ```

2. Open the project in your preferred code editor

3. Launch the site locally:
   - Open `index.html` directly in a browser, or
   - Use a local development server:
     ```bash
     # If you have Python installed
     python -m http.server

     # If you have Node.js installed
     npx serve
     ```

## Project Structure

```
eVidya/
├── css/                    # Stylesheets
├── js/                     # JavaScript files
├── pages/                  # HTML pages
├── images/                 # Images
├── 404.html                # Custom 404 page
├── index.html              # Home page
└── README.md               # Project documentation
```

## License

By contributing, you agree that your contributions will be licensed under the project's [MIT License](LICENSE).

---

Thank you for contributing to eVidya! Your help makes this project better for everyone.
