exports.up = function(knex) {
    // Aquí va TODO el código SQL que me enviaste
    // Voy a poner el principio para que veas cómo va, pero tú pegas todo tu código:
    return knex.raw(`
        -- ============================================================
-- MrPolasDB
-- Base de datos central - PostgreSQL
-- ============================================================

-- ============================================================
-- 0. EXTENSIONES
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;


-- ============================================================
-- 1. SEGURIDAD Y AUTORIZACIÓN
-- ============================================================

CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL,
    description TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'active',

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ NULL,
    version INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT chk_roles_status
        CHECK (status IN ('active', 'inactive'))
);

CREATE UNIQUE INDEX uq_roles_name_lower
ON roles (LOWER(name));


CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'active',

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ NULL,
    version INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT chk_permissions_status
        CHECK (status IN ('active', 'inactive'))
);

CREATE UNIQUE INDEX uq_permissions_name_lower
ON permissions (LOWER(name));


CREATE TABLE role_permissions (
    role_id UUID NOT NULL REFERENCES roles(id),
    permission_id UUID NOT NULL REFERENCES permissions(id),

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (role_id, permission_id)
);


CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100),
    document_number VARCHAR(20),
    email VARCHAR(150) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,

    role_id UUID NOT NULL REFERENCES roles(id),

    status VARCHAR(20) NOT NULL DEFAULT 'active',

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ NULL,
    version INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT chk_users_status
        CHECK (status IN ('active', 'inactive'))
);

CREATE UNIQUE INDEX uq_users_email_lower
ON users (LOWER(email));

CREATE UNIQUE INDEX uq_users_document
ON users (document_number)
WHERE document_number IS NOT NULL;


-- ============================================================
-- 2. CATÁLOGOS
-- ============================================================

CREATE TABLE supply_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name VARCHAR(100) NOT NULL,
    description TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'active',

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ NULL,
    version INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT chk_supply_categories_status
        CHECK (status IN ('active', 'inactive'))
);

CREATE UNIQUE INDEX uq_supply_categories_name_lower
ON supply_categories (LOWER(name));


CREATE TABLE product_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name VARCHAR(100) NOT NULL,
    description TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'active',

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ NULL,
    version INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT chk_product_categories_status
        CHECK (status IN ('active', 'inactive'))
);

CREATE UNIQUE INDEX uq_product_categories_name_lower
ON product_categories (LOWER(name));


CREATE TABLE units_of_measure (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name VARCHAR(50) NOT NULL,
    abbreviation VARCHAR(10) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active',

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    version INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT chk_units_status
        CHECK (status IN ('active', 'inactive'))
);

CREATE UNIQUE INDEX uq_units_name_lower
ON units_of_measure (LOWER(name));

CREATE UNIQUE INDEX uq_units_abbreviation_lower
ON units_of_measure (LOWER(abbreviation));


CREATE TABLE movement_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name VARCHAR(50) NOT NULL,
    description TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'active',

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    version INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT chk_movement_types_status
        CHECK (status IN ('active', 'inactive'))
);

CREATE UNIQUE INDEX uq_movement_types_name_lower
ON movement_types (LOWER(name));


CREATE TABLE payment_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name VARCHAR(50) NOT NULL,
    description TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'active',

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    version INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT chk_payment_methods_status
        CHECK (status IN ('active', 'inactive'))
);

CREATE UNIQUE INDEX uq_payment_methods_name_lower
ON payment_methods (LOWER(name));


-- ============================================================
-- 3. PROVEEDORES
-- ============================================================

CREATE TABLE suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name VARCHAR(150) NOT NULL,
    tax_id VARCHAR(20),

    contact_name VARCHAR(100),
    contact_phone VARCHAR(20),
    address VARCHAR(200),

    status VARCHAR(20) NOT NULL DEFAULT 'active',

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ NULL,
    version INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT chk_suppliers_status
        CHECK (status IN ('active', 'inactive'))
);

CREATE UNIQUE INDEX uq_suppliers_name_lower
ON suppliers (LOWER(name));

CREATE UNIQUE INDEX uq_suppliers_tax_id
ON suppliers (tax_id)
WHERE tax_id IS NOT NULL;


-- Relación proveedor <-> insumo
CREATE TABLE supplier_supplies (
    supplier_id UUID NOT NULL REFERENCES suppliers(id),
    supply_id UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (supplier_id, supply_id)
);


-- ============================================================
-- 4. INSUMOS
-- ============================================================

CREATE TABLE supplies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    supply_category_id UUID NOT NULL
        REFERENCES supply_categories(id),

    unit_id UUID NOT NULL
        REFERENCES units_of_measure(id),

    name VARCHAR(150) NOT NULL,

    minimum_stock NUMERIC(12,3) NOT NULL DEFAULT 0,

    status VARCHAR(20) NOT NULL DEFAULT 'active',

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ NULL,
    version INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT chk_supplies_minimum_stock
        CHECK (minimum_stock >= 0),

    CONSTRAINT chk_supplies_status
        CHECK (status IN ('active', 'inactive'))
);

CREATE UNIQUE INDEX uq_supplies_name_lower
ON supplies (LOWER(name));


ALTER TABLE supplier_supplies
ADD CONSTRAINT fk_supplier_supplies_supply
FOREIGN KEY (supply_id)
REFERENCES supplies(id);


-- ============================================================
-- 5. PRODUCTOS TERMINADOS
-- ============================================================

CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    product_category_id UUID NOT NULL
        REFERENCES product_categories(id),

    name VARCHAR(150) NOT NULL,

    sale_price NUMERIC(12,2) NOT NULL DEFAULT 0,

    status VARCHAR(20) NOT NULL DEFAULT 'active',

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ NULL,
    version INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT chk_products_sale_price
        CHECK (sale_price >= 0),

    CONSTRAINT chk_products_status
        CHECK (status IN ('active', 'inactive'))
);

CREATE UNIQUE INDEX uq_products_name_lower
ON products (LOWER(name));


-- ============================================================
-- 6. RECETAS
-- ============================================================

CREATE TABLE recipes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    product_id UUID NOT NULL UNIQUE
        REFERENCES products(id),

    quantity_produced NUMERIC(12,3) NOT NULL DEFAULT 1,

    status VARCHAR(20) NOT NULL DEFAULT 'active',

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ NULL,
    version INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT chk_recipes_quantity_produced
        CHECK (quantity_produced > 0),

    CONSTRAINT chk_recipes_status
        CHECK (status IN ('active', 'inactive'))
);


CREATE TABLE recipe_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    recipe_id UUID NOT NULL
        REFERENCES recipes(id),

    supply_id UUID NOT NULL
        REFERENCES supplies(id),

    quantity_required NUMERIC(12,3) NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_recipe_details_quantity
        CHECK (quantity_required > 0),

    CONSTRAINT uq_recipe_supply
        UNIQUE (recipe_id, supply_id)
);


-- ============================================================
-- 7. COMPRAS
-- ============================================================

CREATE TABLE purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL
        REFERENCES users(id),

    supplier_id UUID NOT NULL
        REFERENCES suppliers(id),

    purchase_number VARCHAR(50) NOT NULL,

    purchase_date TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
    tax NUMERIC(12,2) NOT NULL DEFAULT 0,
    total NUMERIC(12,2) NOT NULL DEFAULT 0,

    status VARCHAR(20) NOT NULL DEFAULT 'effective',

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ NULL,
    version INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT chk_purchases_subtotal
        CHECK (subtotal >= 0),

    CONSTRAINT chk_purchases_tax
        CHECK (tax >= 0),

    CONSTRAINT chk_purchases_total
        CHECK (total >= 0),

    CONSTRAINT chk_purchases_status
        CHECK (status IN ('effective', 'cancelled'))
);

-- El mismo número de factura puede existir para proveedores diferentes.
CREATE UNIQUE INDEX uq_purchase_supplier_number
ON purchases (supplier_id, purchase_number);


CREATE TABLE purchase_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    purchase_id UUID NOT NULL
        REFERENCES purchases(id),

    supply_id UUID NOT NULL
        REFERENCES supplies(id),

    quantity NUMERIC(12,3) NOT NULL,

    unit_cost NUMERIC(12,2) NOT NULL,

    subtotal NUMERIC(12,2) NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_purchase_details_quantity
        CHECK (quantity > 0),

    CONSTRAINT chk_purchase_details_unit_cost
        CHECK (unit_cost >= 0),

    CONSTRAINT chk_purchase_details_subtotal
        CHECK (subtotal >= 0)
);


-- ============================================================
-- 8. VENTAS
-- ============================================================

CREATE TABLE sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL
        REFERENCES users(id),

    sale_date TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
    tax NUMERIC(12,2) NOT NULL DEFAULT 0,
    total NUMERIC(12,2) NOT NULL DEFAULT 0,

    status VARCHAR(20) NOT NULL DEFAULT 'completed',

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ NULL,
    version INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT chk_sales_subtotal
        CHECK (subtotal >= 0),

    CONSTRAINT chk_sales_tax
        CHECK (tax >= 0),

    CONSTRAINT chk_sales_total
        CHECK (total >= 0),

    CONSTRAINT chk_sales_status
        CHECK (status IN ('completed', 'cancelled'))
);


CREATE TABLE sale_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    sale_id UUID NOT NULL
        REFERENCES sales(id),

    product_id UUID NOT NULL
        REFERENCES products(id),

    quantity NUMERIC(12,3) NOT NULL,

    unit_price NUMERIC(12,2) NOT NULL,

    subtotal NUMERIC(12,2) NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_sale_details_quantity
        CHECK (quantity > 0),

    CONSTRAINT chk_sale_details_unit_price
        CHECK (unit_price >= 0),

    CONSTRAINT chk_sale_details_subtotal
        CHECK (subtotal >= 0)
);


-- ============================================================
-- 9. PAGOS DE LAS VENTAS
-- ============================================================

CREATE TABLE sale_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    sale_id UUID NOT NULL
        REFERENCES sales(id),

    payment_method_id UUID NOT NULL
        REFERENCES payment_methods(id),

    amount NUMERIC(12,2) NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_sale_payments_amount
        CHECK (amount > 0)
);


-- ============================================================
-- 10. INVENTARIO ACTUAL
-- ============================================================

CREATE TABLE current_stock (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    supply_id UUID NOT NULL UNIQUE
        REFERENCES supplies(id),

    current_quantity NUMERIC(12,3) NOT NULL DEFAULT 0,

    last_movement_id UUID NULL,

    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_current_stock_quantity
        CHECK (current_quantity >= 0)
);


-- ============================================================
-- 11. MOVIMIENTOS DE INVENTARIO
-- ============================================================

CREATE TABLE inventory_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    supply_id UUID NOT NULL
        REFERENCES supplies(id),

    movement_type_id UUID NOT NULL
        REFERENCES movement_types(id),

    purchase_detail_id UUID NULL
        REFERENCES purchase_details(id),

    sale_detail_id UUID NULL
        REFERENCES sale_details(id),

    quantity NUMERIC(12,3) NOT NULL,

    notes TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_inventory_movement_quantity
        CHECK (quantity <> 0),

    /*
       Un movimiento puede ser:

       1. Compra:
          purchase_detail_id NOT NULL
          sale_detail_id NULL

       2. Venta:
          purchase_detail_id NULL
          sale_detail_id NOT NULL

       3. Ajuste:
          ambos NULL

       No permitimos que ambos estén llenos.
    */
    CONSTRAINT chk_inventory_movement_reference
        CHECK (
            NOT (
                purchase_detail_id IS NOT NULL
                AND sale_detail_id IS NOT NULL
            )
        )
);


ALTER TABLE current_stock
ADD CONSTRAINT fk_current_stock_last_movement
FOREIGN KEY (last_movement_id)
REFERENCES inventory_movements(id);


-- ============================================================
-- 12. ÍNDICES PARA RELACIONES Y CONSULTAS FRECUENTES
-- ============================================================

CREATE INDEX idx_users_role
ON users(role_id);

CREATE INDEX idx_supplier_supplies_supply
ON supplier_supplies(supply_id);

CREATE INDEX idx_supplies_category
ON supplies(supply_category_id);

CREATE INDEX idx_supplies_unit
ON supplies(unit_id);

CREATE INDEX idx_products_category
ON products(product_category_id);

CREATE INDEX idx_recipe_details_recipe
ON recipe_details(recipe_id);

CREATE INDEX idx_recipe_details_supply
ON recipe_details(supply_id);

CREATE INDEX idx_purchases_supplier
ON purchases(supplier_id);

CREATE INDEX idx_purchases_user
ON purchases(user_id);

CREATE INDEX idx_purchase_details_purchase
ON purchase_details(purchase_id);

CREATE INDEX idx_purchase_details_supply
ON purchase_details(supply_id);

CREATE INDEX idx_sales_user
ON sales(user_id);

CREATE INDEX idx_sale_details_sale
ON sale_details(sale_id);

CREATE INDEX idx_sale_details_product
ON sale_details(product_id);

CREATE INDEX idx_sale_payments_sale
ON sale_payments(sale_id);

CREATE INDEX idx_inventory_movements_supply
ON inventory_movements(supply_id);

CREATE INDEX idx_inventory_movements_purchase_detail
ON inventory_movements(purchase_detail_id);

CREATE INDEX idx_inventory_movements_sale_detail
ON inventory_movements(sale_detail_id);

CREATE INDEX idx_inventory_movements_created_at
ON inventory_movements(created_at);


-- ============================================================
-- 13. DATOS INICIALES DE CATÁLOGOS
-- ============================================================

INSERT INTO movement_types (name, description)
VALUES
    ('PURCHASE', 'Entrada de inventario por compra'),
    ('SALE', 'Salida de inventario por venta'),
    ('REVERSAL', 'Reversión de un movimiento anterior'),
    ('ADJUSTMENT', 'Ajuste manual de inventario');


INSERT INTO payment_methods (name, description)
VALUES
    ('CASH', 'Pago en efectivo'),
    ('CARD', 'Pago con tarjeta'),
    ('TRANSFER', 'Pago mediante transferencia');


-- ============================================================
-- FIN DE MrPolasDB
-- ============================================================
    `);
};

