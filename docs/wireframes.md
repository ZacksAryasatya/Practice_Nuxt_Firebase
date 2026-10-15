# Wireframes (MVP)

Low-fidelity layout guidance; visual styling is intentionally deferred to implementation. Use a responsive layout, semantic HTML, visible focus indicators, labeled controls, and accessible dialogs.

## Shared dashboard shell

```text
+------------------------------------------------------+
| Inventory Panel                         Admin  [Out] |
+------------------+-----------------------------------+
| Dashboard        | Page title                        |
| Products         | Main content                      |
| Categories       |                                   |
+------------------+-----------------------------------+
```

On narrow screens, navigation collapses into an accessible menu; content uses full width and tables may become stacked cards or horizontally scrollable with clear affordance.

## Login `/login`

```text
+------------------------------------+
| Inventory Panel                    |
| Sign in                             |
| Email       [___________________]   |
| Password    [___________________]   |
|             [ Sign in ]             |
| Error/validation message            |
+------------------------------------+
```

No public signup link. Use appropriate autocomplete attributes and never log passwords.

## Dashboard `/dashboard`

```text
+------------------+-----------------------------------+
| Navigation       | Dashboard                         |
|                  | [Product count] [Category count]  |
|                  | Recent products (bounded)          |
|                  | [View products]                    |
+------------------+-----------------------------------+
```

Summary cards are convenience only; do not add costly unbounded reads. Show meaningful loading/empty/error states.

## Product list `/products`

```text
+------------------+-----------------------------------+
| Navigation       | Products              [Add product]|
|                  | [Search...] [Category] [Status]    |
|                  | Photo | Name | SKU | Stock | Price  |
|                  | ...                              | |
|                  | [Previous] Page 1 [Next]           |
+------------------+-----------------------------------+
```

Rows/cards expose View/Edit/Delete actions with accessible names. Confirm destructive actions. Use bounded queries/pagination, not loading the entire collection.

## Product form `/products/new`, `/products/:id/edit`

```text
+------------------+-----------------------------------+
| Navigation       | Add/Edit product                   |
|                  | Name*       [___________________]  |
|                  | SKU*         [___________________]  |
|                  | Category*    [Select category  v]  |
|                  | Price (IDR)* [___________________]  |
|                  | Stock*       [___________________]  |
|                  | Status       [Active          v]  |
|                  | Description  [___________________]  |
|                  | Photo        [Choose image]       |
|                  | [Cancel]                [Save]    |
+------------------+-----------------------------------+
```

Mark required fields, associate inline errors using `aria-describedby`, announce save status, and disable duplicate submission while saving. Image is compressed to lightweight WebP Base64 directly inside Firestore.

## Category list/form

List categories with name, description, product count where available, and actions. Create/edit in a focused page or dialog. Show a clear blocking message if a category is still assigned to products.
