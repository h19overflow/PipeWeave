"""Initial schema with all 8 tables

Revision ID: 001
Revises:
Create Date: 2025-12-27 14:30:00

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '001'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade database schema."""

    # Create users table
    op.create_table(
        'users',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('email', sa.String(255), nullable=False, unique=True),
        sa.Column('password_hash', sa.String(255), nullable=False),
        sa.Column('full_name', sa.String(255), nullable=False),
        sa.Column('is_active', sa.Boolean, nullable=False, server_default='true'),
        sa.Column('is_superuser', sa.Boolean, nullable=False, server_default='false'),
        sa.Column('last_login_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('failed_login_count', sa.Integer, nullable=False, server_default='0'),
        sa.Column('locked_until', sa.DateTime(timezone=True), nullable=True),
        sa.Column('password_changed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column('deleted_at', sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index('idx_users_email', 'users', ['email'], unique=True)
    op.create_index('idx_users_active', 'users', ['is_active'], postgresql_where=sa.text('is_active = true'))

    # Create datasets table
    op.create_table(
        'datasets',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('description', sa.Text, nullable=True),
        sa.Column('s3_bucket', sa.String(255), nullable=False),
        sa.Column('s3_key_raw', sa.String(512), nullable=False),
        sa.Column('s3_key_processed', sa.String(512), nullable=True),
        sa.Column('file_size_bytes', sa.BigInteger, nullable=False),
        sa.Column('file_hash_sha256', sa.String(64), nullable=False),
        sa.Column('content_type', sa.String(100), nullable=False, server_default='text/csv'),
        sa.Column('num_rows', sa.BigInteger, nullable=True),
        sa.Column('num_columns', sa.Integer, nullable=True),
        sa.Column('column_names', postgresql.ARRAY(sa.Text), nullable=True),
        sa.Column('status', sa.String(50), nullable=False, server_default='uploading'),
        sa.Column('validation_errors', postgresql.JSONB, nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column('deleted_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='RESTRICT'),
        sa.CheckConstraint(
            "status IN ('uploading', 'uploaded', 'validating', 'validated', 'failed')",
            name='valid_dataset_status'
        ),
        sa.CheckConstraint('file_size_bytes > 0', name='positive_file_size'),
    )
    op.create_index('idx_datasets_user_id', 'datasets', ['user_id'], postgresql_where=sa.text('deleted_at IS NULL'))
    op.create_index('idx_datasets_status', 'datasets', ['status'], postgresql_where=sa.text('deleted_at IS NULL'))
    op.create_index('idx_datasets_hash', 'datasets', ['file_hash_sha256'])

    # Create schema_deductions table
    op.create_table(
        'schema_deductions',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('dataset_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('proposed_schema', postgresql.JSONB, nullable=False),
        sa.Column('column_metadata', postgresql.JSONB, nullable=False),
        sa.Column('status', sa.String(50), nullable=False, server_default='proposed'),
        sa.Column('confidence_score', sa.Float, nullable=False),
        sa.Column('agent_version', sa.String(50), nullable=False),
        sa.Column('rejection_reason', sa.Text, nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(['dataset_id'], ['datasets.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='RESTRICT'),
        sa.CheckConstraint(
            "status IN ('proposed', 'accepted', 'rejected', 'superseded')",
            name='valid_schema_status'
        ),
        sa.CheckConstraint(
            'confidence_score >= 0 AND confidence_score <= 1',
            name='valid_confidence_score'
        ),
    )
    op.create_index('idx_schema_dataset', 'schema_deductions', ['dataset_id'])
    op.create_index('idx_schema_status', 'schema_deductions', ['status'])

    # Create eda_reports table
    op.create_table(
        'eda_reports',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('dataset_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('summary', postgresql.JSONB, nullable=False),
        sa.Column('report_size_bytes', sa.BigInteger, nullable=False),
        sa.Column('storage_location', sa.String(10), nullable=False),
        sa.Column('full_report', postgresql.JSONB, nullable=True),
        sa.Column('s3_bucket', sa.String(255), nullable=True),
        sa.Column('s3_key', sa.String(512), nullable=True),
        sa.Column('report_version', sa.String(20), nullable=False),
        sa.Column('generation_time_seconds', sa.Float, nullable=True),
        sa.Column('status', sa.String(50), nullable=False, server_default='running'),
        sa.Column('error_message', sa.Text, nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(['dataset_id'], ['datasets.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='RESTRICT'),
        sa.CheckConstraint(
            "storage_location IN ('postgres', 's3')",
            name='valid_storage_location'
        ),
        sa.CheckConstraint(
            "(storage_location = 'postgres' AND full_report IS NOT NULL) OR "
            "(storage_location = 's3' AND s3_bucket IS NOT NULL AND s3_key IS NOT NULL)",
            name='valid_storage_data'
        ),
        sa.CheckConstraint(
            "status IN ('running', 'completed', 'failed')",
            name='valid_eda_status'
        ),
    )
    op.create_index('idx_eda_dataset', 'eda_reports', ['dataset_id'])
    op.create_index('idx_eda_summary', 'eda_reports', ['summary'], postgresql_using='gin')
    op.create_index('idx_eda_status', 'eda_reports', ['status'], postgresql_where=sa.text("status = 'running'"))

    # Create pipelines table
    op.create_table(
        'pipelines',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('dataset_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('description', sa.Text, nullable=True),
        sa.Column('config', postgresql.JSONB, nullable=False),
        sa.Column('node_registry', postgresql.JSONB, nullable=False),
        sa.Column('version', sa.Integer, nullable=False, server_default='1'),
        sa.Column('status', sa.String(50), nullable=False, server_default='draft'),
        sa.Column('validated_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column('deleted_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='RESTRICT'),
        sa.ForeignKeyConstraint(['dataset_id'], ['datasets.id'], ondelete='RESTRICT'),
        sa.CheckConstraint(
            "status IN ('draft', 'validated', 'archived')",
            name='valid_pipeline_status'
        ),
    )
    op.create_index('idx_pipelines_user', 'pipelines', ['user_id'], postgresql_where=sa.text('deleted_at IS NULL'))
    op.create_index('idx_pipelines_dataset', 'pipelines', ['dataset_id'])
    op.create_index('idx_pipelines_config', 'pipelines', ['config'], postgresql_using='gin')

    # Create training_jobs table
    op.create_table(
        'training_jobs',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('pipeline_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('dataset_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('pipeline_snapshot', postgresql.JSONB, nullable=False),
        sa.Column('status', sa.String(50), nullable=False, server_default='queued'),
        sa.Column('progress_percentage', sa.Integer, nullable=False, server_default='0'),
        sa.Column('current_step', sa.Text, nullable=True),
        sa.Column('started_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('heartbeat_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('training_duration_seconds', sa.Float, nullable=True),
        sa.Column('celery_task_id', sa.String(255), nullable=True),
        sa.Column('priority', sa.Integer, nullable=False, server_default='5'),
        sa.Column('error_message', sa.Text, nullable=True),
        sa.Column('error_traceback', postgresql.JSONB, nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(['pipeline_id'], ['pipelines.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='RESTRICT'),
        sa.ForeignKeyConstraint(['dataset_id'], ['datasets.id'], ondelete='RESTRICT'),
        sa.CheckConstraint(
            "status IN ('queued', 'running', 'completed', 'failed', 'cancelled')",
            name='valid_job_status'
        ),
        sa.CheckConstraint(
            'progress_percentage >= 0 AND progress_percentage <= 100',
            name='valid_progress'
        ),
        sa.CheckConstraint(
            'priority >= 1 AND priority <= 10',
            name='valid_priority'
        ),
    )
    op.create_index('idx_jobs_status', 'training_jobs', ['status'])
    op.create_index('idx_jobs_user', 'training_jobs', ['user_id'])
    op.create_index('idx_jobs_heartbeat', 'training_jobs', ['heartbeat_at'], postgresql_where=sa.text("status = 'running'"))
    op.create_index('idx_jobs_pipeline', 'training_jobs', ['pipeline_id'])

    # Create models table
    op.create_table(
        'models',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('training_job_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('pipeline_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('model_type', sa.String(100), nullable=False),
        sa.Column('framework_version', sa.String(50), nullable=True),
        sa.Column('s3_bucket', sa.String(255), nullable=False),
        sa.Column('s3_key_artifact', sa.String(512), nullable=False),
        sa.Column('s3_key_config', sa.String(512), nullable=True),
        sa.Column('s3_key_metadata', sa.String(512), nullable=True),
        sa.Column('artifact_size_bytes', sa.BigInteger, nullable=False),
        sa.Column('artifact_checksum', sa.String(64), nullable=False),
        sa.Column('metrics', postgresql.JSONB, nullable=False),
        sa.Column('version', sa.Integer, nullable=False, server_default='1'),
        sa.Column('is_production', sa.Boolean, nullable=False, server_default='false'),
        sa.Column('deployed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(['training_job_id'], ['training_jobs.id'], ondelete='RESTRICT'),
        sa.ForeignKeyConstraint(['pipeline_id'], ['pipelines.id'], ondelete='RESTRICT'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='RESTRICT'),
    )
    op.create_index('idx_models_job', 'models', ['training_job_id'])
    op.create_index('idx_models_production', 'models', ['is_production'], postgresql_where=sa.text('is_production = true'))
    op.create_index('idx_models_metrics', 'models', ['metrics'], postgresql_using='gin')
    op.create_index('idx_models_pipeline_version', 'models', ['pipeline_id', 'version'], unique=True)

    # Create experiment_runs table
    op.create_table(
        'experiment_runs',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('training_job_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('run_number', sa.Integer, nullable=False),
        sa.Column('hyperparameters', postgresql.JSONB, nullable=False),
        sa.Column('metrics', postgresql.JSONB, nullable=False),
        sa.Column('training_time_seconds', sa.Float, nullable=False),
        sa.Column('status', sa.String(50), nullable=False, server_default='running'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(['training_job_id'], ['training_jobs.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='RESTRICT'),
        sa.CheckConstraint(
            "status IN ('running', 'completed', 'failed')",
            name='valid_run_status'
        ),
    )
    op.create_index('idx_runs_job', 'experiment_runs', ['training_job_id'])
    op.create_index('idx_runs_metrics', 'experiment_runs', ['metrics'], postgresql_using='gin')
    op.create_index('idx_runs_job_number', 'experiment_runs', ['training_job_id', 'run_number'], unique=True)


def downgrade() -> None:
    """Downgrade database schema."""
    op.drop_table('experiment_runs')
    op.drop_table('models')
    op.drop_table('training_jobs')
    op.drop_table('pipelines')
    op.drop_table('eda_reports')
    op.drop_table('schema_deductions')
    op.drop_table('datasets')
    op.drop_table('users')
