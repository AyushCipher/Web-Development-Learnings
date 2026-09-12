import pytest

from fastapi.testclient import TestClient

from main import (
    app,
    get_current_user,
    items_db
)


# ============================================================
# CONCEPT 1: FIXTURE
# ============================================================

@pytest.fixture
def client():
    """
    A fixture provides something that tests need.

    Instead of creating TestClient in every test:

        client = TestClient(app)

    we create it once as a reusable fixture.

    Any test that has:

        client

    as a parameter automatically receives this object.
    """

    with TestClient(app) as test_client:

        # The test runs while execution is paused here.
        yield test_client

    # After the test finishes, the context manager closes
    # the TestClient.


# ============================================================
# CONCEPT 2: AUTOUSE FIXTURE
# ============================================================

@pytest.fixture(autouse=True)
def reset_database():
    """
    This fixture automatically runs for EVERY test.

    autouse=True means we don't have to write:

        reset_database

    inside every test.

    This is extremely useful for test isolation.
    """

    # BEFORE TEST
    items_db.clear()

    # Run the actual test
    yield

    # AFTER TEST
    items_db.clear()


# ============================================================
# CONCEPT 3: BASIC GET TEST
# ============================================================

def test_health_check(client):
    """
    Test a simple GET endpoint.
    """

    response = client.get("/health")

    # Check HTTP status code
    assert response.status_code == 200

    # Check complete JSON response
    assert response.json() == {
        "status": "healthy"
    }


# ============================================================
# CONCEPT 4: POST / CREATE
# ============================================================

def test_create_item(client):
    """
    Test creating an item.
    """

    payload = {
        "name": "Laptop",
        "price": 1200
    }

    response = client.post(
        "/items",
        json=payload
    )

    # Our API returns 201 for successful creation.
    assert response.status_code == 201

    data = response.json()

    assert data["message"] == "Item created"

    assert data["item"]["name"] == "Laptop"

    assert data["item"]["price"] == 1200

    # Database-generated ID should exist.
    assert "id" in data["item"]


# ============================================================
# CONCEPT 5: GET ALL
# ============================================================

def test_get_items(client):

    # First create an item.
    client.post(
        "/items",
        json={
            "name": "Laptop",
            "price": 1200
        }
    )

    # Now retrieve all items.
    response = client.get("/items")

    assert response.status_code == 200

    data = response.json()

    assert len(data["items"]) == 1

    assert data["items"][0]["name"] == "Laptop"


# ============================================================
# CONCEPT 6: GET BY ID
# ============================================================

def test_get_item(client):

    # Create an item first.
    create_response = client.post(
        "/items",
        json={
            "name": "Mouse",
            "price": 50
        }
    )

    item_id = create_response.json()["item"]["id"]

    # Retrieve the item.
    response = client.get(
        f"/items/{item_id}"
    )

    assert response.status_code == 200

    assert response.json()["item"]["id"] == item_id

    assert response.json()["item"]["name"] == "Mouse"


# ============================================================
# CONCEPT 7: TESTING 404
# ============================================================

def test_get_item_not_found(client):

    response = client.get("/items/999")

    assert response.status_code == 404

    assert response.json()["detail"] == "Item not found"


# ============================================================
# CONCEPT 8: PUT / UPDATE
# ============================================================

def test_update_item(client):

    # Create item
    create_response = client.post(
        "/items",
        json={
            "name": "Laptop",
            "price": 1200
        }
    )

    item_id = create_response.json()["item"]["id"]

    # Update item
    response = client.put(
        f"/items/{item_id}",
        json={
            "name": "Gaming Laptop",
            "price": 2000
        }
    )

    assert response.status_code == 200

    data = response.json()

    assert data["message"] == "Item updated"

    assert data["item"]["name"] == "Gaming Laptop"

    assert data["item"]["price"] == 2000


# ============================================================
# CONCEPT 9: DELETE
# ============================================================

def test_delete_item(client):

    # Create item
    create_response = client.post(
        "/items",
        json={
            "name": "Keyboard",
            "price": 100
        }
    )

    item_id = create_response.json()["item"]["id"]

    # Delete item
    response = client.delete(
        f"/items/{item_id}"
    )

    assert response.status_code == 200

    assert response.json() == {
        "message": "Item deleted"
    }

    # Verify that the item is actually gone.
    get_response = client.get(
        f"/items/{item_id}"
    )

    assert get_response.status_code == 404


# ============================================================
# CONCEPT 10: PARAMETRIZATION
# ============================================================

