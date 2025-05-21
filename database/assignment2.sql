-- 1. Insert a new account for Tony Stark
INSERT INTO account (account_firstname, account_lastname, account_email, account_password)
VALUES ('Tony', 'Stark', 'tony@starkent.com', 'Iam1ronM@n');

-- 2. Update Tony Stark's account to set the account_type to 'Admin'
-- Use the correct case and spelling for the ENUM value as defined in your schema.
UPDATE account
SET account_type = 'Admin' -- use 'admin' if that's the ENUM value in your table
WHERE account_email = 'tony@starkent.com';

-- 3. Delete Tony Stark's account from the database
DELETE FROM account
WHERE account_email = 'tony@starkent.com';

-- 4. Update the description of the GM Hummer to replace 'small interiors' with 'a huge interior'
UPDATE inventory
SET inv_description = REPLACE(inv_description, 'small interiors', 'a huge interior')
WHERE inv_make = 'GM' AND inv_model = 'Hummer';


-- 5. Select the make, model, and classification name for inventory items in the 'Sport' category
SELECT i.inv_make, i.inv_model, c.classification_name
FROM inventory i
INNER JOIN classification c ON i.classification_id = c.classification_id
WHERE c.classification_name = 'Sport';

-- 6. Update all inventory records to add '/vehicles' to the file path in inv_image and inv_thumbnail columns
UPDATE inventory
SET inv_image = REGEXP_REPLACE(inv_image, '^(.*/)', '\1vehicles/', 1),
    inv_thumbnail = REGEXP_REPLACE(inv_thumbnail, '^(.*/)', '\1vehicles/', 1);

