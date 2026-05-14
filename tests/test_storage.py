import pytest
from src.storage.storage_handler import save_session_record

def test_save_new_session_success():
    """Verifies that a valid session is saved successfully (Success Path)."""
    sample_session = {
        "archer_id": "archer_101",
        "session_date": "2026-04-30",
        "session_id": "session_501",
        "shots": [{"score": 9, "x": 12, "y": 4, "distance_m": 18}],
    }
    result = save_session_record(sample_session)
    assert result == "success"


def test_duplicate_session_prevention():
    """Verifies that duplicate session IDs are rejected (Duplicate Path)."""
    sample_session = {
        "archer_id": "archer_101",
        "session_date": "2026-04-30",
        "session_id": "session_unique_123",
        "shots": [{"score": 9, "x": 12, "y": 4, "distance_m": 18}],
    }
    save_session_record(sample_session)
    result = save_session_record(sample_session)
    assert result == "exists"


def test_missing_fields_error():
    """Verifies that incomplete payloads return 'error' (Error Path)."""
    incomplete_session = {"archer_id": "archer_101"}
    result = save_session_record(incomplete_session)
    assert result == "error"

def test_invalid_shot_data_error():
    """Verifies that invalid numeric values (score < 0) return 'error'."""
    invalid_session = {
        "archer_id": "archer_101",
        "session_date": "2026-04-30",
        "session_id": "session_error_99",
        "shots": [{"score": -1, "x": 12, "y": 4, "distance_m": 18}],
    }
    result = save_session_record(invalid_session)
    assert result == "error"
