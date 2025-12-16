# Negative comments on Nightmare System design

## Class diagram

- No description, explanation of class diagram.
- There are no explanation how relationships interact between each other, is it one to one, one to many or many to many?
- All the fields are public in the class diagram based on the + sing.
- It is impossible to tell what fields are required, mandatory (it is also impossible to say what fields are nullable). So the developers have no idea how to handle data inputs and validations.
- Why are class names plural when they seem to handle cost?
- Difference between date, time and date_time field data type?
- Some fields use float type instead of decimal
- Since ids are numbers it can be hard to track when they are a simple number and when they are an id, for clarity there should have been something to mark such ids as foreign keys or primary keys.
- Why are we storing bank_account in user class (maybe for paying)?
- It is unclear what nid means? Is it number id or what? That is not explained as other things are like vat_id, status_id…
- What exactly is price_w_vat and how does it differ from prive_wo_vat?
- Do we add discounts by hand after creation of service or during edit (reference mock ups to be sure)?
- No discount class.
- So gift cards can be valid infinitely? (They don’t have end date)
- Order does not include services so we cant have any services in the order if so how are a list of services that are ordered on the spot by the customer handled?
- What does type (number) mean in the Statuses class?
- Statuses would have been better if it was simply an enum.
- What are Plans linked to User and why are they needed (in the system context)? It is only mentioned in the Class diagram and nowhere else.
- Arrow that connects from OderDetails to MenuItem should be the other way around as now the flow for Orders is Orders -> Order_details -> Order_detail_add_on. We do not actually get any item menu data.
- Why does arrow go from Order_detail_add_on to Menu_item_ingredients and not the other way around?
- Why Orders have a singular Vat if all the prices are already calculated and what would it point to (is there some restaurant wide vat that i do not understand? -Nikas).
- The system handles any potential changes to vats incredibly poorly by design.
- User type is a field in user class, however not mentioned anywhere in wireframes (is this related to permissions or role of the worker?)
- What is the point of a business phone number? We already have owner id so why do we still need the individual phone field?
- Gifts codes are reusable as there is nothing to check if they have already been used, meaning they are of infinite value (not good for business). Based on YAML it gets deleted but that wasnt mentioned anywhere (sadge probably delete this).
- Would it not be better to have enum for User_Type, Business_Type_Names, Statuses.
- What is code: string in Orders.and Appointments.


## Workflows

- In Worker management popup fig. the password is not hidden and anyone can see it.
- These workflows do not give much insight into to the working of the system and seem to be more of UI requirements more than anything, the workflows: Schedule overview wireframe fig. Day scheduling wireframe fig., Worker management screen fig. 15, Worker management popup fig 16, 
- Fig 15 and 16 have the same caption, fig 16 is not even related to workers and their management.

## Mockups
- “Order management is accessed window is accessed…”?
- It is unclear how the Delete Dish works. Like if I click does it delete the top one or you need to select a dish you want to delete and then press it?
- “Figure 5. Add order to the dish wireframe” - What? No, it should be the other way around.
- Ordering seems kinda not thought out. Every time I need to add a dish I get transported to other page. But the time it takes to add multiple is too long.
- Worker apointment scheduling wireframe design is pretty convenient and simple, although for bigger businesses it wouldn't be very convenient.
- 

## Package diagram

- Discount system package appear in two different places.
- Discount system package should not be part of the Payment System. 

## Package diagram

- In Appointment payment workflow fig. “Client is dissatisfied and asks for a refund” thing is not necessary and should have been an endpoint, something that it does not lead to.

# YAML

- /payments/refund uses payment id to refund but nowhere in class diagram its saved so such an operation is not possible unless we can get the payment id from the completed order.

	
