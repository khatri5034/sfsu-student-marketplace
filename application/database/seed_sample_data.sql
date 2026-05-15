-- Database is selected by the mysql client (see seed-sample-data.sh / DB_NAME in .env)
-- This seed intentionally resets all app data and inserts:
-- - 2 users (test1, test2)
-- - sample item rows are approval_status = approved (visible on home/search)
-- - listing images from /uploads/TESTING
-- - one conversation thread with sample messages

SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE messages;
TRUNCATE TABLE conversations;
TRUNCATE TABLE trade_requests;
TRUNCATE TABLE reports;
TRUNCATE TABLE listing_images;
TRUNCATE TABLE items;
TRUNCATE TABLE pickup_locations;
TRUNCATE TABLE courses;
TRUNCATE TABLE categories;
TRUNCATE TABLE conditions;
TRUNCATE TABLE users;

SET FOREIGN_KEY_CHECKS = 1;

INSERT INTO categories (name) VALUES
  ('Textbooks'),
  ('Electronics'),
  ('Furniture'),
  ('Clothing'),
  ('School Supplies'),
  ('Other');

INSERT INTO courses (course_code, course_name) VALUES
  ('CSC648', 'Software Engineering'),
  ('CSC415', 'Operating Systems');

INSERT INTO conditions (name) VALUES
  ('Factory New'),
  ('Like New'),
  ('Used'),
  ('Well Used'),
  ('Broken');

SET @cat_textbooks = (SELECT id FROM categories WHERE name = 'Textbooks' LIMIT 1);
SET @cat_electronics = (SELECT id FROM categories WHERE name = 'Electronics' LIMIT 1);
SET @cat_other = (SELECT id FROM categories WHERE name = 'Other' LIMIT 1);
SET @course_csc648 = (SELECT id FROM courses WHERE course_code = 'CSC648' LIMIT 1);
SET @course_csc415 = (SELECT id FROM courses WHERE course_code = 'CSC415' LIMIT 1);
SET @cond_new = (SELECT id FROM conditions WHERE name = 'Factory New' LIMIT 1);
SET @cond_like_new = (SELECT id FROM conditions WHERE name = 'Like New' LIMIT 1);
SET @cond_used = (SELECT id FROM conditions WHERE name = 'Used' LIMIT 1);
SET @cond_well_used = (SELECT id FROM conditions WHERE name = 'Well Used' LIMIT 1);
SET @cond_broken = (SELECT id FROM conditions WHERE name = 'Broken' LIMIT 1);

INSERT INTO users (
  first_name,
  last_name,
  school_email,
  password_hash,
  is_student_verified,
  account_status,
  is_admin,
  storefront_enabled
)
VALUES
  ('test1', 'user', 'test1@sfsu.edu', SHA2('test1', 256), TRUE, 'active', FALSE, FALSE),
  ('test2', 'user', 'test2@sfsu.edu', SHA2('test2', 256), TRUE, 'active', FALSE, FALSE);

SET @user1_id = (SELECT id FROM users WHERE school_email = 'test1@sfsu.edu' LIMIT 1);
SET @user2_id = (SELECT id FROM users WHERE school_email = 'test2@sfsu.edu' LIMIT 1);

INSERT INTO items (
  seller_id,
  title,
  description,
  price,
  category_id,
  condition_id,
  course_id,
  listing_type,
  pickup_location_id,
  status,
  approval_status,
  is_featured
)
VALUES
  (@user1_id, 'Game Boy Advance', 'Handheld console in good condition.', 65.00, @cat_electronics,@cond_like_new, @course_csc415, 'sale', NULL, 'active', 'approved', FALSE),
  (@user1_id, 'iPhone 11', 'Unlocked iPhone with charger included.', 240.00, @cat_electronics,@cond_used, @course_csc648, 'sale', NULL, 'active', 'approved', FALSE),
  (@user2_id, 'Math Textbook', 'Used calculus textbook with notes.', 30.00, @cat_textbooks,@cond_like_new, @course_csc648, 'sale', NULL, 'active', 'approved', FALSE),
  (@user2_id, 'Monkey Plush Toy', 'Soft toy in excellent condition.', 18.00, @cat_other,@cond_broken, @course_csc415, 'sale', NULL, 'active', 'approved', FALSE);

SET @item_gameboy = (SELECT id FROM items WHERE seller_id = @user1_id AND title = 'Game Boy Advance' LIMIT 1);
SET @item_iphone = (SELECT id FROM items WHERE seller_id = @user1_id AND title = 'iPhone 11' LIMIT 1);
SET @item_textbook = (SELECT id FROM items WHERE seller_id = @user2_id AND title = 'Math Textbook' LIMIT 1);
SET @item_monkey = (SELECT id FROM items WHERE seller_id = @user2_id AND title = 'Monkey Plush Toy' LIMIT 1);

INSERT INTO listing_images (item_id, image_url, sort_order) VALUES
  (@item_gameboy, '/uploads/TESTING/Gameboy.png', 0),
  (@item_iphone, '/uploads/TESTING/iPhone.png', 0),
  (@item_textbook, '/uploads/TESTING/MathTextbook.png', 0),
  (@item_monkey, '/uploads/TESTING/MonkeyToy.png', 0);

INSERT INTO conversations (item_id, buyer_id, seller_id, last_message_at) VALUES
  (@item_gameboy, @user2_id, @user1_id, NOW());

SET @conversation_id = LAST_INSERT_ID();

INSERT INTO messages (conversation_id, sender_id, body, is_read) VALUES
  (@conversation_id, @user2_id, 'Hi test1, is the Game Boy still available?', FALSE),
  (@conversation_id, @user1_id, 'Yes, it is still available.', FALSE),
  (@conversation_id, @user2_id, 'Great, I can pick it up tomorrow.', FALSE);