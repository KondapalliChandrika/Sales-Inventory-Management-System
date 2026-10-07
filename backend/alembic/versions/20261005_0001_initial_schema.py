from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = '0001'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table('categories',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(length=100), nullable=False),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('name')
    )
    op.create_table('users',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(length=100), nullable=False),
    sa.Column('email', sa.String(length=255), nullable=False),
    sa.Column('password_hash', sa.String(length=255), nullable=False),
    sa.Column('role', sa.Enum('ADMIN', 'MANAGER', 'SALES', name='user_role'), nullable=False),
    sa.Column('is_active', sa.Boolean(), nullable=False),
    sa.Column('created_at', sa.DateTime(), nullable=False),
    sa.Column('updated_at', sa.DateTime(), nullable=False),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)
    op.create_table('customers',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(length=150), nullable=False),
    sa.Column('email', sa.String(length=255), nullable=True),
    sa.Column('phone', sa.String(length=20), nullable=True),
    sa.Column('address', sa.Text(), nullable=True),
    sa.Column('gstin', sa.String(length=15), nullable=True),
    sa.Column('is_active', sa.Boolean(), nullable=False),
    sa.Column('created_by', sa.Integer(), nullable=False),
    sa.Column('created_at', sa.DateTime(), nullable=False),
    sa.Column('updated_at', sa.DateTime(), nullable=False),
    sa.ForeignKeyConstraint(['created_by'], ['users.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_customers_name'), 'customers', ['name'], unique=False)
    op.create_table('products',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('sku', sa.String(length=50), nullable=False),
    sa.Column('name', sa.String(length=150), nullable=False),
    sa.Column('category_id', sa.Integer(), nullable=True),
    sa.Column('description', sa.Text(), nullable=True),
    sa.Column('unit_price', sa.Numeric(precision=12, scale=2), nullable=False),
    sa.Column('stock_on_hand', sa.Integer(), nullable=False),
    sa.Column('reserved_qty', sa.Integer(), nullable=False),
    sa.Column('reorder_level', sa.Integer(), nullable=False),
    sa.Column('is_active', sa.Boolean(), nullable=False),
    sa.Column('created_at', sa.DateTime(), nullable=False),
    sa.Column('updated_at', sa.DateTime(), nullable=False),
    sa.CheckConstraint('reserved_qty <= stock_on_hand', name='ck_products_reserved_le_stock'),
    sa.CheckConstraint('reserved_qty >= 0', name='ck_products_reserved_non_negative'),
    sa.CheckConstraint('stock_on_hand >= 0', name='ck_products_stock_non_negative'),
    sa.CheckConstraint('unit_price > 0', name='ck_products_price_positive'),
    sa.ForeignKeyConstraint(['category_id'], ['categories.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_products_name'), 'products', ['name'], unique=False)
    op.create_index(op.f('ix_products_sku'), 'products', ['sku'], unique=True)
    op.create_table('settings',
    sa.Column('key', sa.String(length=100), nullable=False),
    sa.Column('value', sa.String(length=255), nullable=False),
    sa.Column('updated_by', sa.Integer(), nullable=True),
    sa.Column('updated_at', sa.DateTime(), nullable=False),
    sa.ForeignKeyConstraint(['updated_by'], ['users.id'], ),
    sa.PrimaryKeyConstraint('key')
    )
    op.create_table('inventory_movements',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('product_id', sa.Integer(), nullable=False),
    sa.Column('type', sa.Enum('IN', 'OUT', 'ADJUSTMENT', 'RESERVE', 'RELEASE', name='movement_type'), nullable=False),
    sa.Column('quantity', sa.Integer(), nullable=False),
    sa.Column('stock_after', sa.Integer(), nullable=False),
    sa.Column('reserved_after', sa.Integer(), nullable=False),
    sa.Column('reference_type', sa.String(length=30), nullable=True),
    sa.Column('reference_id', sa.Integer(), nullable=True),
    sa.Column('note', sa.String(length=255), nullable=True),
    sa.Column('created_by', sa.Integer(), nullable=False),
    sa.Column('created_at', sa.DateTime(), nullable=False),
    sa.ForeignKeyConstraint(['created_by'], ['users.id'], ),
    sa.ForeignKeyConstraint(['product_id'], ['products.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_inventory_movements_product_created', 'inventory_movements', ['product_id', 'created_at'], unique=False)
    op.create_table('sales_orders',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('order_number', sa.String(length=30), nullable=True),
    sa.Column('customer_id', sa.Integer(), nullable=False),
    sa.Column('created_by', sa.Integer(), nullable=False),
    sa.Column('status', sa.Enum('PENDING_APPROVAL', 'COMPLETED', 'REJECTED', 'CANCELLED', name='order_status'), nullable=False),
    sa.Column('subtotal', sa.Numeric(precision=12, scale=2), nullable=False),
    sa.Column('tax_rate', sa.Numeric(precision=5, scale=2), nullable=False),
    sa.Column('tax', sa.Numeric(precision=12, scale=2), nullable=False),
    sa.Column('total', sa.Numeric(precision=12, scale=2), nullable=False),
    sa.Column('requires_approval', sa.Boolean(), nullable=False),
    sa.Column('notes', sa.Text(), nullable=True),
    sa.Column('completed_at', sa.DateTime(), nullable=True),
    sa.Column('created_at', sa.DateTime(), nullable=False),
    sa.Column('updated_at', sa.DateTime(), nullable=False),
    sa.ForeignKeyConstraint(['created_by'], ['users.id'], ),
    sa.ForeignKeyConstraint(['customer_id'], ['customers.id'], ),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('order_number')
    )
    op.create_index(op.f('ix_sales_orders_completed_at'), 'sales_orders', ['completed_at'], unique=False)
    op.create_index(op.f('ix_sales_orders_created_by'), 'sales_orders', ['created_by'], unique=False)
    op.create_index(op.f('ix_sales_orders_customer_id'), 'sales_orders', ['customer_id'], unique=False)
    op.create_index('ix_sales_orders_status_created', 'sales_orders', ['status', 'created_at'], unique=False)
    op.create_table('email_logs',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('to_email', sa.String(length=255), nullable=False),
    sa.Column('subject', sa.String(length=255), nullable=False),
    sa.Column('template', sa.String(length=100), nullable=False),
    sa.Column('status', sa.Enum('SENT', 'FAILED', 'SKIPPED', name='email_status'), nullable=False),
    sa.Column('error', sa.Text(), nullable=True),
    sa.Column('related_order_id', sa.Integer(), nullable=True),
    sa.Column('created_at', sa.DateTime(), nullable=False),
    sa.ForeignKeyConstraint(['related_order_id'], ['sales_orders.id'], ondelete='SET NULL'),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('order_approvals',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('order_id', sa.Integer(), nullable=False),
    sa.Column('action', sa.Enum('REQUESTED', 'APPROVED', 'REJECTED', 'CANCELLED', name='approval_action'), nullable=False),
    sa.Column('acted_by', sa.Integer(), nullable=False),
    sa.Column('comment', sa.Text(), nullable=True),
    sa.Column('created_at', sa.DateTime(), nullable=False),
    sa.ForeignKeyConstraint(['acted_by'], ['users.id'], ),
    sa.ForeignKeyConstraint(['order_id'], ['sales_orders.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_order_approvals_order_id'), 'order_approvals', ['order_id'], unique=False)
    op.create_table('sales_order_items',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('order_id', sa.Integer(), nullable=False),
    sa.Column('product_id', sa.Integer(), nullable=False),
    sa.Column('quantity', sa.Integer(), nullable=False),
    sa.Column('unit_price', sa.Numeric(precision=12, scale=2), nullable=False),
    sa.Column('line_total', sa.Numeric(precision=12, scale=2), nullable=False),
    sa.ForeignKeyConstraint(['order_id'], ['sales_orders.id'], ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['product_id'], ['products.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_sales_order_items_order_id'), 'sales_order_items', ['order_id'], unique=False)
    op.create_index(op.f('ix_sales_order_items_product_id'), 'sales_order_items', ['product_id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_sales_order_items_product_id'), table_name='sales_order_items')
    op.drop_index(op.f('ix_sales_order_items_order_id'), table_name='sales_order_items')
    op.drop_table('sales_order_items')
    op.drop_index(op.f('ix_order_approvals_order_id'), table_name='order_approvals')
    op.drop_table('order_approvals')
    op.drop_table('email_logs')
    op.drop_index('ix_sales_orders_status_created', table_name='sales_orders')
    op.drop_index(op.f('ix_sales_orders_customer_id'), table_name='sales_orders')
    op.drop_index(op.f('ix_sales_orders_created_by'), table_name='sales_orders')
    op.drop_index(op.f('ix_sales_orders_completed_at'), table_name='sales_orders')
    op.drop_table('sales_orders')
    op.drop_index('ix_inventory_movements_product_created', table_name='inventory_movements')
    op.drop_table('inventory_movements')
    op.drop_table('settings')
    op.drop_index(op.f('ix_products_sku'), table_name='products')
    op.drop_index(op.f('ix_products_name'), table_name='products')
    op.drop_table('products')
    op.drop_index(op.f('ix_customers_name'), table_name='customers')
    op.drop_table('customers')
    op.drop_index(op.f('ix_users_email'), table_name='users')
    op.drop_table('users')
    op.drop_table('categories')
