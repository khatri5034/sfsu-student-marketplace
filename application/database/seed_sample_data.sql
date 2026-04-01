USE app_db;

-- Insert Sample Categories 

INSERT INTO categories (name) VALUES
    ('Textbooks'),
    ('Electronics'),
    ('Furniture'),
    ('Clothing'),
    ('School Supplies'),
    ('Other')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- Insert Sample Courses
INSERT INTO courses (course_code, course_name) VALUES
    ('CSC648', 'Software Engineering'),
    ('CSC415', 'Operating Systems'),
    ('MATH324', 'Probability and Statistics'),
    ('CHEM215', 'General Chemistry'),
    ('PHYS220', 'General Physics')
ON DUPLICATE KEY UPDATE course_name = VALUES(course_name);

-- Store course IDs for reuse
SET @course1 = (SELECT id FROM courses WHERE course_code = 'CSC648');
SET @course2 = (SELECT id FROM courses WHERE course_code = 'CSC415');
SET @course3 = (SELECT id FROM courses WHERE course_code = 'MATH324');
SET @course4 = (SELECT id FROM courses WHERE course_code = 'CHEM215');
SET @course5 = (SELECT id FROM courses WHERE course_code = 'PHYS220');

-- Insert Sample Users
INSERT INTO users (
  first_name,
  last_name,
  school_email,
  password_hash,
  is_student_verified,
  account_status,
  is_admin,
  storefront_enabled,
  storefront_name,
  storefront_description
)
VALUES (
  'Test',
  'SellerOne',
  'seller1@sfsu.edu',
  '$2b$10$y7L9uU8D0fNnY9HjV8YwruS9hQx4Qy8xjQXxqj8Qx0kY1d6d5Cj2a',
  TRUE,
  'active',
  FALSE,
  TRUE,
  'Seller One Store',
  'Sample storefront for Seller One.'
)
ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id);

SET @user1_id = LAST_INSERT_ID();

INSERT INTO users (
  first_name,
  last_name,
  school_email,
  password_hash,
  is_student_verified,
  account_status,
  is_admin,
  storefront_enabled,
  storefront_name,
  storefront_description
)
VALUES (
  'Test',
  'SellerTwo',
  'seller2@sfsu.edu',
  '$2b$10$y7L9uU8D0fNnY9HjV8YwruS9hQx4Qy8xjQXxqj8Qx0kY1d6d5Cj2a',
  TRUE,
  'active',
  FALSE,
  TRUE,
  'Seller Two Store',
  'Sample storefront for Seller Two.'
)
ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id);

SET @user2_id = LAST_INSERT_ID();

-- Insert 50 Sample Items for Seller One
INSERT INTO items (
  seller_id,
  title,
  description,
  price,
  category_id,
  course_id,
  listing_type,
  pickup_location_id,
  status,
  is_featured
)
SELECT
  @user1_id,
  CONCAT('Sample Item A-', n),
  CONCAT('Sample listing ', n, ' from Seller One'),
  ROUND(10 + (n * 1.25), 2),
  (SELECT id FROM categories ORDER BY id LIMIT 1),
  CASE
    WHEN n % 5 = 0 THEN @course1
    WHEN n % 5 = 1 THEN @course2
    WHEN n % 5 = 2 THEN @course3
    WHEN n % 5 = 3 THEN @course4
    ELSE @course5
  END,
  CASE
    WHEN n % 3 = 0 THEN 'trade'
    WHEN n % 3 = 1 THEN 'sale'
    ELSE 'sale_or_trade'
  END,
  NULL,
  'active',
  (n % 10 = 0)
FROM (
  SELECT (ones.n + tens.n * 10 + 1) AS n
  FROM
    (SELECT 0 n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4
     UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) ones
  CROSS JOIN
    (SELECT 0 n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4) tens
  WHERE (ones.n + tens.n * 10 + 1) <= 50
) seq
WHERE NOT EXISTS (
  SELECT 1
  FROM items i
  WHERE i.seller_id = @user1_id
    AND i.title = CONCAT('Sample Item A-', n)
);

-- Insert 50 Sample Items for Seller Two
INSERT INTO items (
  seller_id,
  title,
  description,
  price,
  category_id,
  course_id,
  listing_type,
  pickup_location_id,
  status,
  is_featured
)
SELECT
  @user2_id,
  CONCAT('Sample Item B-', n),
  CONCAT('Sample listing ', n, ' from Seller Two'),
  ROUND(12 + (n * 1.35), 2),
  (SELECT id FROM categories ORDER BY id DESC LIMIT 1),
  CASE
    WHEN n % 5 = 0 THEN @course1
    WHEN n % 5 = 1 THEN @course2
    WHEN n % 5 = 2 THEN @course3
    WHEN n % 5 = 3 THEN @course4
    ELSE @course5
  END,
  CASE
    WHEN n % 3 = 0 THEN 'trade'
    WHEN n % 3 = 1 THEN 'sale'
    ELSE 'sale_or_trade'
  END,
  NULL,
  'active',
  (n % 12 = 0)
FROM (
  SELECT (ones.n + tens.n * 10 + 1) AS n
  FROM
    (SELECT 0 n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4
     UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) ones
  CROSS JOIN
    (SELECT 0 n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4) tens
  WHERE (ones.n + tens.n * 10 + 1) <= 50
) seq
WHERE NOT EXISTS (
  SELECT 1
  FROM items i
  WHERE i.seller_id = @user2_id
    AND i.title = CONCAT('Sample Item B-', n)
);