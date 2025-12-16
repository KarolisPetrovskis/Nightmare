# Receipt System Implementation

## Overview
Complete Stripe receipt integration for the payment system. Receipts are automatically generated when payments are completed and can be viewed from the Order History page.

## Backend Implementation

### Database Model
**File**: `backend/Server/Models/DatabaseObjects/Receipt.cs`
- `Nid` (Primary Key)
- `OrderId` - Links to Order
- `PaymentId` - Links to Payment
- `ReceiptNumber` - Unique receipt identifier (format: RCP-{timestamp}-{orderId})
- `IssuedAt` - Receipt generation timestamp
- `Total` - Receipt amount
- `Currency` - Payment currency
- `StripeReceiptUrl` - Stripe's receipt URL (if available)
- `BusinessId` - Links to Business

### Service Layer
**File**: `backend/Server/Services/ReceiptsService.cs`

Key methods:
- `CreateReceiptAsync(orderId, paymentId)` - Generates receipt and fetches Stripe receipt URL
  - Prevents duplicate receipts for same order/payment
  - Retrieves Stripe receipt URL from payment intent's charge
  - Generates unique receipt number
  
- `GetReceiptByOrderIdAsync(orderId)` - Fetches receipt for an order
- `GetReceiptByNidAsync(nid)` - Fetches receipt by ID
- `GetReceiptsByBusinessIdAsync(businessId)` - Lists all receipts for a business

### API Endpoints
**File**: `backend/Server/Controllers/ReceiptsController.cs`

- `GET /api/receipts/order/{orderId}` - Get receipt for specific order
- `GET /api/receipts/{nid}` - Get receipt by ID
- `GET /api/receipts/business/{businessId}` - List all business receipts
- `POST /api/receipts` - Create receipt (mainly for manual generation)

### Automatic Receipt Generation
**File**: `backend/Server/Services/PaymentsService.cs`

Receipts are automatically generated when:
- Payment status becomes `Completed`
- Called immediately after `UpdateOrderStatusAsync`
- Fails gracefully if Stripe receipt URL unavailable

## Frontend Implementation

### Receipt Service
**File**: `frontend/src/services/receiptService.ts`

Type definition:
```typescript
interface Receipt {
  nid: number;
  orderId: number;
  paymentId: number;
  receiptNumber: string;
  issuedAt: string;
  total: number;
  currency: string;
  stripeReceiptUrl?: string;
  businessId: number;
}
```

Methods:
- `getReceiptByOrderId(orderId)` - Fetch receipt for order
- `getReceiptByNid(nid)` - Fetch receipt by ID
- `getReceiptsByBusinessId(businessId)` - List all receipts

### UI Integration
**File**: `frontend/src/pages/AdminPages/OrderHistory/OrderHistory.tsx`

Receipt display in Payment Details modal:
- Shows receipt information (number, issued date, total)
- "View Receipt" button opens Stripe receipt in new tab
- Only displayed if receipt exists for the order
- Styled section at top of payment details modal

## How It Works

1. **Payment Intent Creation Flow**:
   - When creating a payment intent, the system now includes:
     - **Description**: First 3 items from the order (e.g., "2x Coffee, 1x Sandwich, 1x Cake...")
     - **Metadata**: Order ID, order code, business ID, order date, item count, total amount
     - **Line Items**: Up to 10 order items with quantity, name, and price (in metadata)
   - This information appears on the Stripe receipt and dashboard

2. **Payment Completion Flow**:
   - User completes payment via Stripe
   - `PaymentsService.ProcessPaymentAsync()` marks payment as completed
   - If customer email provided, updates payment intent with `ReceiptEmail` (Stripe auto-sends receipt)
   - Receipt is automatically created via `CreateReceiptAsync()`
   - Stripe receipt URL is fetched from payment intent's charge object

3. **Receipt Viewing Flow**:
   - User opens Order History page
   - Clicks "Details" button on an order
   - Modal fetches receipt via `receiptService.getReceiptByOrderId()`
   - If receipt exists, displays receipt section with "View Receipt" button
   - Button opens Stripe's receipt URL in new browser tab

4. **Stripe Receipt Content**:
   - Retrieved from `PaymentIntent.LatestCharge.ReceiptUrl`
   - Hosted by Stripe, includes:
     - Order description (item names)
     - All metadata (order details, line items)
     - Payment amount and currency
     - Business information
     - Payment method details
   - Accessible without authentication
   - Printable/downloadable by customer
   - If email provided, automatically emailed to customer

## Database Migration
Migration: `20251216033705_AddReceiptTable`
- Creates `Receipts` table with all fields
- Applied successfully to database

## Testing Checklist
- [x] Receipt model created
- [x] Database migration applied
- [x] Service methods implemented
- [x] API endpoints functional
- [x] Automatic receipt generation on payment completion
- [x] Frontend service created
- [x] UI displays receipt information
- [x] Stripe receipt URL opens correctly
- [x] No compilation errors

## Notes
- Receipts are immutable once created
- Duplicate receipts prevented (same orderId + paymentId)
- If Stripe receipt URL fails to fetch, receipt is still created without URL
- Receipt generation failure doesn't block payment completion
- Receipt URLs are customer-facing and shareable
