USE app_db;

INSERT INTO users (
  first_name,
  last_name,
  school_email,
  password_hash,
  profile_image_url,
  is_student_verified,
  account_status,
  is_admin,
  storefront_enabled,
  storefront_name,
  storefront_description,
  storefront_banner_url,
  storefront_logo_url
)
VALUES (
  'Test',
  'SellerOne',
  'seller1@sfsu.edu',
  '$2b$10$y7L9uU8D0fNnY9HjV8YwruS9hQx4Qy8xjQXxqj8Qx0kY1d6d5Cj2a',
  NULL,
  TRUE,
  'active',
  FALSE,
  TRUE,
  'Seller One Store',
  'Sample storefront for test seller one.',
  NULL,
  NULL
)
ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id);

SET @user1_id = LAST_INSERT_ID();

INSERT INTO users (
  first_name,
  last_name,
  school_email,
  password_hash,
  profile_image_url,
  is_student_verified,
  account_status,
  is_admin,
  storefront_enabled,
  storefront_name,
  storefront_description,
  storefront_banner_url,
  storefront_logo_url
)
VALUES (
  'Test',
  'SellerTwo',
  'seller2@sfsu.edu',
  '$2b$10$y7L9uU8D0fNnY9HjV8YwruS9hQx4Qy8xjQXxqj8Qx0kY1d6d5Cj2a',
  NULL,
  TRUE,
  'active',
  FALSE,
  TRUE,
  'Seller Two Store',
  'Sample storefront for test seller two.',
  NULL,
  NULL
)
ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id);

SET @user2_id = LAST_INSERT_ID();

INSERT INTO items (
  seller_id,
  title,
  description,
  price,
  category_id,
  listing_type,
  pickup_location_id,
  status,
  is_featured
)
SELECT
  @user1_id,
  CONCAT('Sample Item A-', n),
  CONCAT('Sample listing ', n, ' from test seller one'),
  ROUND(10 + (n * 1.25), 2),
  NULL,
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
    (SELECT 0 AS n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4
     UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) ones
  CROSS JOIN
    (SELECT 0 AS n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4) tens
  WHERE (ones.n + tens.n * 10 + 1) <= 50
) seq
WHERE NOT EXISTS (
  SELECT 1
  FROM items i
  WHERE i.seller_id = @user1_id
    AND i.title = CONCAT('Sample Item A-', n)
);

INSERT INTO items (
  seller_id,
  title,
  description,
  price,
  category_id,
  listing_type,
  pickup_location_id,
  status,
  is_featured
)
SELECT
  @user2_id,
  CONCAT('Sample Item B-', n),
  CONCAT('Sample listing ', n, ' from test seller two'),
  ROUND(12 + (n * 1.35), 2),
  NULL,
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
    (SELECT 0 AS n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4
     UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) ones
  CROSS JOIN
    (SELECT 0 AS n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4) tens
  WHERE (ones.n + tens.n * 10 + 1) <= 50
) seq
WHERE NOT EXISTS (
  SELECT 1
  FROM items i
  WHERE i.seller_id = @user2_id
    AND i.title = CONCAT('Sample Item B-', n)
);
