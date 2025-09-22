-- Script para poblar la BD con 25 productos adicionales distribuidos en las 6 categorías
-- Ejecutar en tu base de datos PostgreSQL

-- Productos para Ropa de Niña (cmf4fz7e5000058yokhtps0w4)
INSERT INTO "Product" (id, name, description, price, "salePrice", stock, images, "onSale", sizes, colors, features, rating, "reviewCount", "categoryId", "createdAt", "updatedAt") VALUES
('prod_nina_001', 'Vestido Floral Primavera', 'Hermoso vestido con estampado floral perfecto para la primavera. Tela suave y cómoda.', 3200, 2400, 15, '["https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=400"]', true, '["2", "4", "6", "8"]', '["Rosa", "Blanco", "Celeste"]', '["100% Algodón", "Lavable en máquina", "Diseño exclusivo"]', 4.7, 23, 'cmf4fz7e5000058yokhtps0w4', NOW(), NOW()),

('prod_nina_002', 'Falda Plisada Escolar', 'Falda plisada ideal para el colegio. Resistente y fácil de lavar.', 2800, NULL, 20, '["https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400"]', false, '["4", "6", "8", "10"]', '["Azul Marino", "Gris", "Negro"]', '["Tela resistente", "Anti-arrugas", "Cintura ajustable"]', 4.5, 18, 'cmf4fz7e5000058yokhtps0w4', NOW(), NOW()),

('prod_nina_003', 'Blusa Bordada Artesanal', 'Blusa con bordados hechos a mano. Perfecta para ocasiones especiales.', 4500, 3600, 8, '["https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400"]', true, '["2", "4", "6"]', '["Blanco", "Crema", "Rosa Pálido"]', '["Bordado artesanal", "100% Algodón", "Diseño único"]', 4.9, 12, 'cmf4fz7e5000058yokhtps0w4', NOW(), NOW()),

('prod_nina_004', 'Conjunto Deportivo Rosa', 'Conjunto deportivo cómodo para actividades físicas y juegos.', 3800, NULL, 25, '["https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=400"]', false, '["4", "6", "8", "10", "12"]', '["Rosa", "Fucsia", "Coral"]', '["Tela transpirable", "Secado rápido", "Elástico"]', 4.4, 31, 'cmf4fz7e5000058yokhtps0w4', NOW(), NOW()),

-- Productos para Ropa de Niño (cmf4fz8ji000458yog5f642d2)
('prod_nino_001', 'Camisa Cuadros Casual', 'Camisa a cuadros perfecta para el día a día. Cómoda y versátil.', 3500, 2800, 18, '["https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400"]', true, '["4", "6", "8", "10"]', '["Azul", "Rojo", "Verde"]', '["100% Algodón", "Botones resistentes", "Corte clásico"]', 4.6, 27, 'cmf4fz8ji000458yog5f642d2', NOW(), NOW()),

('prod_nino_002', 'Pantalón Jean Clásico', 'Jean resistente para niños activos. Diseño clásico y duradero.', 4200, NULL, 22, '["https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400"]', false, '["4", "6", "8", "10", "12"]', '["Azul Oscuro", "Negro", "Gris"]', '["Denim resistente", "5 bolsillos", "Cintura ajustable"]', 4.3, 19, 'cmf4fz8ji000458yog5f642d2', NOW(), NOW()),

('prod_nino_003', 'Polo Deportivo Mesh', 'Polo deportivo con tecnología mesh para mayor ventilación.', 2900, 2200, 30, '["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400"]', true, '["6", "8", "10", "12"]', '["Azul", "Rojo", "Negro", "Blanco"]', '["Tecnología mesh", "Secado rápido", "Anti-bacterial"]', 4.8, 42, 'cmf4fz8ji000458yog5f642d2', NOW(), NOW()),

('prod_nino_004', 'Bermuda Cargo Aventura', 'Bermuda con múltiples bolsillos para pequeños aventureros.', 3600, NULL, 16, '["https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400"]', false, '["6", "8", "10", "12"]', '["Caqui", "Verde Militar", "Gris"]', '["6 bolsillos", "Tela resistente", "Cordón ajustable"]', 4.5, 25, 'cmf4fz8ji000458yog5f642d2', NOW(), NOW()),

-- Productos para Ropa de Bebé (cmf4fz8jc000358yoxgtnc1ff)
('prod_bebe_001', 'Body Manga Larga Pack 3', 'Pack de 3 bodies de manga larga en colores pastel. Súper suaves.', 2400, 1800, 35, '["https://images.unsplash.com/photo-1522771930-78848d9293e8?w=400"]', true, '["0-3M", "3-6M", "6-9M", "9-12M"]', '["Rosa", "Celeste", "Amarillo"]', '["100% Algodón orgánico", "Broches fáciles", "Pack x3"]', 4.9, 67, 'cmf4fz8jc000358yoxgtnc1ff', NOW(), NOW()),

