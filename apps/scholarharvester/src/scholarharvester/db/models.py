from __future__ import annotations

from datetime import datetime
from typing import Optional

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    pass


class Source(Base):
    __tablename__ = "source"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(255), unique=True)
    publisher: Mapped[str] = mapped_column(String(255))
    url: Mapped[str] = mapped_column(String(1024))
    license: Mapped[Optional[str]] = mapped_column(String(255))
    datasets: Mapped[list["Dataset"]] = relationship(back_populates="source")


class Dataset(Base):
    __tablename__ = "dataset"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    source_id: Mapped[int] = mapped_column(ForeignKey("source.id"))
    name: Mapped[str] = mapped_column(String(255))
    description: Mapped[str] = mapped_column(Text)
    latest_refresh: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    source: Mapped[Source] = relationship(back_populates="datasets")
    files: Mapped[list["FileIngest"]] = relationship(back_populates="dataset")


class FileIngest(Base):
    __tablename__ = "file_ingest"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    dataset_id: Mapped[int] = mapped_column(ForeignKey("dataset.id"))
    storage_path: Mapped[str] = mapped_column(String(512))
    checksum: Mapped[str] = mapped_column(String(64))
    ingested_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    dataset: Mapped[Dataset] = relationship(back_populates="files")
    extracts: Mapped[list["TableExtract"]] = relationship(back_populates="file")


class TableExtract(Base):
    __tablename__ = "table_extract"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    file_ingest_id: Mapped[int] = mapped_column(ForeignKey("file_ingest.id"))
    name: Mapped[str] = mapped_column(String(255))
    description: Mapped[Optional[str]] = mapped_column(Text)
    file: Mapped[FileIngest] = relationship(back_populates="extracts")
    metrics: Mapped[list["Metric"]] = relationship(back_populates="table_extract")


class Citation(Base):
    __tablename__ = "citation"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String(255))
    publisher: Mapped[str] = mapped_column(String(255))
    publication_year: Mapped[int] = mapped_column(Integer)
    url: Mapped[str] = mapped_column(String(1024))
    interpretation_note: Mapped[str] = mapped_column(Text)
    metrics: Mapped[list["Metric"]] = relationship(back_populates="citation")


class Campus(Base):
    __tablename__ = "campus"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    slug: Mapped[str] = mapped_column(String(64), unique=True)
    name: Mapped[str] = mapped_column(String(255))
    system: Mapped[str] = mapped_column(String(64))
    metrics: Mapped[list["Metric"]] = relationship(back_populates="campus")


class Major(Base):
    __tablename__ = "major"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    discipline: Mapped[str] = mapped_column(String(255))
    cip_code: Mapped[str] = mapped_column(String(16))
    metrics: Mapped[list["Metric"]] = relationship(back_populates="major")


class SourceSchool(Base):
    __tablename__ = "sourceschool"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(255))
    type: Mapped[str] = mapped_column(String(32))
    metrics: Mapped[list["Metric"]] = relationship(back_populates="source_school")


class Metric(Base):
    __tablename__ = "metric"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    table_extract_id: Mapped[int] = mapped_column(ForeignKey("table_extract.id"))
    campus_id: Mapped[int | None] = mapped_column(ForeignKey("campus.id"), nullable=True)
    major_id: Mapped[int | None] = mapped_column(ForeignKey("major.id"), nullable=True)
    source_school_id: Mapped[int | None] = mapped_column(ForeignKey("sourceschool.id"), nullable=True)
    citation_id: Mapped[int] = mapped_column(ForeignKey("citation.id"))
    metric_key: Mapped[str] = mapped_column(String(128), index=True)
    metric_year: Mapped[int] = mapped_column(Integer, index=True)
    value_float: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    value_text: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    is_estimate: Mapped[bool] = mapped_column(Boolean, default=False)

    table_extract: Mapped[TableExtract] = relationship(back_populates="metrics")
    campus: Mapped[Optional[Campus]] = relationship(back_populates="metrics")
    major: Mapped[Optional[Major]] = relationship(back_populates="metrics")
    source_school: Mapped[Optional[SourceSchool]] = relationship(back_populates="metrics")
    citation: Mapped[Citation] = relationship(back_populates="metrics")


class RunLog(Base):
    __tablename__ = "runlog"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    adapter: Mapped[str] = mapped_column(String(64))
    started_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    finished_at: Mapped[Optional[datetime]] = mapped_column(DateTime)
    success: Mapped[bool] = mapped_column(Boolean, default=False)
    message: Mapped[Optional[str]] = mapped_column(Text)


class RobotsDecisionLog(Base):
    __tablename__ = "robots_decision"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    url: Mapped[str] = mapped_column(String(1024), unique=True)
    allowed: Mapped[bool] = mapped_column(Boolean)
    reason: Mapped[str] = mapped_column(Text)
    decided_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
