# NodeJs-WebSite
Node.js application that emulates a beverage store
The website is a Node.js application that emulates a beverage store. It incorporates various features and functionalities to provide a user-friendly experience for visitors. Here is a detailed description of the website's components:

Node.js: The website is built using Node.js, a JavaScript runtime that allows server-side execution of JavaScript code. Node.js enables the website to handle HTTP requests, interact with databases, and perform other server-related tasks efficiently.

SQLite3 Database: The website utilizes a simple SQLite3 database to store and manage data related to beverages. This database enables the website to store information about different drink items, such as their names, prices, descriptions, and available quantities.

Login Page: The website includes a login page that allows users to create an account or sign in with their existing credentials. This functionality ensures that users can access personalized features and interact with the website using their unique accounts.

Beverage Questionnaire: The website features a beverage questionnaire that enables users to provide their preferences regarding drinks. This questionnaire might include questions about their preferred beverage types, flavors, or any other relevant information. The answers collected through the questionnaire can help personalize the user's experience and provide tailored recommendations.

Spam Protection Middleware: To protect the login button from spam or malicious activities, the website implements a middleware. This middleware acts as a security layer, validating and filtering incoming requests before they reach the login functionality. It helps prevent unauthorized access and ensures that the login process remains secure.

Resource Not Found Handling: If a user attempts to access a non-existent resource or URL, the website implements a mechanism where the site is temporarily locked for that specific user. In such cases, the website enforces a time-based restriction, blocking access for a predetermined interval. This measure helps prevent potential abuse or suspicious activities, ensuring the site's security and stability.

Admin Page: The website includes an admin page that grants authorized users access to additional functionalities. Within the admin page, users with administrative privileges can add new beverage items to the database. This feature allows for easy management and expansion of the available drink selection.

User Page: The user page provides a personalized view for each individual user. Users can view and manage the items they have added to their shopping cart. This page allows them to see the beverages they have selected, update quantities, remove items, or proceed to checkout.

Overall, the website offers a simulated beverage store experience using Node.js as the backend framework. It leverages a SQLite3 database to store drink-related information, includes essential features like login, spam protection, resource handling, and provides distinct admin and user pages for different user roles.
