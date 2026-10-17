from app.main import health_check


def test_health_check() -> None:
    response = health_check()
    assert response["status"] == "ok"
    assert "Python engine is running" in response["message"]