('prod_bebe_002', 'Mameluco Osito Peluche', 'Adorable mameluco con diseño de osito. Perfecto para el invierno.', 3800, NULL, 12, '["https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400"]', false, '["0-3M", "3-6M", "6-9M"]', '["Beige", "Gris", "Blanco"]', '["Forro polar", "Capucha con orejas", "Cierre completo"]', 4.7, 34, 'cmf4fz8jc000358yoxgtnc1ff', NOW(), NOW()),

('prod_bebe_003', 'Conjunto Primer Paseo', 'Conjunto elegante para las primeras salidas del bebé.', 4500, 3600, 8, '["https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400"]', true, '["0-3M", "3-6M"]', '["Blanco", "Crema", "Rosa Suave"]', '["Algodón premium", "Bordados delicados", "Incluye gorro"]', 4.8, 15, 'cmf4fz8jc000358yoxgtnc1ff', NOW(), NOW()),

('prod_bebe_004', 'Pijama Dos Piezas Nubes', 'Pijama de dos piezas con estampado de nubes. Ideal para dormir.', 2800, NULL, 28, '["https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400"]', false, '["6-9M", "9-12M", "12-18M"]', '["Celeste", "Rosa", "Blanco"]', '["Tela suave", "Elástico cómodo", "Estampado tierno"]', 4.6, 29, 'cmf4fz8jc000358yoxgtnc1ff', NOW(), NOW()),

-- Productos para Accesorios (cmf4fz8j0000258yoaqhclf43)
('prod_acc_001', 'Gorro Lana Pompón', 'Gorro tejido en lana con pompón. Perfecto para el frío.', 1800, 1400, 40, '["https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400"]', true, '["S", "M", "L"]', '["Rosa", "Azul", "Gris", "Rojo"]', '["100% Lana", "Tejido artesanal", "Pompón desmontable"]', 4.5, 52, 'cmf4fz8j0000258yoaqhclf43', NOW(), NOW()),

('prod_acc_002', 'Mochila Escolar Unicornio', 'Mochila con diseño de unicornio. Perfecta para el colegio.', 5200, NULL, 15, '["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400"]', false, '["Única"]', '["Rosa", "Morado", "Celeste"]', '["Compartimentos múltiples", "Correas acolchadas", "Resistente al agua"]', 4.7, 38, 'cmf4fz8j0000258yoaqhclf43', NOW(), NOW()),

('prod_acc_003', 'Bufanda Rayas Colores', 'Bufanda tejida con rayas multicolores. Alegre y abrigada.', 2200, 1800, 25, '["https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400"]', true, '["Única"]', '["Multicolor", "Arcoíris", "Pastel"]', '["Lana suave", "Rayas coloridas", "Flecos decorativos"]', 4.4, 21, 'cmf4fz8j0000258yoaqhclf43', NOW(), NOW()),

('prod_acc_004', 'Cinturón Elástico Ajustable', 'Cinturón elástico que crece con el niño. Muy práctico.', 1500, NULL, 50, '["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400"]', false, '["S", "M", "L"]', '["Negro", "Marrón", "Azul Marino"]', '["Elástico ajustable", "Hebilla resistente", "Crece con el niño"]', 4.2, 16, 'cmf4fz8j0000258yoaqhclf43', NOW(), NOW()),

-- Productos para Pijamas (cmf4fz8iu000158yoyq4h7qh2)
('prod_pij_001', 'Pijama Superhéroes', 'Pijama con estampado de superhéroes. Para pequeños valientes.', 3200, 2500, 20, '["https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400"]', true, '["4", "6", "8", "10"]', '["Azul", "Rojo", "Negro"]', '["100% Algodón", "Estampado resistente", "Corte cómodo"]', 4.6, 44, 'cmf4fz8iu000158yoyq4h7qh2', NOW(), NOW()),

('prod_pij_002', 'Camisón Princesas', 'Camisón largo con diseño de princesas. Suave y elegante.', 2800, NULL, 18, '["https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400"]', false, '["4", "6", "8", "10"]', '["Rosa", "Lila", "Celeste"]', '["Tela satinada", "Largo elegante", "Detalles brillantes"]', 4.8, 33, 'cmf4fz8iu000158yoyq4h7qh2', NOW(), NOW()),

