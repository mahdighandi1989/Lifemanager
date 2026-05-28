"""UserAsset model + AssetToTaskLinker (audit task 217909d2, AC1 + AC6)."""
from types import SimpleNamespace

import pytest

from app.models.user_asset import UserAsset
from app.services.asset_to_task_linker import AssetToTaskLinker


def test_user_asset_has_required_fields():
    cols = {c.name for c in UserAsset.__table__.columns}
    required = {
        "id",
        "user_id",
        "asset_type",
        "name",
        "path",
        "metadata_json",
        "last_scanned_at",
        "created_at",
        "updated_at",
    }
    assert required <= cols, f"UserAsset missing columns: {required - cols}"


def test_linker_matches_asset_name_in_task_title():
    tasks = [
        SimpleNamespace(id=1, title="تماشای فیلم Inception امشب"),
        SimpleNamespace(id=2, title="خرید شیر"),
    ]
    assets = [
        SimpleNamespace(id=10, name="Inception.mp4"),
        SimpleNamespace(id=11, name="Tenet.mkv"),
    ]
    links = AssetToTaskLinker().link(tasks, assets)
    assert len(links) == 1
    assert links[0]["task_id"] == 1
    assert links[0]["asset_id"] == 10
    assert links[0]["asset_name"] == "Inception.mp4"


def test_linker_no_match_returns_empty():
    tasks = [SimpleNamespace(id=1, title="buy milk")]
    assets = [SimpleNamespace(id=10, name="Inception.mp4")]
    assert AssetToTaskLinker().link(tasks, assets) == []


@pytest.mark.asyncio
async def test_user_asset_persists(db_session):
    asset = UserAsset(
        user_id=1, asset_type="movie", name="Inception.mp4", path="/media/Inception.mp4"
    )
    db_session.add(asset)
    await db_session.commit()
    await db_session.refresh(asset)
    assert asset.id is not None
    assert asset.asset_type == "movie"
