# tests/test_admin_reviews_list_page.py
import pytest
from urllib.parse import urlparse
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import NoAlertPresentException

from utils import by_testid, wait_visible, wait_clickable


# --- helpers ----------------------------------------------------------------

def _origin(u: str) -> str:
    p = urlparse(u)
    return f"{p.scheme}://{p.netloc}"

def _open_logged_in(driver, base_url: str):
    """Set a dummy token and open the Reviews page (works even if the route is guarded)."""
    driver.get(_origin(base_url) + "/")
    driver.execute_script("window.localStorage.setItem('token','TEST');")
    driver.get(base_url)

def _wait_loaded(driver, timeout=30):
    """Wait until loading ends and either rows or an empty state is visible (desktop or mobile)."""
    def _ready(d):
        # while loading row/spinner present -> keep waiting
        if d.find_elements(*by_testid("reviews-loading")) or d.find_elements(*by_testid("reviews-loading-row")):
            return False
        # accept any ready state
        return (
            d.find_elements(*by_testid("reviews-empty")) or
            d.find_elements(*by_testid("reviews-empty-mobile")) or
            d.find_elements("css selector", "[data-testid^='review-row-']") or
            d.find_elements("css selector", "[data-testid^='review-card-']")
        )
    WebDriverWait(driver, timeout).until(_ready)

def _rows(driver):
    return driver.find_elements("css selector", "[data-testid^='review-row-']")


# --- tests ------------------------------------------------------------------

def test_page_loads_and_header_stats(driver, base_url):
    _open_logged_in(driver, base_url)
    _wait_loaded(driver)

    # Header/title present
    wait_visible(driver, by_testid("reviews-list-page"))
    wait_visible(driver, by_testid("admin-reviews-header"))
    wait_visible(driver, by_testid("admin-reviews-title"))
    # Stats card present
    wait_visible(driver, by_testid("reviews-stats-card"))
    wait_visible(driver, by_testid("total-reviews-count"))


def test_loading_transitions_to_ready_state(driver, base_url):
    _open_logged_in(driver, base_url)
    # Accept any ready outcome (rows or empty)
    _wait_loaded(driver)


def test_filters_and_clear_button(driver, base_url):
    _open_logged_in(driver, base_url)
    _wait_loaded(driver)

    product = wait_visible(driver, by_testid("product-filter-input"))
    customer = wait_visible(driver, by_testid("customer-filter-input"))
    sortsel = wait_visible(driver, by_testid("sort-select"))

    product.clear(); product.send_keys("abc")
    customer.clear(); customer.send_keys("xyz")
    # change sort to a different option
    sortsel.click()
    sortsel.find_element("xpath", ".//option[@value='rating_asc']").click()

    # values changed
    assert product.get_attribute("value") == "abc"
    assert customer.get_attribute("value") == "xyz"
    assert sortsel.get_attribute("value") == "rating_asc"

    # clear
    wait_clickable(driver, by_testid("clear-filters-btn"))
    assert product.get_attribute("value") == ""
    assert customer.get_attribute("value") == ""
    assert sortsel.get_attribute("value") == "date_desc"


def test_add_review_button_navigates(driver, base_url):
    _open_logged_in(driver, base_url)
    _wait_loaded(driver)

    wait_clickable(driver, by_testid("add-review-btn"))
    # Accept either target page or login (if guard kicks in)
    WebDriverWait(driver, 15).until(
        lambda d: "/Admin/ReviewEdit/new" in d.current_url or "/login" in d.current_url.lower()
    )
    # Go back to the page for isolation
    _open_logged_in(driver, base_url)
    _wait_loaded(driver)


def test_review_report_button_navigates(driver, base_url):
    _open_logged_in(driver, base_url)
    _wait_loaded(driver)

    wait_clickable(driver, by_testid("review-report-btn"))
    WebDriverWait(driver, 15).until(
        lambda d: "/Admin/ReportGeneration/reviewReport" in d.current_url or "/login" in d.current_url.lower()
    )


def test_table_row_shape_if_any(driver, base_url):
    _open_logged_in(driver, base_url)
    _wait_loaded(driver)

    rows = _rows(driver)
    if not rows:
        pytest.skip("No review rows present to validate shape.")

    row = rows[0]
    # Each cell within the row should exist
    assert row.find_elements(*by_testid("product-cell"))
    assert row.find_elements(*by_testid("customer-cell"))
    assert row.find_elements(*by_testid("reviewid-cell"))
    assert row.find_elements(*by_testid("status-badge"))
    assert row.find_elements(*by_testid("date-cell"))


def test_delete_cancel_keeps_row_if_any(driver, base_url):
    _open_logged_in(driver, base_url)
    _wait_loaded(driver)

    rows_before = _rows(driver)
    if not rows_before:
        pytest.skip("No rows available to exercise delete flow.")

    # Click first delete button
    delete_btns = driver.find_elements("css selector", "[data-testid^='delete-review-btn-']")
    if not delete_btns:
        pytest.skip("No delete buttons found.")
    delete_btns[0].click()

    # Dismiss confirm() if it appears
    try:
        WebDriverWait(driver, 5).until(EC.alert_is_present())
        driver.switch_to.alert.dismiss()
    except NoAlertPresentException:
        pass

    # After cancel, row count should remain the same (re-query to avoid stales)
    WebDriverWait(driver, 3).until(lambda d: True)  # tiny settle wait
    rows_after = _rows(driver)
    assert len(rows_after) == len(rows_before)


@pytest.mark.xfail(strict=False, reason="Only passes if backend allows delete in test env.")
def test_delete_confirm_removes_row_if_backend_allows(driver, base_url):
    _open_logged_in(driver, base_url)
    _wait_loaded(driver)

    rows_before = _rows(driver)
    if not rows_before:
        pytest.skip("No rows available to exercise delete flow.")

    # Click first delete button and ACCEPT to delete
    delete_btns = driver.find_elements("css selector", "[data-testid^='delete-review-btn-']")
    delete_btns[0].click()

    try:
        WebDriverWait(driver, 5).until(EC.alert_is_present())
        driver.switch_to.alert.accept()
    except NoAlertPresentException:
        pytest.skip("No confirm dialog appeared; cannot verify delete path.")

    # Expect one fewer row (allow some time for re-render)
    WebDriverWait(driver, 10).until(lambda d: len(_rows(d)) <= max(0, len(rows_before) - 1))
