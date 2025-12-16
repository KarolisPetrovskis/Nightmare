# Design Changelog

This document records significant decisions that deviate from, clarify, or extend the original system design.

## 1. Api Changes

### Order controller
Added endpoints for retrieving orders, order details, add-ons, and orders with items.
Added endpoints to add, remove, and update order items and item add-ons.
Added endpoints to update order status and calculate order cost.
Updated DeleteOrder to use a route parameter instead of a DTO.
 
```diff
public class OrdersController(IOrdersService ordersService)
{
+ Task<ActionResult<List<Order>>> GetAllOrders([FromQuery] OrderGetAllDTO request)
+
+ Task<ActionResult<List<OrderDetail>>> GetOrderDetailsByOrderNid(long orderNid)
+
+ Task<ActionResult<List<OrderDetailAddOn>>> GetAddonsByDetailNid(long detailNid)
+
+ Task<ActionResult<List<OrderDetailAddOn>>> GetOrderDetailAddOnsByDetailNid(long orderNid)
+
+ Task<ActionResult<OrderDetail>> AddItemToOrder(long orderNid, [FromBody] OrderDetailRequest request)
+
+ Task<IActionResult> RemoveItemFromOrder(long orderNid, long detailNid)
+
+ Task<IActionResult> UpdateOrderItem(long orderNid, long detailNid, [FromBody] OrderDetailUpdateDTO request)
+
+ Task<IActionResult> UpdateOrderItemAddons(
+     long orderNid,
+     long detailNid,
+     [FromBody] List<OrderAddOnsDTO> addons)
+
+ Task<IActionResult> UpdateOrderStatus(long orderNid, OrderStatus status)
+
+ Task<ActionResult<decimal>> CalculateCost(long orderNid, decimal tip)
+
+ Task<ActionResult<OrderWithItemsDTO>> GetOrderWithItems(long orderNid)
}
```

### AuthController
Added endpoints to get business ID, check if users exist, and create a business owner.

```diff
public class AuthController(IAuthService authService)
{
+ Task<ActionResult<long>> GetBusinessId()
+
+ Task<ActionResult<bool>> HasUsers()
+
+ Task<IActionResult> CreateBusinessOwner([FromBody] RegisterDTO request)
}
```

### BusinessController
Added endpoint to retrieve all businesses.

```diff
public class BusinessController : ControllerBase
{
+ Task<ActionResult<List<Business>>> GetBusinessesByOwnerNid(
+     [FromQuery] BusinessGetAllByOwnerNidDTO request)
}
```

### EmployeesController
Added endpoints to retrieve all employees and get an employee by email.

```diff
public class EmployeesController(IEmployeesService employeesService)
{
+ Task<ActionResult<List<User>>> GetAllEmployees([FromQuery] UserGetAllDTO request)
+
+ Task<ActionResult<User>> GetEmployeeByEmail(string email)
}
```

### MenuAddonGroupController
Added controller with full CRUD and query endpoints for menu add-on groups.

```diff
public class MenuAddonGroupController(IMenuAddonGroupService groupService)
+{
+ Task<ActionResult<List<MenuItemIngredientGroup>>> GetGroups(
+     [FromQuery] MenuAddonGroupGetAllDTO request)
+
+ Task<ActionResult<MenuItemIngredientGroup>> GetGroupByNid(long nid)
+
+ Task<ActionResult<List<MenuItemIngredientGroup>>> GetGroupsByMenuItemNid(long menuItemNid)
+
+ Task<ActionResult<MenuItemIngredientGroup>> CreateGroup(
+     [FromBody] MenuAddonGroupCreateDTO request)
+
+ Task<IActionResult> UpdateGroup(long nid, [FromBody] MenuAddonGroupUpdateDTO request)
+
+ Task<IActionResult> DeleteGroup(long nid)
+}
```

### PaymentsController
Added Stripe-related endpoints including payment intent creation, configuration retrieval, webhook handling, and payment lookups.

```diff
public class PaymentsController : ControllerBase
{
+ Task<IActionResult> CreatePaymentIntent(
+     [FromBody] CreatePaymentIntentRequest request)
+
+ IActionResult GetStripeConfig()
+
+ Task<IActionResult> StripeWebhook()
+
+ Task<IActionResult> GetPayment(long paymentId)
+
+ Task<IActionResult> GetPaymentsByOrder(long orderId)
}
```

### ReceiptController
Added endpoints to retrieve receipts by NID and get local receipt content.

```diff
public class ReceiptsController : ControllerBase
{
+ Task<IActionResult> GetReceiptByNid(long nid)
+
+ Task<IActionResult> GetLocalReceiptContent(long orderId)
}
```

## 2. Database Changes

### Business

Added work hours for easier shift creation.

```diff
+ DateTime WorkStart
+ DateTime WorkEnd
```

### Order

Used and Enum instead of a separate entity for `Status`

```diff
- long StatusId

+ OrderStatus Status
```

### OrderDetail

```diff
- decimal PriceWoVat
- decimal PriceWtVat

+ decimal BasePrice
+ decimal VatRate
```

### Service

Added description to services, since it was present in mockups.

```diff
+ string? Description
```

### User

Changed `UserType` from separate entity to an Enum. Added `BusinessId` to specify which business the user belongs to.

```diff
- long UserType
+ UserRole UserType

+ required long BusinessId
```

### MenuItemIngredientGroup

Added `MenuItemIngredientGroup` entity:

```diff
+ long Nid
+ string Name
+ long MenuItemId
```

### Payment

Added `Payment` entity:

```diff
+ long Nid
+ long OrderId
+ decimal Amount
+ string Currency
+ PaymentMethod PaymentMethod
+ PaymentStatus Status
+ DateTime CreatedAt
+ DateTime? ProcessedAt
+ string? TransactionId
+ string? CustomerEmail
+ string? ErrorMessage
```

### Receipt

Added `Receipt` entity:

```diff
+ long Nid
+ long OrderId
+ long PaymentId
+ string ReceiptNumber
+ DateTime IssuedAt
+ decimal Total
+ string Currency
+ string? StripeReceiptUrl
+ long BusinessId
+ string? DetailedContent
```

### Removed Entities

Removed unused entities.

```diff
- BusinessTypeName
- GiftCard
```

Replaced these entities with enums for simplicity.

```diff
- Status
- UserType
```

## 3. Frontend Changes

In Schedule-Management page added the year display next to the month, since whenever you go into the concrete days schedule management page full date year-month-day are displayed, while in the Schedule Management page the wireframe design did not contain that.
</br>
Added Edit modal, since the Business view mainframe contained edit buttons, however there was no wireframe page for how the editing should look like. (It was there in the figure 16, but with incorrect caption)
</br>
Added Home Page, which didn’t have its own mock up in documentation.
</br>
Added Login. There was no mock up in documentation.
</br>
In OrderHistory expanded filtering options: Added filtering by Worker ID and by States of the orders. These filter options are more practical, because noone really remembers specific order name or ID.
</br>
Added VAT Management, there was no Mockup for creation of VATs, only that already existing VAT are used as options in Menu Management.
</br>
Removed the Options button in Navbar because not only there was no documentation on what it should do, but also we didn’t see any point in using it.
</br>
Added Delete buttons in bussiness view (They werent there in the wireframe, but it makes sence to have it)
</br>
Added UserType (Manager, Staff, Owner) form in Worker creator page. In the wireframe there was no such field, therefore it was not possible to set user role when creating a worker.
</br>
Super admin users also have ability to assign the buisiness ID manually to created workers in the worker create modal.
</br>
