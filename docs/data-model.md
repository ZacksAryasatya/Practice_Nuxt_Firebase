# Data Model: Firestore

Firestore is a document database. The ERD below is a conceptual aid; it does not imply relational tables or SQL joins.

## Conceptual ERD

```mermaid
    CATEGORY ||--o{ PRODUCT : classifies
    ADMIN ||--o{ PRODUCT : manages
    ADMIN ||--o{ CATEGORY : manages
    PRODUCT {
        string name
        string sku
        string categoryId
        number priceIdr
        number stockQuantity
        string status
    }
    CATEGORY {
        string name
        string description
    }
    ADMIN {
        string uid
        string email
    }
```

The admin is an Authentication identity, not a user-owned data record required for every product. If audit attribution is added, store UID fields and define retention/access requirements.

## Collections

### `categories/{categoryId}`

| Field | Type | Required | Notes |
|---|---|---:|---|
| `name` | string | yes | Trimmed; normalized uniqueness policy. |
| `normalizedName` | string | yes | Lowercase/normalized comparison key, generated consistently. |
| `description` | string | no | Bounded length. |
| `createdAt` | Timestamp | yes | Server timestamp. |
| `updatedAt` | Timestamp | yes | Server timestamp. |

### `products/{productId}`

| Field | Type | Required | Notes |
|---|---|---:|---|
| `name` | string | yes | Trimmed; bounded length. |
| `normalizedName` | string | yes | For consistent search matching if needed; not full-text search. |
| `sku` | string | yes | Trimmed, normalized for uniqueness. |
| `categoryId` | string | yes | ID of a category document. |
| `description` | string | no | Bounded length. |
| `priceIdr` | integer number | yes | Non-negative whole rupiah. |
| `stockQuantity` | integer number | yes | Non-negative integer. Starts at zero; later changes only through a stock movement transaction. |
| `status` | string | yes | `active` or `inactive`. |
| `imagePath` | string | no | Supabase Storage object path; source of truth for the product photo, not a public URL. |
| `createdAt` | Timestamp | yes | Server timestamp, immutable after creation. |
| `updatedAt` | Timestamp | yes | Server timestamp. |
| `lastStockMovementId` | string | no | Most recent movement document ID, updated atomically with balance. |

### `stockMovements/{movementId}`

Append-only audit record committed atomically with the product stock balance.

| Field | Type | Required | Notes |
|---|---|---:|---|
| `productId` | string | yes | Product document ID. |
| `productName`, `sku` | string | yes | Snapshot labels preserve useful context if product details change. |
| `type` | string | yes | `in` or `out`. |
| `quantity` | integer | yes | Positive whole quantity. |
| `previousStock`, `newStock` | integer | yes | Balance before and after movement. |
| `reason` | string | yes | Admin-provided reason, maximum 500 characters. |
| `adminUid`, `adminEmail` | string | yes | Authenticated admin attribution. |
| `createdAt` | Timestamp | yes | Server timestamp. |

### `settings/inventory`

Global inventory configuration shared by authorized admins.

| Field | Type | Required | Notes |
|---|---|---:|---|
| `lowStockThreshold` | integer | yes | Non-negative threshold used by dashboard warnings. |
| `updatedAt` | Timestamp | yes | Server timestamp. |

Private bucket: `product-images`; object path: `{productId}/{fileId}.{extension}`. Keep the bucket private, apply storage policies, and create short-lived signed URLs to display files. In accordance with SOP/GRC/DEV-SPB/2026/008, maximum upload size is 5 MB with automatic client-side compression targeting < 1 MB.

## Query and index guidance

- Use bounded queries with `limit` and cursor pagination.
- Create composite indexes only when Firestore reports they are required for actual filter/order combinations; document them in the repository.
- Firestore does not provide general full-text search. MVP search may use a deliberately scoped prefix/filter strategy; adopt a search service only if requirements grow.
- Avoid dashboard designs that read every product to calculate totals. Add aggregates or a trusted maintained count only when justified.

## Integrity and uniqueness

Firestore does not provide relational foreign keys or unique constraints. Category deletion must be guarded by checking references, and SKU/category-name uniqueness needs an explicit strategy. Stock changes use a Firestore transaction to update product balance and append a movement together; rules require the pair to be consistent, and movement records are append-only. Client-side SKU/category uniqueness checks improve UX but cannot prevent all concurrent races.

## Data lifecycle

- Delete/replace the Supabase object when a product photo is deleted/replaced; handle partial failures and possible orphan cleanup.
- Block category deletion while products reference it.
- Product stock begins at zero; all later balance changes must use the movement transaction.
