"""create all tables

Revision ID: create_all_tables
Revises: 4be62ecf40ef
Create Date: 2025-05-07 17:10:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.sql import func

# revision identifiers, used by Alembic.
revision = 'create_all_tables'
down_revision = '4be62ecf40ef'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create research_ideas table
    op.create_table(
        'research_ideas',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('keywords', sa.String(), nullable=False),
        sa.Column('tldr', sa.String(), nullable=False),
        sa.Column('abstract', sa.Text(), nullable=False),
        sa.Column('markdown_file_path', sa.String(), nullable=False),
        sa.Column('code_file_path', sa.String(), nullable=True),
        sa.Column('status', sa.String(), nullable=False, server_default='draft'),
        sa.Column('ideas_json_url', sa.String(), nullable=True),
        sa.Column('error_message', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=func.now(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), server_default=func.now(), onupdate=func.now(), nullable=True),
        sa.PrimaryKeyConstraint('id', name='pk_research_ideas')
    )

    # Create experiment_runs table
    op.create_table(
        'experiment_runs',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('research_idea_id', sa.String(), nullable=False),
        sa.Column('status', sa.String(), nullable=False, server_default='pending'),
        sa.Column('log_folder_path', sa.String(), nullable=True),
        sa.Column('html_file_path', sa.String(), nullable=True),
        sa.Column('results_url', sa.String(), nullable=True),
        sa.Column('started_at', sa.DateTime(), server_default=func.now(), nullable=True),
        sa.Column('completed_at', sa.DateTime(), nullable=True),
        sa.Column('is_successful', sa.Boolean(), nullable=True),
        sa.Column('error_message', sa.Text(), nullable=True),
        sa.Column('experiment_config', sa.JSON(), nullable=True),
        sa.ForeignKeyConstraint(['research_idea_id'], ['research_ideas.id'], name='fk_experiment_runs_research_idea_id', ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id', name='pk_experiment_runs')
    )

    # Create experiment_results table
    op.create_table(
        'experiment_results',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('experiment_id', sa.String(), nullable=False),
        sa.Column('metric_name', sa.String(), nullable=False),
        sa.Column('metric_value', sa.String(), nullable=False),
        sa.Column('metric_type', sa.String(), nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=func.now(), nullable=True),
        sa.ForeignKeyConstraint(['experiment_id'], ['experiment_runs.id'], name='fk_experiment_results_experiment_id', ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id', name='pk_experiment_results')
    )


def downgrade() -> None:
    op.drop_table('experiment_results')
    op.drop_table('experiment_runs')
    op.drop_table('research_ideas') 