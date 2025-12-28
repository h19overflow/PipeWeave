"""
Database initialization script with fake test data.

Purpose: Populates database with realistic test data simulating full ML workflow
Layer: Scripts/Testing
Dependencies: SQLAlchemy, Faker, backend.boundary.models

Usage:
    python -m backend.scripts.init_test_data
"""

import hashlib
import json
import logging
from datetime import datetime, timedelta
from uuid import uuid4

from faker import Faker
from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from backend.boundary.models import (
    Base,
    Dataset,
    EDAReport,
    ExperimentRun,
    Model,
    Pipeline,
    SchemaDeduction,
    TrainingJob,
    User,
)

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Faker instance
fake = Faker()


def get_database_url() -> str:
    """Get database URL from environment or use default."""
    return "postgresql://pipeweave:pipeweave_dev_password@localhost:5432/pipeweave_db"


def create_test_users(session: Session, count: int = 3) -> list[User]:
    """Create test users with hashed passwords."""
    users = []

    for i in range(count):
        user = User(
            id=uuid4(),
            email=f"user{i+1}@pipeweave.test",
            password_hash="$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5aeOuRd3G3Ecu",  # "password123"
            full_name=fake.name(),
            is_active=True,
            is_superuser=(i == 0),  # First user is superuser
            last_login_at=datetime.utcnow() - timedelta(days=fake.random_int(0, 30)),
            failed_login_count=0,
            password_changed_at=datetime.utcnow() - timedelta(days=90),
        )
        users.append(user)
        session.add(user)
        logger.info(f"Created user: {user.email}")

    session.commit()
    return users


def create_test_datasets(session: Session, users: list[User]) -> list[Dataset]:
    """Create test datasets with S3 references."""
    datasets = []

    dataset_configs = [
        ("customer_churn.csv", 10000, 15),
        ("sales_data.csv", 50000, 20),
        ("fraud_detection.csv", 100000, 25),
    ]

    for i, (filename, rows, cols) in enumerate(dataset_configs):
        user = users[i % len(users)]
        dataset_id = uuid4()

        # Simulate file hash
        file_hash = hashlib.sha256(f"{filename}{dataset_id}".encode()).hexdigest()

        dataset = Dataset(
            id=dataset_id,
            user_id=user.id,
            name=filename.replace(".csv", "").replace("_", " ").title(),
            description=f"Test dataset for {filename}",
            s3_bucket="pipeweave-storage",
            s3_key_raw=f"datasets/{user.id}/{dataset_id}/raw/{filename}",
            s3_key_processed=f"datasets/{user.id}/{dataset_id}/processed/data.parquet",
            file_size_bytes=fake.random_int(1000000, 100000000),
            file_hash_sha256=file_hash,
            content_type="text/csv",
            num_rows=rows,
            num_columns=cols,
            column_names=[f"col_{j}" for j in range(cols)],
            status="validated",
        )
        datasets.append(dataset)
        session.add(dataset)
        logger.info(f"Created dataset: {dataset.name} for {user.email}")

    session.commit()
    return datasets


def create_schema_deductions(
    session: Session, datasets: list[Dataset]
) -> list[SchemaDeduction]:
    """Create schema deductions from LangChain agents."""
    deductions = []

    for dataset in datasets:
        deduction = SchemaDeduction(
            id=uuid4(),
            dataset_id=dataset.id,
            user_id=dataset.user_id,
            proposed_schema={
                "columns": {
                    f"col_{i}": {
                        "dtype": fake.random_element(
                            ["int64", "float64", "object", "datetime64"]
                        ),
                        "nullable": fake.boolean(),
                    }
                    for i in range(dataset.num_columns or 10)
                }
            },
            column_metadata={
                "sample_values": {
                    f"col_{i}": [fake.word() for _ in range(5)]
                    for i in range(5)
                }
            },
            status="accepted",
            confidence_score=fake.random.uniform(0.85, 0.99),
            agent_version="langchain-v1.0.0",
        )
        deductions.append(deduction)
        session.add(deduction)
        logger.info(f"Created schema deduction for dataset: {dataset.name}")

    session.commit()
    return deductions


