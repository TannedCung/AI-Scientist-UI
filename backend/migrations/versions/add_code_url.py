"""add code_url field

Revision ID: add_code_url
Revises: 
Create Date: 2025-05-22

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'add_code_url'
down_revision = 'update_generated_ideas_default'
branch_labels = None
depends_on = None

def upgrade():
    op.add_column('research_ideas', sa.Column('code_url', sa.String(), nullable=True))

def downgrade():
    op.drop_column('research_ideas', 'code_url') 