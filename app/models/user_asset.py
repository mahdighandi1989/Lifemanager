"""UserAsset — a scanned local/remote asset (audit task 217909d2, AC1).

One row per discovered file/media item (movie, book, document, ...). The asset
scanner populates ``path`` / ``metadata_json`` / ``last_scanned_at``; the
AssetToTaskLinker matches these against the user's tasks by name.

(Lives in user_asset.py rather than asset.py because app/models/asset.py is
already the re-export shim for the finance ``Asset`` model — task 4ae4b3ca.)
"""
from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.sql import func

from app.database import Base


class UserAsset(Base):
    __tablename__ = "user_assets"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=True)
    asset_type = Column(String(64), nullable=True)  # movie / book / document / file / ...
    name = Column(String(512), nullable=False)
    path = Column(String(1024), nullable=True)
    metadata_json = Column(Text, nullable=True)  # JSON blob of probed metadata
    last_scanned_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