@pytest.mark.parametrize(
    "payload, expected_status, expected_detail",
    [
        (
            {},
            400,
            "Missing item name"
        ),

        (
            {"price": 100},
            400,
            "Missing item name"
        ),

        (
            {"price": 999},
            400,
            "Missing item name"
        )
    ]
)
def test_create_item_validation(
    client,
    payload,
    expected_status,
    expected_detail
):
    """
    One test function runs multiple times.

    Each tuple becomes one test case.
    """

    response = client.post(
        "/items",
        json=payload
    )

    assert response.status_code == expected_status

    assert response.json()["detail"] == expected_detail


# ============================================================
# CONCEPT 11: PARAMETRIZATION FOR DIFFERENT IDs
# ============================================================

@pytest.mark.parametrize(
    "item_id",
    [100, 200, 999]
)
def test_nonexistent_items(client, item_id):
    """
    Test multiple nonexistent IDs.
    """

    response = client.get(
        f"/items/{item_id}"
    )

    assert response.status_code == 404


# ============================================================
# CONCEPT 12: AUTHENTICATION
# ============================================================

def test_profile_without_token(client):
    """
    Protected endpoint should reject requests
    without authentication.
    """

    response = client.get("/profile")

    assert response.status_code == 401


# ============================================================
# CONCEPT 13: AUTHENTICATION SUCCESS
# ============================================================

def test_profile_with_valid_token(client):

    headers = {
        "Authorization": "Bearer valid_token"
    }

    response = client.get(
        "/profile",
        headers=headers
    )

    assert response.status_code == 200

    data = response.json()

    assert data["user"]["username"] == "testuser"

    assert data["secret_data"] == "top_secret"


# ============================================================
# CONCEPT 14: AUTHENTICATION FAILURE
# ============================================================

def test_profile_with_invalid_token(client):

    headers = {
        "Authorization": "Bearer wrong_token"
    }

    response = client.get(
        "/profile",
        headers=headers
    )

    assert response.status_code == 401

    assert response.json()["detail"] == "Invalid token"


# ============================================================
# CONCEPT 15: DEPENDENCY OVERRIDING
# ============================================================

def test_profile_with_mocked_auth(client):
    """
    We don't want to test the REAL authentication system here.

    We only want to test:

        "Does /profile correctly handle a user?"

    So we replace get_current_user with a fake dependency.
    """

    # Fake dependency
    def mock_get_current_user():

        return {
            "username": "mocked_admin"
        }

    # Tell FastAPI:
    #
    # Whenever something asks for get_current_user,
    # use mock_get_current_user instead.
    app.dependency_overrides[
        get_current_user
    ] = mock_get_current_user

    # No Authorization header is needed because
    # the real authentication dependency is bypassed.
    response = client.get("/profile")

    assert response.status_code == 200

    assert response.json()["user"]["username"] == "mocked_admin"

    # VERY IMPORTANT:
    #
    # Remove the override after the test.
    #
    # Otherwise other tests could accidentally use
    # the mocked dependency.
    app.dependency_overrides.clear()


# ============================================================
# CONCEPT 16: TESTING THE DEPENDENCY ITSELF
# ============================================================

def test_get_current_user_valid_token():

    result = get_current_user(
        token="valid_token"
    )

    assert result == {
        "username": "testuser"
    }


# ============================================================
# CONCEPT 17: PYTEST.RAISES
# ============================================================

def test_get_current_user_invalid_token():

    with pytest.raises(Exception):

        get_current_user(
            token="wrong_token"
        )


# ============================================================
# CONCEPT 18: TESTING MULTIPLE HTTP METHODS
# ============================================================

def test_full_crud_workflow(client):
    """
    This test demonstrates an end-to-end CRUD flow.

        CREATE
          ↓
        READ
          ↓
        UPDATE
          ↓
        DELETE
    """

    # --------------------------------------------------------
    # CREATE
    # --------------------------------------------------------

    create_response = client.post(
        "/items",
        json={
            "name": "Phone",
            "price": 500
        }
    )

    assert create_response.status_code == 201

    item_id = create_response.json()["item"]["id"]


    # --------------------------------------------------------
    # READ
    # --------------------------------------------------------

    get_response = client.get(
        f"/items/{item_id}"
    )

    assert get_response.status_code == 200

    assert (
        get_response.json()["item"]["name"]
        == "Phone"
    )


    # --------------------------------------------------------
    # UPDATE
    # --------------------------------------------------------

    update_response = client.put(
        f"/items/{item_id}",
        json={
            "name": "iPhone",
            "price": 1000
        }
    )

    assert update_response.status_code == 200

    assert (
        update_response.json()["item"]["name"]
        == "iPhone"
    )


    # --------------------------------------------------------
    # DELETE
    # --------------------------------------------------------

    delete_response = client.delete(
        f"/items/{item_id}"
    )

    assert delete_response.status_code == 200


    # --------------------------------------------------------
    # VERIFY DELETE
    # --------------------------------------------------------

    final_response = client.get(
        f"/items/{item_id}"
    )

    assert final_response.status_code == 404