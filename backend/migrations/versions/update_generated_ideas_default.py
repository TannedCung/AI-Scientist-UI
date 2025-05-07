"""update generated ideas default

Revision ID: update_generated_ideas_default
Revises: update_generated_ideas_type
Create Date: 2024-03-20 11:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB

# revision identifiers, used by Alembic.
revision = 'update_generated_ideas_default'
down_revision = 'update_generated_ideas_type'
branch_labels = None
depends_on = None

def upgrade():
    # Update the default value for generated_ideas
    op.alter_column('research_ideas', 'generated_ideas',
        server_default=sa.text("'{\"ideas\": [], \"metadata\": {\"generated_at\": null, \"num_ideas\": 0}}'::jsonb"),
        existing_type=JSONB,
        existing_nullable=True
    )

def downgrade():
    # Remove the default value
    op.alter_column('research_ideas', 'generated_ideas',
        server_default=None,
        existing_type=JSONB,
        existing_nullable=True
    ) 