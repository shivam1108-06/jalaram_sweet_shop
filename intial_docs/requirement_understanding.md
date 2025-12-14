Perfect 👍
Below is your **FINAL, CLEAN, FORMAL REQUIREMENTS DOCUMENT** for the **Sweet Shop Management System**, with the **inventory clarification written precisely and unambiguously**.

This document is:

* ✅ Business-correct
* ✅ Developer-clear
* ✅ Interview-ready
* ✅ Exam-ready
* ✅ No code, only requirements

You can directly put this in your **README / SRS / Design document**.

---

# Sweet Shop Management System

## Final Requirements Specification Document

---

## 1. Purpose of the System

The Sweet Shop Management System is a role-based application designed to manage users, sweet items, SKUs, pricing, and inventory while supporting real-world sweet shop operations where items are sold either by **weight** or by **count**.

---

## 2. User Roles and Access Control

The system supports three user roles:

### 2.1 Admin

* Admin users **cannot register**
* Admin users are **created manually from the backend (one-time setup)**
* Admin has **full system access**

### 2.2 Cashier

* Cashier users **cannot self-register**
* Cashier users are **created and managed by Admin**
* Cashier has **limited operational access**

### 2.3 Customer

* Customers **can register and login**
* Customers can browse and purchase items
* Customers have no administrative privileges

---

## 3. Role-Based Permissions

| Feature             | Admin | Cashier | Customer |
| ------------------- | ----- | ------- | -------- |
| Register            | ❌     | ❌       | ✅        |
| Login               | ✅     | ✅       | ✅        |
| Create Admin        | ❌     | ❌       | ❌        |
| Create Cashier      | ✅     | ❌       | ❌        |
| Create Item         | ✅     | ❌       | ❌        |
| Create / Manage SKU | ✅     | ❌       | ❌        |
| Set Price (INR)     | ✅     | ❌       | ❌        |
| Restock Inventory   | ✅     | ❌       | ❌        |
| View Items & SKUs   | ✅     | ✅       | ✅        |
| Purchase Items      | ✅     | ✅       | ✅        |

---

## 4. Item Definition

An **Item** represents a sweet product type.

### Item Attributes

* Item ID
* Item Name (e.g., Kaju Katli)
* Category (Dry / Milk / Other)
* Sale Type:

  * By Weight
  * By Count
* Inventory Unit:

  * Grams (for weight-based items)
  * Pieces (for count-based items)
* Status (Active / Inactive)

⚠️ **Price is NOT stored at item level**

---

## 5. SKU Definition and Management

### 5.1 SKU Concept

A **SKU (Stock Keeping Unit)** represents a **sellable unit** of an item.

### 5.2 SKU Management Rules

* SKUs are **manually created and managed by Admin**
* SKUs are **not auto-generated**
* Each SKU is linked to exactly one Item
* Each SKU has its own price in **INR**

### 5.3 SKU Attributes

* SKU Code (Admin-defined)
* Item ID
* Unit Type:

  * Weight (grams)
  * Count (pieces)
* Unit Value (e.g., 250 g, 500 g, 6 pieces)
* Price (INR)
* Status (Available / Unavailable)

---

## 6. Sales Type Rules

### 6.1 Weight-Based Items

* Items are sold in grams
* General SKUs:

  * 250 g
  * 500 g
* Admin may create custom SKUs (e.g., 300 g, 750 g)

### 6.2 Count-Based Items

* Items are sold in pieces
* SKUs represent number of pieces (e.g., 1 piece, 6 pieces)

---

## 7. **Inventory Management (CRITICAL CLARIFICATION)**

### 7.1 Core Inventory Principle

> **Inventory is always maintained at the ITEM level using base units
> (grams for weight-based items, pieces for count-based items).
> SKUs do not have independent inventory.**

---

### 7.2 Inventory Storage Rules

* For **weight-based items**, inventory is stored in **grams**
* For **count-based items**, inventory is stored in **pieces**
* Inventory is stored as a **single centralized quantity per item**

---

### 7.3 Inventory Addition (Admin Only)

* Admin adds inventory in bulk (e.g., kg or pieces)
* System converts bulk units to base units

**Example**

```
Admin adds 100 kg of Kaju Katli
System stores inventory as: 100,000 grams
```

---

### 7.4 Inventory Consumption During Sale

* Sales occur at **SKU level**
* Each SKU deducts its defined unit value from the **item-level inventory**

**Example Flow**

```
Available inventory: 100,000 grams

Sell SKU (250 g) → Inventory becomes 99,750 g
Sell SKU (500 g) → Inventory becomes 99,250 g
Sell SKU (300 g) → Inventory becomes 98,950 g
```

---

### 7.5 Inventory Validation Rule

* Before confirming a sale, the system must verify:

```
Available inventory ≥ SKU unit value
```

* If not satisfied, the sale is rejected due to insufficient stock

---

### 7.6 Inventory Status Rules

| Condition                     | Item Status  |
| ----------------------------- | ------------ |
| Inventory > 0                 | Available    |
| Inventory < smallest SKU unit | Limited      |
| Inventory = 0                 | Out of Stock |

---

## 8. Restocking Rules

* Only Admin can restock inventory
* Restocking increases item-level inventory
* Restocking uses base units internally

---

## 9. Security Requirements

* Token-based authentication (JWT)
* Role-Based Access Control (RBAC)
* Admin-only protection for:

  * Item creation
  * SKU creation
  * Pricing
  * Inventory management

---

## 10. Non-Functional Requirements

* Accurate inventory calculations
* High data consistency
* Secure authentication
* Scalable SKU handling
* Clean and intuitive user interface
* High test coverage with TDD

---

## 11. Final System Summary (Interview-Ready)

> The system maintains inventory centrally at the item level using base units, while SKUs represent sellable quantities with individual prices. This ensures accurate stock management, flexible pricing, and real-world operational correctness for a sweet shop.

---

## ✅ This Document Now:

✔ Precisely captures the inventory rule
✔ Eliminates ambiguity
✔ Matches real shop behavior
✔ Is suitable for SRS / README / Interview

