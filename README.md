# Jalaram Sweet Shop Management System

A role-based Sweet Shop Management System for managing sweets, inventory, and sales.

## What This Project Does

This application manages a sweet shop where items are sold by **weight** (grams) or **count** (pieces).

### User Roles

| Role | Can Do |
|------|--------|
| **Admin** | Manage items, SKUs, pricing, inventory, create cashiers |
| **Cashier** | View items, process sales |
| **Customer** | Browse sweets, make purchases |

### Core Features

**Items & SKUs**
- Items represent sweet types (e.g., Kaju Katli, Gulab Jamun)
- SKUs are sellable units with prices (e.g., 250g for ₹200, 500g for ₹380)

**Inventory**
- Inventory tracked at item level in base units (grams/pieces)
- Sales deduct from inventory based on SKU size
- Out-of-stock items cannot be purchased

**Authentication**
- Customers can self-register
- Cashiers are created by Admin
- JWT-based secure login

## Tech Stack

- **Backend:** Django + PostgreSQL
- **Frontend:** React + TypeScript
- **Deployment:** Railway + Vercel

## My AI Usage

### Tools Used
- **Claude (Anthropic)** - Development assistance
- **ChatGPT (OpenAI)** - Requirements clarification

### Usage Summary

| Phase | AI Tool | How It Helped |
|-------|---------|---------------|
| Requirements | ChatGPT | Clarified business logic for inventory management |
| Setup | Claude | Project structure and README preparation |

*Detailed usage will be documented as development progresses.*

### Commit Co-authorship

All AI-assisted commits include:
```
Co-authored-by: Claude <AI@users.noreply.github.com>
```

---

## Author

**Shivam** - [GitHub](https://github.com/shivam1108-06)
