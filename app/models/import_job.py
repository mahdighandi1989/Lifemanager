"""ImportJob — async record of an AI document-import run (ALLIN1 port).

The spreadsheet bulk-import path is synchronous (returns an ImportResult
inline), but AI document extraction can be slow (LLM + multimodal), so it runs
as a background task and the frontend polls this row. Also serves as the import
history surface.
"""
from sqlalchemy import Column, DateTime, Integer, String, Text
from sqlalchemy.sql import func

from app.database import Base


class ImportJob(Base):
    __tablename__ = "import_jobs"

    id = Column(String(32), primary_key=True)  # short hex token
    status = Column(String(12), nullable=False, default="running")  # running|done|error
    target = Column(String(40), nullable=True)  # which entity type (tasks/people/...)
    filename = Column(String(300), nullable=True)
    user_id = Column(Integer, nullable=True)
    result_json = Column(Text, nullable=True)  # JSON ImportResult on success
    error = Column(Text, nullable=True)        # message on failure
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    finished_at = Column(DateTime(timezone=True), nullable=True)

    def to_dict(self):
        import json

        result = None
        if self.result_json:
            try:
                result = json.loads(self.result_json)
            except Exception:
                result = None
        return {
            "job_id": self.id,
            "status": self.status,
            "target": self.target,
            "filename": self.filename,
            "result": result,
            "error": self.error,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "finished_at": self.finished_at.isoformat() if self.finished_at else None,
        }