def create_eda_reports(session: Session, datasets: list[Dataset]) -> list[EDAReport]:
    """Create EDA reports with hybrid storage."""
    reports = []

    for dataset in datasets:
        # Small summary (always in PostgreSQL)
        summary = {
            "num_rows": dataset.num_rows,
            "num_columns": dataset.num_columns,
            "missing_percentage": fake.random.uniform(0.0, 10.0),
            "numeric_columns": fake.random_int(5, 15),
            "categorical_columns": fake.random_int(3, 10),
        }

        # Simulate small vs large reports
        is_large_report = fake.boolean()
        report_size = fake.random_int(100000, 2000000) if is_large_report else fake.random_int(1000, 900000)

        if is_large_report:
            # Large report → S3
            report = EDAReport(
                id=uuid4(),
                dataset_id=dataset.id,
                user_id=dataset.user_id,
                summary=summary,
                report_size_bytes=report_size,
                storage_location="s3",
                s3_bucket="pipeweave-storage",
                s3_key=f"datasets/{dataset.user_id}/{dataset.id}/metadata/eda_report_{datetime.utcnow().isoformat()}.json",
                report_version="1.0.0",
                generation_time_seconds=fake.random.uniform(10.0, 300.0),
                status="completed",
            )
        else:
            # Small report → PostgreSQL
            full_report = {
                **summary,
                "distributions": {
                    f"col_{i}": {
                        "mean": fake.random.uniform(0, 100),
                        "std": fake.random.uniform(0, 50),
                        "min": fake.random.uniform(-10, 0),
                        "max": fake.random.uniform(100, 200),
                    }
                    for i in range(5)
                },
                "correlations": [[fake.random.uniform(-1, 1) for _ in range(5)] for _ in range(5)],
            }
            report = EDAReport(
                id=uuid4(),
                dataset_id=dataset.id,
                user_id=dataset.user_id,
                summary=summary,
                report_size_bytes=report_size,
                storage_location="postgres",
                full_report=full_report,
                report_version="1.0.0",
                generation_time_seconds=fake.random.uniform(5.0, 60.0),
                status="completed",
            )

        reports.append(report)
        session.add(report)
        logger.info(
            f"Created EDA report ({report.storage_location}) for dataset: {dataset.name}"
        )

    session.commit()
    return reports


def create_pipelines(session: Session, datasets: list[Dataset]) -> list[Pipeline]:
    """Create ML pipeline configurations."""
    pipelines = []

    pipeline_templates = [
        ("XGBoost Classifier", ["StandardScaler", "SelectKBest", "XGBClassifier"]),
        ("Random Forest", ["MinMaxScaler", "PCA", "RandomForestClassifier"]),
        ("Logistic Regression", ["StandardScaler", "LogisticRegression"]),
    ]

    for i, (name, steps) in enumerate(pipeline_templates):
        dataset = datasets[i % len(datasets)]

        pipeline = Pipeline(
            id=uuid4(),
            user_id=dataset.user_id,
            dataset_id=dataset.id,
            name=name,
            description=f"Automated pipeline for {name}",
            config={
                "nodes": [
                    {"id": f"node_{j}", "type": step, "params": {}}
                    for j, step in enumerate(steps)
                ],
                "edges": [
                    {"source": f"node_{j}", "target": f"node_{j+1}"}
                    for j in range(len(steps) - 1)
                ],
            },
            node_registry={step: {"version": "1.0"} for step in steps},
            version=1,
            status="validated",
            validated_at=datetime.utcnow(),
        )
        pipelines.append(pipeline)
        session.add(pipeline)
        logger.info(f"Created pipeline: {pipeline.name} for dataset: {dataset.name}")

    session.commit()
    return pipelines


def create_training_jobs(
    session: Session, pipelines: list[Pipeline]
) -> list[TrainingJob]:
    """Create training jobs with realistic statuses."""
    jobs = []

    for pipeline in pipelines:
        job = TrainingJob(
            id=uuid4(),
            pipeline_id=pipeline.id,
            user_id=pipeline.user_id,
            dataset_id=pipeline.dataset_id,
            pipeline_snapshot=pipeline.config,
            status="completed",
            progress_percentage=100,
            current_step="Training completed",
            started_at=datetime.utcnow() - timedelta(hours=2),
            completed_at=datetime.utcnow() - timedelta(hours=1),
            heartbeat_at=datetime.utcnow() - timedelta(hours=1),
            training_duration_seconds=fake.random.uniform(300.0, 3600.0),
            celery_task_id=str(uuid4()),
            priority=fake.random_int(1, 10),
        )
        jobs.append(job)
        session.add(job)
        logger.info(f"Created training job for pipeline: {pipeline.name}")

    session.commit()
    return jobs