('prod_pij_003', 'Pijama Térmica Invierno', 'Pijama térmica para las noches más frías. Extra abrigada.', 4200, 3400, 12, '["https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400"]', true, '["6", "8", "10", "12"]', '["Gris", "Azul Marino", "Burdeos"]', '["Tela térmica", "Forro interior", "Puños ajustados"]', 4.7, 28, 'cmf4fz8iu000158yoyq4h7qh2', NOW(), NOW()),

('prod_pij_004', 'Pijama Animales Selva', 'Pijama con estampado de animales de la selva. Divertida y cómoda.', 3000, NULL, 22, '["https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400"]', false, '["2", "4", "6", "8"]', '["Verde", "Amarillo", "Naranja"]', '["Estampado divertido", "Algodón suave", "Colores vivos"]', 4.5, 37, 'cmf4fz8iu000158yoyq4h7qh2', NOW(), NOW()),

-- Productos para Ropa de Baño (cmf4fz8jm000558yoqebilwt1)
('prod_bano_001', 'Traje de Baño Sirena', 'Traje de baño con cola de sirena desmontable. Mágico y divertido.', 4800, 3800, 10, '["https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400"]', true, '["4", "6", "8", "10"]', '["Turquesa", "Rosa", "Morado"]', '["Cola desmontable", "Protección UV", "Secado rápido"]', 4.9, 26, 'cmf4fz8jm000558yoqebilwt1', NOW(), NOW()),

('prod_bano_002', 'Bermuda Surf Niño', 'Bermuda de surf con cordón ajustable. Para pequeños surfistas.', 3500, NULL, 16, '["https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400"]', false, '["6", "8", "10", "12"]', '["Azul", "Verde", "Naranja", "Rojo"]', '["Secado rápido", "Cordón ajustable", "Bolsillos laterales"]', 4.4, 31, 'cmf4fz8jm000558yoqebilwt1', NOW(), NOW()),

('prod_bano_003', 'Bikini Flores Tropicales', 'Bikini con estampado de flores tropicales. Fresco y colorido.', 3200, 2600, 14, '["https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400"]', true, '["4", "6", "8", "10"]', '["Coral", "Amarillo", "Verde Agua"]', '["Estampado tropical", "Tirantes ajustables", "Protección UV"]', 4.6, 22, 'cmf4fz8jm000558yoqebilwt1', NOW(), NOW()),

('prod_bano_004', 'Conjunto Playa Completo', 'Conjunto completo: traje de baño, pareo y sombrero. Todo incluido.', 5500, NULL, 8, '["https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400"]', false, '["6", "8", "10"]', '["Azul Marino", "Rosa Coral", "Blanco"]', '["Set completo", "Pareo incluido", "Sombrero a juego"]', 4.8, 19, 'cmf4fz8jm000558yoqebilwt1', NOW(), NOW()),

-- Productos adicionales variados
('prod_extra_001', 'Vestido Casual Rayas', 'Vestido casual con rayas horizontales. Perfecto para el día a día.', 2900, 2200, 24, '["https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=400"]', true, '["4", "6", "8", "10"]', '["Azul/Blanco", "Rosa/Blanco", "Negro/Blanco"]', '["Rayas clásicas", "Corte A", "Mangas cortas"]', 4.3, 35, 'cmf4fz7e5000058yokhtps0w4', NOW(), NOW()),

('prod_extra_002', 'Remera Básica Pack 5', 'Pack de 5 remeras básicas en colores lisos. Esenciales del guardarropa.', 3800, NULL, 45, '["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400"]', false, '["4", "6", "8", "10", "12"]', '["Blanco", "Negro", "Gris", "Azul", "Rojo"]', '["Pack x5", "100% Algodón", "Colores básicos"]', 4.5, 89, 'cmf4fz8ji000458yog5f642d2', NOW(), NOW()),

('prod_extra_003', 'Babero Impermeable Set 3', 'Set de 3 baberos impermeables con diseños divertidos.', 1800, 1400, 60, '["https://images.unsplash.com/photo-1522771930-78848d9293e8?w=400"]', true, '["0-6M", "6-12M"]', '["Multicolor", "Animales", "Frutas"]', '["Impermeable", "Fácil limpieza", "Set x3"]', 4.7, 73, 'cmf4fz8jc000358yoxgtnc1ff', NOW(), NOW());

-- Actualizar algunos productos existentes para que tengan ofertas
UPDATE "Product" SET "onSale" = true, "salePrice" = 1800 WHERE name = 'Traje de Baño Niño' AND price = 2100;
UPDATE "Product" SET "onSale" = true, "salePrice" = 2200 WHERE name = 'Pijama de Dinosaurios' AND price = 2800;
UPDATE "Product" SET "onSale" = true, "salePrice" = 3100 WHERE name = 'Zapatillas Deportivas' AND price = 3800;
