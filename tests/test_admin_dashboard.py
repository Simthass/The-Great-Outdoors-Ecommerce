# test_admin_dashboard.py — robust against React re-renders
import pytest
import time

from selenium.common.exceptions import (
    StaleElementReferenceException,
    ElementClickInterceptedException,
    TimeoutException,
)
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

from utils import by_testid, wait_visible  # keep your existing helpers


def scroll_into_view(driver, el):
    driver.execute_script(
        "arguments[0].scrollIntoView({block:'center', inline:'center'});", el
    )

def js_click(driver, el):
    driver.execute_script("arguments[0].click();", el)

def safe_click_retry(driver, locator, timeout=10, attempts=3, settle_ms=120):
    """
    Re-find + click every attempt to avoid stale references.
    Adds scroll + JS fallback and a tiny settle after each try.
    """
    last_err = None
    for i in range(attempts):
        try:
            el = WebDriverWait(driver, timeout).until(EC.presence_of_element_located(locator))
            scroll_into_view(driver, el)
            # prefer webdriver click if clickable; else JS click
            try:
                WebDriverWait(driver, timeout).until(EC.element_to_be_clickable(locator)).click()
            except Exception:
                js_click(driver, el)
            # small settle to let DOM stabilize
            time.sleep(settle_ms / 1000.0)
            return
        except (StaleElementReferenceException, ElementClickInterceptedException, TimeoutException) as e:
            last_err = e
            time.sleep(0.15)
    raise last_err or AssertionError("Failed to click after retries")

@pytest.mark.usefixtures("driver")
class TestAdminDashboard:

    def open_admin(self, driver, base_url):
        driver.get(base_url.replace("/login", "/admin"))
        # wait for a stable root before interacting
        wait_visible(driver, by_testid("admin-dashboard-title"))
        # tiny settle helps against initial animations
        time.sleep(0.1)

    def test_dashboard_renders(self, driver, base_url):
        self.open_admin(driver, base_url)
        title = wait_visible(driver, by_testid("admin-dashboard-title"))
        assert "Admin Dashboard" in title.text

        # tiles present
        wait_visible(driver, by_testid("link-user-management"))
        wait_visible(driver, by_testid("link-order-management"))
        wait_visible(driver, by_testid("link-employee-management"))
        wait_visible(driver, by_testid("link-product-management"))
        wait_visible(driver, by_testid("link-inventory-management"))
        wait_visible(driver, by_testid("link-review-management"))
        wait_visible(driver, by_testid("link-other-management"))

    def test_user_management_link(self, driver, base_url):
        self.open_admin(driver, base_url)
        safe_click_retry(driver, by_testid("link-user-management"))
        WebDriverWait(driver, 8).until(EC.url_contains("/Admin/User"))
        assert "/Admin/User" in driver.current_url

    def test_order_management_link(self, driver, base_url):
        self.open_admin(driver, base_url)
        safe_click_retry(driver, by_testid("link-order-management"))
        WebDriverWait(driver, 8).until(EC.url_contains("/Admin/OrderManagement"))
        assert "/Admin/OrderManagement" in driver.current_url

    def test_employee_management_link(self, driver, base_url):
        self.open_admin(driver, base_url)
        safe_click_retry(driver, by_testid("link-employee-management"))
        WebDriverWait(driver, 8).until(EC.url_contains("/Admin/Employee"))
        assert "/Admin/Employee" in driver.current_url

    def test_product_management_link(self, driver, base_url):
        self.open_admin(driver, base_url)
        safe_click_retry(driver, by_testid("link-product-management"))
        WebDriverWait(driver, 8).until(EC.url_contains("/Admin/AdminProduct"))
        assert "/Admin/AdminProduct" in driver.current_url

    def test_inventory_management_link(self, driver, base_url):
        self.open_admin(driver, base_url)
        safe_click_retry(driver, by_testid("link-inventory-management"))
        WebDriverWait(driver, 8).until(EC.url_contains("/Admin/Inventory"))
        assert "/Admin/Inventory" in driver.current_url

    def test_review_management_link(self, driver, base_url):
        self.open_admin(driver, base_url)
        safe_click_retry(driver, by_testid("link-review-management"))
        WebDriverWait(driver, 8).until(EC.url_contains("/Admin/ReviewList"))
        assert "/Admin/ReviewList" in driver.current_url

    def test_other_management_link(self, driver, base_url):
        self.open_admin(driver, base_url)
        safe_click_retry(driver, by_testid("link-other-management"))
        WebDriverWait(driver, 8).until(EC.url_contains("/Admin/EventManagement"))
        assert "/Admin/EventManagement" in driver.current_url