def create_models(session: Session, jobs: list[TrainingJob]) -> list[Model]:
    """Create trained model artifacts."""
    models = []

    for job in jobs:
        pipeline = session.get(Pipeline, job.pipeline_id)
        model_id = uuid4()

        model = Model(
            id=model_id,
            training_job_id=job.id,
            pipeline_id=job.pipeline_id,
            user_id=job.user_id,
            name=f"{pipeline.name} v1",
            model_type=pipeline.name.split()[0].lower(),
            framework_version="scikit-learn==1.3.0",
            s3_bucket="pipeweave-storage",
            s3_key_artifact=f"models/{job.user_id}/{model_id}/artifacts/model.pkl",
            s3_key_config=f"models/{job.user_id}/{model_id}/artifacts/model_config.json",
            s3_key_metadata=f"models/{job.user_id}/{model_id}/metadata/feature_importance.json",
            artifact_size_bytes=fake.random_int(1000000, 50000000),
            artifact_checksum=hashlib.sha256(str(model_id).encode()).hexdigest(),
            metrics={
                "accuracy": fake.random.uniform(0.75, 0.99),
                "precision": fake.random.uniform(0.70, 0.98),
                "recall": fake.random.uniform(0.70, 0.98),
                "f1_score": fake.random.uniform(0.70, 0.98),
            },
            version=1,
            is_production=False,
        )
        models.append(model)
        session.add(model)
        logger.info(f"Created model: {model.name}")

    session.commit()
    return models


def create_experiment_runs(
    session: Session, jobs: list[TrainingJob]
) -> list[ExperimentRun]:
    """Create experiment runs for hyperparameter tuning."""
    runs = []

    for job in jobs:
        # Create 3 experiment runs per job
        for run_num in range(1, 4):
            run = ExperimentRun(
                id=uuid4(),
                training_job_id=job.id,
                user_id=job.user_id,
                run_number=run_num,
                hyperparameters={
                    "learning_rate": fake.random.uniform(0.001, 0.1),
                    "max_depth": fake.random_int(3, 10),
                    "n_estimators": fake.random_int(50, 200),
                },
                metrics={
                    "train_accuracy": fake.random.uniform(0.80, 0.99),
                    "val_accuracy": fake.random.uniform(0.75, 0.95),
                    "train_loss": fake.random.uniform(0.01, 0.5),
                    "val_loss": fake.random.uniform(0.05, 0.6),
                },
                training_time_seconds=fake.random.uniform(60.0, 600.0),
                status="completed",
            )
            runs.append(run)
            session.add(run)

        logger.info(f"Created 3 experiment runs for job: {job.id}")

    session.commit()
    return runs


def main():
    """Initialize database with test data."""
    logger.info("Starting database initialization...")

    # Create engine
    engine = create_engine(get_database_url(), echo=False)

    # Create tables
    logger.info("Creating database tables...")
    Base.metadata.create_all(engine)

    with Session(engine) as session:
        # Create test data in order (respecting foreign keys)
        logger.info("\n=== Creating test users ===")
        users = create_test_users(session, count=3)

        logger.info("\n=== Creating test datasets ===")
        datasets = create_test_datasets(session, users)

        logger.info("\n=== Creating schema deductions ===")
        create_schema_deductions(session, datasets)

        logger.info("\n=== Creating EDA reports ===")
        create_eda_reports(session, datasets)

        logger.info("\n=== Creating pipelines ===")
        pipelines = create_pipelines(session, datasets)

        logger.info("\n=== Creating training jobs ===")
        jobs = create_training_jobs(session, pipelines)

        logger.info("\n=== Creating models ===")
        create_models(session, jobs)

        logger.info("\n=== Creating experiment runs ===")
        create_experiment_runs(session, jobs)

    logger.info("\n✅ Database initialization completed successfully!")
    logger.info(f"\nTest Credentials:")
    logger.info(f"  Email: user1@pipeweave.test (superuser)")
    logger.info(f"  Email: user2@pipeweave.test")
    logger.info(f"  Email: user3@pipeweave.test")
    logger.info(f"  Password (all): password123\n")


if __name__ == "__main__":
    main()
