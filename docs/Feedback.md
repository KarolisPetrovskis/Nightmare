# Feedback on Nightmare System design

Overall grade of the received design document: 8/10

All the changes to the initial design can be found [here](./CHANGELOG.md)

## Class diagram

### 

- The class diagram needed minimal change, the already designed classes were good, and only a few were missing.
- New classes were not hard to append to an existing design.
- Remaking some classes into enums is more of a nitpick then a huge design flaw. 

###

- No description, explanation of class diagram, this leads to quite a few questions mentioned bellow.
- There are no explanation how relationships interact between each other, is it one to one, one to many or many to many?
- It is impossible to tell what fields are required, mandatory (it is also impossible to say what fields are nullable). So the developers have no idea how to handle data inputs and validations.
- Why are class names plural when they seem to handle cost?
- Difference between `date`, `time` and `date_time` field data type.
- Some fields use `float` type instead of `decimal`, which can lead to inversive calculations.
- Since ids are numbers it can be hard to track when they are a simple number and when they are an id (as it is there are things like `UserType` that is an id), for clarity there should have been something to mark such ids as foreign keys or primary keys.
- We add discounts to each item by hand during creation of service or during edit, there is no way to apply same discount order wide or for multiple items.
- No `Discount` class.
- Gift cards are valid indefinitely, since they do not have end date.
- Gifts codes are reusable as there is nothing to check if they have already been used in the class.
- Order does not include services so we cant have any services in the order, or any other way to store and process payments for these services.
- What are Plans linked to User and why are they needed (in the system context)? It is only mentioned in the Class diagram and nowhere else.
- Arrow that connects from `OderDetails` to `MenuItem` should be the other way around as now the flow for Orders is `Orders` -> `Order_details` -> `Order_detail_add_on`. We do not actually get any item menu data.
- Arrow that connects from `Order_detail_add_on` to `Menu_item_ingredients` should be the other way around.
- The system handles any potential changes to vats incredibly poorly by design, any change in vat percentage would require to create new entry in vat table, and update every single location that had pointer to old vat. Otherwise updating an existing vat would change it for past order as well.
- User type is a field in user class, however not mentioned anywhere in wireframes (is this related to permissions or role of the worker?).
- It would be better to have enums for `User_Type`, `Business_Type_Names`, `Statuses` instead of additional tables, since they are just key value pairs.
- What is `code`: string in `Orders` and `Appointments`?
- How is the `code` and `customer_code` different in `Appointments`?
- In Service creation we have discount but we don't have a way to set `DiscountTime`, unlike in menu item class.
- Discount system is very rigid and not scalable, it would have to be remade if any changes to it in terms of options or tracking were to be needed to be added.
- Vats have no option for end date, no vat history.
- Some database entities use singular naming (`User`, `Menu_item`, `Vat`, ...) others plural (`Appointments`, `Statuses`, `Services`, ...).

## Workflows

###

- The workflows had detailed descriptions.
- Workflow diagrams were easy to read.
- Workflows provided detail into multiple paths (creation, editing, cancellation).

###

- In Worker management popup fig. the password is not hidden and anyone can see it.
- These workflows do not give much insight into to the working of the system and seem to be more of UI requirements more than anything, the workflows: Schedule overview wireframe fig. Day scheduling wireframe fig., Worker management screen fig. 15, Worker management popup fig 16,
- Fig 15 and 16 have the same caption, fig 16 is not even related to workers and their management.
- In Appointment payment workflow fig. “Client is dissatisfied and asks for a refund” thing is not necessary and should have been an endpoint, something that it does not lead to.

## Mockups

###

- Mockups had detailed descriptions.
- Mockups had consistent style.
- Mockups gave insight into how some of the data input should be handled, which fields should be optional, which should not (sadly not for all entities).

###

- “Order management is accessed window is accessed…”?
- It is unclear how the Delete Dish works. Like if we click does it delete the top one or you need to select a dish you want to delete and then press it?
- “Figure 5. Add order to the dish wireframe” - What? No, it should be the other way around.
- Ordering seems kinda not thought out. Every time we need to add a dish we get transported to other page. But the time it takes to add multiple is too long.
- Worker appointment scheduling wireframe design is pretty convenient and simple, although for bigger businesses it wouldn't be very convenient.

## Package diagram

###

- Package diagram describes the flow of information well.
- A package for Stripe integration was included.

###

- Discount system package appear in two different places.
- Discount system package should not be part of the Payment System.

# YAML

###

- The provided endpoints were well-implemented and covered the basic CRUD operations effectively. However, for more complex objects, it would have been beneficial to include endpoints that allow retrieving or updating parts of an object rather than always requiring full object manipulation. This would make working with nested or composite entities more flexible and reduce overhead when only partial updates or queries are needed.
- The return codes for non happy paths were provided.
- Endpoints and their fields were described well.
- The API matched the class diagram pretty well. 

###

- `/payments/refund` uses payment id to refund but nowhere in class diagram its saved so such an operation is not possible unless we can get the payment id from the completed order.
- No endpoints provided for super admin functionality.
- Instead of having `user` in the yaml like class diagram we have `employee` - a mismatch
- Yaml references menu when no such direct class exists in the class diagram
- In `/appointments` post it is unclear what name is, the example values is "string" which is uninformative and the class diagram does not have a field with the name of "name". The example given in yamls example value field is "string".
- Some deletes include nid in their endpoint some use body to pass the nid - inconsistent methodologies.
- In `/employees` post an employee can be created without a password as it is not required.
- Order creation yaml has `order_details` but in class diagram order doesn't have order details
- In vat put, id is not part of the endpoint nor the body, although it does show that it is required.
