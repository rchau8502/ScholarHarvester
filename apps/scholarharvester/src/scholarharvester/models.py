from __future__ import annotations

import enum
from datetime import datetime
from typing import Any

from sqlalchemy import (
    JSON,
    Column,
    DateTime,
    Enum,
    ForeignKey,
    Index,
    Integer,
    Numeric,
    String,
    Text,
    func,
)
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

class Cohort(enum.Enum):
    freshman = "freshman"
    transfer = "transfer"

class SchoolType(enum.Enum):
    HighSchool = "HighSchool"
    CommunityCollege = "CommunityCollege"
    Other = "Other"

class SystemType(enum.Enum):
    UC = "UC"
    CSU = "CSU"
    Other = "Other"

class Source(Base):
    __tablename__ = "source"

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False, unique=True)
    adapter = Column(String, nullable=False)
    publisher = Column(String, nullable=True)
    base_url = Column(String, nullable=False)
    terms_url = Column(String, nullable=True)
    robots_cache_json = Column(JSON, nullable=True)
    default_throttle = Column(Integer, default=2)

    datasets = relationship("Dataset", back_populates="source")

class Dataset(Base):
    __tablename__ = "dataset"

    id = Column(Integer, primary_key=True)
    source_id = Column(Integer, ForeignKey("source.id"), nullable=False)
    title = Column(String, nullable=False)
    year = Column(Integer, nullable=False, index=True)
    term = Column(String, nullable=False)
    cohort = Column(Enum(Cohort), nullable=False)
    notes = Column(Text, nullable=True)

    source = relationship("Source", back_populates="datasets")
    metrics = relationship("Metric", back_populates="dataset")
    file_ingests = relationship("FileIngest", back_populates="dataset")

class FileIngest(Base):
    __tablename__ = "file_ingest"

    id = Column(Integer, primary_key=True)
    dataset_id = Column(Integer, ForeignKey("dataset.id"), nullable=False)
    url = Column(String, nullable=False)
    fetched_at = Column(DateTime, default=datetime.utcnow)
    mime = Column(String, nullable=True)
    bytes = Column(Integer, nullable=True)
    sha256 = Column(String, nullable=True)
    http_status = Column(Integer, nullable=True)
    robots_rule = Column(String, nullable=True)
    status = Column(String, nullable=False, default="needs_review")

    dataset = relationship("Dataset", back_populates="file_ingests")
    table_extracts = relationship("TableExtract", back_populates="file_ingest")

class TableExtract(Base):
    __tablename__ = "table_extract"

    id = Column(Integer, primary_key=True)
    file_ingest_id = Column(Integer, ForeignKey("file_ingest.id"), nullable=False)
    page = Column(Integer, nullable=False)
    caption = Column(String, nullable=True)
    hash = Column(String, nullable=True)
    rows_jsonb = Column(JSON, nullable=True)

    file_ingest = relationship("FileIngest", back_populates="table_extracts")

class Metric(Base):
    __tablename__ = "metric"

    id = Column(Integer, primary_key=True)
    dataset_id = Column(Integer, ForeignKey("dataset.id"), nullable=False)
    campus = Column(String, nullable=False, index=True)
    major = Column(String, nullable=True, index=True)
    discipline = Column(String, nullable=True)
    source_school = Column(String, nullable=True, index=True)
    school_type = Column(Enum(SchoolType), nullable=True)
    cohort = Column(Enum(Cohort), nullable=False)
    stat_name = Column(String, nullable=False)
    stat_value_numeric = Column(Numeric, nullable=True)
    stat_value_text = Column(Text, nullable=True)
    unit = Column(String, nullable=True)
    percentile = Column(String, nullable=True)
    year = Column(Integer, nullable=False, index=True)
    term = Column(String, nullable=False)
    notes = Column(Text, nullable=True)

    dataset = relationship("Dataset", back_populates="metrics")
    citations = relationship("Citation", back_populates="metric")

    __table_args__ = (
        Index("ix_metric_year_campus_major", "year", "campus", "major"),
        Index("ix_metric_year_source_school", "year", "source_school"),
    )

class Citation(Base):
    __tablename__ = "citation"

    id = Column(Integer, primary_key=True)
    metric_id = Column(Integer, ForeignKey("metric.id"), nullable=False)
    title = Column(String, nullable=False)
    publisher = Column(String, nullable=False)
    year = Column(Integer, nullable=False)
    source_url = Column(String, nullable=False)
    retrieved_at = Column(DateTime, default=datetime.utcnow)
    interpretation_note = Column(Text, nullable=True)

    metric = relationship("Metric", back_populates="citations")

class Campus(Base):
    __tablename__ = "campus"

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False, unique=True)
    system = Column(Enum(SystemType), nullable=False)

class Major(Base):
    __tablename__ = "major"

    id = Column(Integer, primary_key=True)
    campus_id = Column(Integer, ForeignKey("campus.id"), nullable=False)
    name = Column(String, nullable=False)
    cip_code = Column(String, nullable=True)
    is_impacted = Column(String, nullable=True)

class SourceSchool(Base):
    __tablename__ = "sourceschool"

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    school_type = Column(Enum(SchoolType), nullable=False)
    city = Column(String, nullable=True)
    state = Column(String, nullable=True)

class Runlog(Base):
    __tablename__ = "runlog"

    id = Column(Integer, primary_key=True)
    adapter = Column(String, nullable=False)
    started_at = Column(DateTime, default=datetime.utcnow)
    finished_at = Column(DateTime, nullable=True)
    status = Column(String, nullable=False, default="running")
    new_records = Column(Integer, default=0)
    warnings_jsonb = Column(JSON, nullable=True)
