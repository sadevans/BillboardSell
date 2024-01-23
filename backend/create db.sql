-- DB & tables
\! chcp 1251

CREATE DATABASE homework;

\c homework

CREATE TABLE orders (
    id UUID PRIMARY KEY, 
    name VARCHAR(200) NOT NULL, 
    datetime TIMESTAMP NOT NULL, 
    positions UUID[] DEFAULT '{}'
);

CREATE TABLE products (
    id UUID PRIMARY KEY, 
    name VARCHAR(100) NOT NULL, 
    count INTEGER NOT NULL
);

CREATE TABLE positions (
    id UUID PRIMARY KEY,
    count INTEGER NOT NULL, 
    order_id UUID REFERENCES orders, 
    product_id UUID REFERENCES products
);

-- User (actions: select, insert, update, delete)

CREATE ROLE backend_user LOGIN ENCRYPTED PASSWORD 'admin';
GRANT SELECT, INSERT, UPDATE, DELETE ON orders, products, positions TO backend_user;

-- Filling table products

DELETE FROM products; 
INSERT INTO products (id, name, count) VALUES (gen_random_uuid (), 'яблоко', floor(random() * 100 + 10)::int);
INSERT INTO products (id, name, count) VALUES (gen_random_uuid (), 'банан', floor(random() * 100 + 10)::int);
INSERT INTO products (id, name, count) VALUES (gen_random_uuid (), 'ананас', floor(random() * 100 + 10)::int);
INSERT INTO products (id, name, count) VALUES (gen_random_uuid (), 'груша', floor(random() * 100 + 10)::int);
INSERT INTO products (id, name, count) VALUES (gen_random_uuid (), 'апельсин', floor(random() * 100 + 10)::int);
INSERT INTO products (id, name, count) VALUES (gen_random_uuid (), 'арбуз', floor(random() * 100 + 10)::int);
INSERT INTO products (id, name, count) VALUES (gen_random_uuid (), 'киви', floor(random() * 100 + 10)::int);
INSERT INTO products (id, name, count) VALUES (gen_random_uuid (), 'виноград', floor(random() * 100 + 10)::int);
INSERT INTO products (id, name, count) VALUES (gen_random_uuid (), 'манго', floor(random() * 100 + 10)::int);
INSERT INTO products (id, name, count) VALUES (gen_random_uuid (), 'мандарин', floor(random() * 100 + 10)::int);

-- SQL Queries
-- Вывод всех заказов
SELECT * FROM orders ORDER BY datetime;

-- Вывод всех позиций с сортировкой по заказам
SELECT positions.id, products.name, positions.count, order_id, product_id FROM positions LEFT JOIN products ON positions.product_id = products.id;

-- Вывод всех товаров
SELECT * FROM products ORDER BY name;

-- Добавление нового заказа
INSERT INTO orders (id, name, datetime) VALUES (<order_id>, <name>, to_timestamp(<timestamp> / 1000.0));

-- INSERT INTO orders (id, name, datetime) VALUES (gen_random_uuid (), 'КОГУТ ИГОРЬ ВЛАДИМИРОВИЧ', to_timestamp(1705586080736 / 1000.0));

-- Добавление новой позиции
INSERT INTO positions (id, count, order_id, product_id) VALUES (<position_id>, <count>, <order_id>, <product_id>);
UPDATE orders SET positions = array_append(positions, <position_id>) where id = <order_id>;

-- INSERT INTO positions (id count, order_id, product_id) VALUES (gen_random_uuid (), 10, '0d0716b5-4431-4b5f-96b3-7683b9facccf', 'b5607382-7f19-42b1-ae8f-bfcf27413aa0');
-- INSERT INTO positions (id, count, order_id, product_id) VALUES (gen_random_uuid (), 10, '0d0716b5-4431-4b5f-96b3-7683b9facccf', '5883807e-fbb5-4368-9d49-218d7fe65494');
-- INSERT INTO positions (id, count, order_id, product_id) VALUES (gen_random_uuid (), 10, '0d0716b5-4431-4b5f-96b3-7683b9facccf', 'e13a1297-cdac-49b2-8f27-dd6b5a239670');
-- UPDATE orders SET positions = array_append(positions, '0bc743bf-4ce9-4027-8bef-b741d5321574') where id = '0d0716b5-4431-4b5f-96b3-7683b9facccf';
-- UPDATE orders SET positions = array_append(positions, '155a2005-ac8f-4ba5-b0f6-a64a9cd76fef') where id = '0d0716b5-4431-4b5f-96b3-7683b9facccf';
-- UPDATE orders SET positions = array_append(positions, 'ef3102aa-f60e-4619-9981-5cfe4f15ae07') where id = '0d0716b5-4431-4b5f-96b3-7683b9facccf';

-- Удаление заказа
DELETE FROM positions WHERE order_id = <order_id>;
DELETE FROM orders WHERE id = <order_id>;

-- Удаление позиции
SELECT order_id FROM positions WHERE id = <position_id>;
DELETE FROM positions WHERE id = <position_id>;
UPDATE orders SET positions = array_remove(positions, <position_id>) WHERE id = <order_id>;

-- Обновление заказа
UPDATE orders SET name = <name>, datetime =  <timestamp> WHERE id = <order_id>;

-- Перенос позиции из одного заказа в другой
UPDATE positions SET order_id = <dest_order_id> WHERE id = <position_id>;
UPDATE orders SET positions = array_append(positions, <position_id>) WHERE id = <dest_order_id>;
UPDATE orders SET positions = array_remove(positions, <position_id>) WHERE id = <src_order_id>;

-- 
SELECT positions.id, products.name, positions.count, order_id, product_id FROM positions LEFT JOIN products ON positions.products_id = products.id;
SELECT * FROM positions LEFT JOIN products ON positions.product_id = products.id;