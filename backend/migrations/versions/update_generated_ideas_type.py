"""update generated ideas type

Revision ID: update_generated_ideas_type
Revises: 4be62ecf40ef
Create Date: 2024-03-20 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB

# revision identifiers, used by Alembic.
revision = 'update_generated_ideas_type'
down_revision = 'initial_schema'
branch_labels = None
depends_on = None

def upgrade():
    # Create a temporary column with the new type
    op.add_column('research_ideas', sa.Column('generated_ideas_new', JSONB, nullable=True))
    
    # Copy data from old column to new column
    op.execute("""
        UPDATE research_ideas 
        SET generated_ideas_new = generated_ideas::jsonb 
        WHERE generated_ideas IS NOT NULL
    """)
    
    # Drop the old column
    op.drop_column('research_ideas', 'generated_ideas')
    
    # Rename the new column to the original name
    op.alter_column('research_ideas', 'generated_ideas_new', new_column_name='generated_ideas')

def downgrade():
    # Create a temporary column with the old type
    op.add_column('research_ideas', sa.Column('generated_ideas_old', sa.JSON, nullable=True))
    
    # Copy data from new column to old column
    op.execute("""
        UPDATE research_ideas 
        SET generated_ideas_old = generated_ideas::json 
        WHERE generated_ideas IS NOT NULL
    """)
    
    # Drop the new column
    op.drop_column('research_ideas', 'generated_ideas')
    
    # Rename the old column to the original name
    op.alter_column('research_ideas', 'generated_ideas_old', new_column_name='generated_ideas') 