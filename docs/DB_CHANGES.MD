# Changes in DB

## Not changed

### Appointment (No changes)
* long Nid 
* string Code 
* long BusinessId 
* long ServiceId 
* long EmployeeId 
* DateTime AppointmentDate 
* DateTime AppointmentStart 
* DateTime AppointmentEnd 
* decimal Total 
* long StatusId 
* string? CustomerCode 
* string? CustomerName 
* string? CustomerNumber 

### GiftCard (No changes, Have it in DB, but didn't use it and have no way to controll it)
* long Nid 
* string Code 
* decimal Value 
* DateTime DateCreated 
* long BusinessId 

### ManuItem (No changes)
* long Nid 
* string Name 
* long BusinessId 
* decimal Price 
* decimal? Discount 
* DateTime? DiscountTime 
* long VatId 

### MenuItemIngredient (No changes)
* long Nid 
* string Name 
* long? GroupId 
* decimal Price 

### OrderDetailAddOn (No changes)
* long Nid 
* long DetailId 
* long IngredientId 
* decimal PriceWoVat 

### Vat (No Changes)
* long Nid 
* required string Name 
* float? Percentage 
* DateTime DateCreated 

### BusinessTypeName (No changes, Not used)
* long Nid 
* string Name 

### Plan  (No changes, Not used)
* long Nid 
* string Name 
* decimal Price 

### Status (No Changes, Not used)
* long Nid 
* string Name 
* int Type 

### UserType (No Changes, Not used)
* long Nid 
* string Name 

## Changed

### Business (Changed)
* long Nid 
* string Name 
* long Type 
* long OwnerId 
* \+ *DateTime WorkStart (new)*
* \+ *DateTime WorkEnd (new)*
* string? Address 
* string? Phone 
* string? Email 

### Order (Changed)
* long Nid 
* string? Code 
* long VatId 
* ~ *OrderStatus Status (Changed **long StatusId** to **OrderStatus(Enum) Status)***
* decimal Total 
* DateTime DateCreated 
* long BusinessId 
* long? WorkerId 
* decimal Discount 

### OrderDetail (Changed)
* long Nid 
* long OrderId 
* long ItemId 
* \- *decimal PriceWoVat (Removed)* 
* \- *decimal PriceWtVat (Removed)*
* \+ *decimal BasePrice (New)*
* \+ *decimal VatRate (New)*
* \+ *decimal? DiscountPercent (New)*
* int Quantity 

### Service (Changed)
* long Nid 
* required string Name 
* required decimal Price 
* decimal? Discount 
* required long VatId 
* DateTime? DiscountTime 
* required int TimeMin 
* required long BusinessId 
* \+ *string? Description (New)*

### User (Changed)
* long Nid 
* required string Name 
* required string Surname 
* required string Email 
* required string Password 
* ~ *required UserRole UserType (Changed **long UserType** to **UserRole(Enum) UserType**)*
* \+ *required long BusinessId (New)* 
* string? Address 
* string? Telephone 
* long? PlanId 
* decimal? Salary 
* long? BossId 
* string? BankAccount 

## New

### \+ *MenuItemIngredientGroup (New)*
* \+ *long Nid* 
* \+ *string Name* 
* \+ *long MenuItemId* 

### \+ *Payment  (New)*
* \+ *long Nid*
* \+ *long OrderId*
* \+ *decimal Amount*
* \+ *string Currency*
* \+ *PaymentMethod PaymentMethod*
* \+ *PaymentStatus Status*
* \+ *DateTime CreatedAt*
* \+ *DateTime? ProcessedAt*
* \+ *string? TransactionId*
* \+ *string? CustomerEmail*
* \+ *string? ErrorMessage*

Used for "Stripe" integration

### \+ *Receipt (New)*
* \+ *long Nid*
* \+ *long OrderId*
* \+ *long PaymentId*
* \+ *string ReceiptNumber*
* \+ *DateTime IssuedAt*
* \+ *decimal Total*
* \+ *string Currency*
* \+ *string? StripeReceiptUrl*
* \+ *long BusinessId*
* \+ *string? DetailedContent*

Used for storing receipt. Also dublicates "Stripe" receipt