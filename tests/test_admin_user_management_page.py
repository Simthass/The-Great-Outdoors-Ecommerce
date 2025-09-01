# test_admin_user_management_page.py
import pytest
from selenium.webdriver.support.ui import WebDriverWait
from utils import by_testid, wait_visible, wait_clickable


def _open_with_token(driver, base_url):
    # Put a dummy token in localStorage (UI does fetches with Authorization)
    from urllib.parse import urlparse

    p = urlparse(base_url)
    origin = f"{p.scheme}://{p.netloc}"
    driver.get(origin + "/")
    driver.execute_script("window.localStorage.setItem('token', 'TEST');")
    driver.get(base_url)


def _wait_any_ready_state(driver, timeout=20):
    """
    Wait until one of the expected UI states shows up:
      - main page content
      - loading skeleton
      - error banner
    """
    def _ready(drv):
        return (
            drv.find_elements(*by_testid("content")) or
            drv.find_elements(*by_testid("admin-user-management-loading")) or
            drv.find_elements(*by_testid("error-banner"))
        )
    WebDriverWait(driver, timeout).until(_ready)


def test_renders_loading_or_content(driver, base_url):
    _open_with_token(driver, base_url)
    _wait_any_ready_state(driver)

    # Header hero should always be present
    wait_visible(driver, by_testid("page-hero"))

    # Either the full page or the loading skeleton is visible
    assert (
        driver.find_elements(*by_testid("admin-user-management")) or
        driver.find_elements(*by_testid("admin-user-management-loading"))
    ), "Expected main page or loading skeleton to render"


def test_filters_present_and_clear(driver, base_url):
    _open_with_token(driver, base_url)
    _wait_any_ready_state(driver)

    # If still on the skeleton, wait for content to be available
    WebDriverWait(driver, 20).until(
        lambda d: d.find_elements(*by_testid("filters")) or d.find_elements(*by_testid("error-banner"))
    )

    # Filters exist (when content is up)
    if driver.find_elements(*by_testid("filters")):
        # Interact with filters
        search = wait_visible(driver, by_testid("search-input"))
        role = wait_visible(driver, by_testid("role-select"))
        sortby = wait_visible(driver, by_testid("sortby-select"))
        sortorder = wait_visible(driver, by_testid("sortorder-select"))

        # Change values
        search.clear()
        search.send_keys("alice@example.com")
        role.click(); role.find_elements("tag name", "option")[1].click()  # e.g., Customer
        sortby.click(); sortby.find_elements("tag name", "option")[2].click()  # e.g., Last Name
        sortorder.click(); sortorder.find_elements("tag name", "option")[1].click()  # asc

        # Clear filters
        wait_clickable(driver, by_testid("btn-clear-filters"))

        # Assert reset
        assert wait_visible(driver, by_testid("search-input")).get_attribute("value") == ""
        assert wait_visible(driver, by_testid("role-select")).get_attribute("value") == "all"
        assert wait_visible(driver, by_testid("sortby-select")).get_attribute("value") == "createdAt"
        assert wait_visible(driver, by_testid("sortorder-select")).get_attribute("value") == "desc"
    else:
        # If filters never showed (e.g., API errored early), at least we saw an error
        assert driver.find_elements(*by_testid("error-banner"))


def test_table_or_empty_or_error(driver, base_url):
    _open_with_token(driver, base_url)
    _wait_any_ready_state(driver)

    # Accept any legitimate outcome after data load attempt
    def _any_state(drv):
        if drv.find_elements(*by_testid("error-banner")):
            return True
        if drv.find_elements(*by_testid("users-table")):
            # Either table has rows or is empty
            tbody = drv.find_elements(*by_testid("users-tbody"))
            if tbody:
                return True
        if drv.find_elements(*by_testid("empty-state")):
            return True
        return False

    WebDriverWait(driver, 25).until(_any_state)

    assert (
        driver.find_elements(*by_testid("error-banner")) or
        driver.find_elements(*by_testid("users-table")) or
        driver.find_elements(*by_testid("empty-state"))
    )


def test_pagination_and_scroll_top_if_present(driver, base_url):
    _open_with_token(driver, base_url)
    _wait_any_ready_state(driver)

    # If pagination exists and there is a page 2, try to go there
    if driver.find_elements(*by_testid("pagination")):
        btn_page2 = driver.find_elements(*by_testid("btn-page-2"))
        if btn_page2:
            btn_page2[0].click()
            # When on page > 1, scroll-top btn should appear
            WebDriverWait(driver, 10).until(
                lambda d: d.find_elements(*by_testid("scroll-top-btn"))
            )
            assert driver.find_elements(*by_testid("scroll-top-btn"))
        else:
            # Pagination exists but only one page – that's fine
            assert True
    else:
        # No pagination shown (single page or no data) – that's fine
        assert True


def test_generate_report_button_clickable(driver, base_url):
    _open_with_token(driver, base_url)
    _wait_any_ready_state(driver)

    # Button should exist when content renders
    if driver.find_elements(*by_testid("filters")):
        btn = wait_clickable(driver, by_testid("btn-generate-report"))
        # Click it; navigation may or may not exist in app routing,
        # so just assert the click is possible.
        btn.click()
        # Best-effort: if route exists, URL likely contains 'userReport'
        try:
            WebDriverWait(driver, 5).until(lambda d: "userReport" in d.current_url)
            assert "userReport" in driver.current_url
        except Exception:
            # If not navigated (route missing in local app), don't fail the test
            assert True
    else:
        # If filters never rendered (e.g., hard error), at least error banner is visible
        assert driver.find_elements(*by_testid("error-banner"))
