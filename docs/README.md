# TrendDojo Documentation

Welcome to TrendDojo - an AI-powered trading platform for systematic strategy development and execution.

## 🚀 Quick Start

- **[Quick Setup Guide](./setup/QUICK_SETUP.md)** - Get the app running in 5 minutes
- **[Project Context](./PROJECT_CONTEXT.md)** - Understand the business and technical overview
- **[Development Workflow](./operations/DEVELOPMENT_WORKFLOW.md)** - How to contribute effectively

## 📚 Documentation Structure

### Core Documentation
Essential files for understanding the project:

- **[PROJECT_CONTEXT.md](./PROJECT_CONTEXT.md)** - Business model, tech stack, and system overview
- **[ROADMAP.md](./ROADMAP.md)** - Product roadmap and future plans
- **[architecture.md](./architecture.md)** - High-level system architecture

### 🏗️ Architecture & Patterns
System design and best practices:

- **[patterns/](./patterns/)** - Design patterns and best practices
  - [DESIGN-PATTERNS.md](./patterns/DESIGN-PATTERNS.md) - UI/UX patterns and component standards
  - [ARCHITECTURE-PATTERNS.md](./patterns/ARCHITECTURE-PATTERNS.md) - System architecture patterns
  - [TRADING-PATTERNS.md](./patterns/TRADING-PATTERNS.md) - Trading-specific patterns
  - [REFRESH-PATTERNS.md](./patterns/REFRESH-PATTERNS.md) - Data refresh strategies
  - [LIVING-THEME-USAGE.md](./patterns/LIVING-THEME-USAGE.md) - Theme system usage

### 📊 Data & Market Systems
All data architecture and market data handling:

- **[data/](./data/)** - Consolidated data documentation
  - Market data strategy and sync
  - Database architecture and migrations
  - Multi-timeframe data handling
  - Single source of truth strategy

### 🎨 Features & Systems

- **[features/](./features/)** - Feature-specific documentation
  - [CHART-SYSTEM.md](./features/CHART-SYSTEM.md) - Chart theming and implementation
  - [DESIGN_SYSTEM.md](./features/DESIGN_SYSTEM.md) - UI component design system
  - [TRADING-PHILOSOPHY.md](./features/TRADING-PHILOSOPHY.md) - Core trading principles
- **[brokers/](./brokers/)** - Broker integration guides
  - [ALPACA_SETUP.md](./brokers/ALPACA_SETUP.md) - Alpaca broker configuration
  - [BROKER_INTEGRATION.md](./brokers/BROKER_INTEGRATION.md) - General broker integration

### 🚢 Operations & Deployment

- **[operations/](./operations/)** - Development operations
  - [DEVELOPMENT_WORKFLOW.md](./operations/DEVELOPMENT_WORKFLOW.md) - Development process
  - [TIDY-PROTOCOL.md](./operations/TIDY-PROTOCOL.md) - Code cleanup procedures
- **[deployment/](./deployment/)** - Deployment guides and status
- **[infrastructure/](./infrastructure/)** - Infrastructure configuration
- **[setup/](./setup/)** - Setup and configuration
  - [QUICK_SETUP.md](./setup/QUICK_SETUP.md) - Quick start guide
  - [ENVIRONMENT_VARIABLES.md](./setup/ENVIRONMENT_VARIABLES.md) - Environment configuration
  - [PORT_CONFIG.md](./setup/PORT_CONFIG.md) - Port configuration

### 📋 Decisions & Releases

- **[decisions/](./decisions/)** - Architecture Decision Records (ADRs)
- **[releases/](./releases/)** - Release notes and deployment history

### 🔒 Security

- **[SECURITY.md](./SECURITY.md)** - Security guidelines and best practices

### 📦 Archive
Historical documentation and deprecated content:

- **[archive/](./archive/)** - Archived documentation from v1 and old implementations

## 🎯 Key Principles

1. **Living Theme System** - All UI components use the centralized theme at `/dev/theme`
2. **Single Source of Truth** - One authoritative location for each piece of information
3. **Pattern-Driven Development** - Check patterns/ before implementing new features
4. **Security First** - Follow security guidelines for all trading and financial features

## 🔍 Finding Information

### By Role

**For Developers:**
- Start with [setup/QUICK_SETUP.md](./setup/QUICK_SETUP.md)
- Review [patterns/](./patterns/) before coding
- Check [operations/DEVELOPMENT_WORKFLOW.md](./operations/DEVELOPMENT_WORKFLOW.md)

**For Traders:**
- Read [features/TRADING-PHILOSOPHY.md](./features/TRADING-PHILOSOPHY.md)
- Understand [patterns/TRADING-PATTERNS.md](./patterns/TRADING-PATTERNS.md)
- Review broker setup in [brokers/](./brokers/)

**For DevOps:**
- See [deployment/](./deployment/) for deployment procedures
- Check [infrastructure/](./infrastructure/) for system configuration
- Review [setup/ENVIRONMENT_VARIABLES.md](./setup/ENVIRONMENT_VARIABLES.md)

### By Topic

| Topic | Location |
|-------|----------|
| Market Data | `data/` folder |
| Database | `data/` folder |
| Charts | `features/CHART-SYSTEM.md` |
| UI Components | `patterns/DESIGN-PATTERNS.md` |
| Trading Logic | `patterns/TRADING-PATTERNS.md` |
| Deployment | `deployment/` folder |
| Security | `SECURITY.md` |
| Setup & Config | `setup/` folder |

## 📝 Documentation Standards

- **File Names**: UPPERCASE.md for documents, lowercase for folders
- **Updates**: Keep PROJECT_CONTEXT.md current with major changes
- **Patterns**: Document new patterns in appropriate patterns/ file
- **Decisions**: Record architecture decisions in decisions/ folder

## 🚧 Documentation Status

**Last major refactor: 2025-01-25**

### Changes Made:
- ✅ Reduced root docs from 29 to 6 essential files
- ✅ Consolidated all data docs into `data/` folder (9 files)
- ✅ Created `setup/` folder for configuration docs
- ✅ Created `operations/` folder for development processes
- ✅ Created `features/` folder for feature documentation
- ✅ Added this README as central navigation hub

### Root Files (6 only):
1. **README.md** - This navigation guide
2. **PROJECT_CONTEXT.md** - Project overview
3. **ROADMAP.md** - Product roadmap
4. **architecture.md** - System architecture
5. **SECURITY.md** - Security guidelines
6. **CLAUDE.md** - AI context file

This structure provides clear organization while maintaining easy access to essential documentation.