exports.down = function(knex) {
    // Esta parte sirve para deshacer todo si algo sale mal
    return knex.raw(`
        DROP TABLE IF EXISTS sale_payments CASCADE;
        DROP TABLE IF EXISTS inventory_movements CASCADE;
        DROP TABLE IF EXISTS current_stock CASCADE;
        DROP TABLE IF EXISTS sale_details CASCADE;
        DROP TABLE IF EXISTS sales CASCADE;
        DROP TABLE IF EXISTS purchase_details CASCADE;
        DROP TABLE IF EXISTS purchases CASCADE;
        DROP TABLE IF EXISTS recipe_details CASCADE;
        DROP TABLE IF EXISTS recipes CASCADE;
        DROP TABLE IF EXISTS products CASCADE;
        DROP TABLE IF EXISTS supplier_supplies CASCADE;
        DROP TABLE IF EXISTS supplies CASCADE;
        DROP TABLE IF EXISTS suppliers CASCADE;
        DROP TABLE IF EXISTS payment_methods CASCADE;
        DROP TABLE IF EXISTS movement_types CASCADE;
        DROP TABLE IF EXISTS units_of_measure CASCADE;
        DROP TABLE IF EXISTS product_categories CASCADE;
        DROP TABLE IF EXISTS supply_categories CASCADE;
        DROP TABLE IF EXISTS users CASCADE;
        DROP TABLE IF EXISTS role_permissions CASCADE;
        DROP TABLE IF EXISTS permissions CASCADE;
        DROP TABLE IF EXISTS roles CASCADE;
    `);
};