# tests/conftest.py
import os
import pytest
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from urllib.parse import urlsplit, urlunsplit
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait


def pytest_addoption(parser):
    parser.addoption(
        "--headless",
        action="store_true",
        default=False,
        help="Run browser in headless mode",
    )
    parser.addoption(
        "--base-url",
        action="store",
        default=None,
        help="Override base URL (e.g. http://localhost:5173)",
    )


@pytest.fixture(scope="session")
def base_url(request):
    """
    Default points to /login to match earlier tests.
    Override via:
      - CLI:  pytest --base-url http://localhost:5173/login
      - ENV:  E2E_BASE_URL=http://localhost:5173/login
    """
    cli_url = request.config.getoption("--base-url")
    env_url = os.getenv("E2E_BASE_URL")
    return (cli_url or env_url or "http://localhost:5173/login").rstrip("/")


@pytest.fixture(scope="session")
def _headless(request):
    return request.config.getoption("--headless")


@pytest.fixture
def driver(_headless):
    opts = Options()
    if _headless:
        # Use new headless for Chrome 109+
        opts.add_argument("--headless=new")
    opts.add_argument("--window-size=1366,900")
    opts.add_argument("--disable-gpu")
    opts.add_argument("--no-sandbox")
    opts.add_argument("--disable-dev-shm-usage")
    opts.add_argument("--disable-infobars")
    opts.add_argument("--disable-extensions")
    opts.add_experimental_option("excludeSwitches", ["enable-automation"])
    opts.add_experimental_option("useAutomationExtension", False)

    # If chromedriver isn't on PATH, webdriver-manager will fetch it
    service = Service(ChromeDriverManager().install())
    drv = webdriver.Chrome(service=service, options=opts)

    # Sensible defaults
    drv.implicitly_wait(2)          # implicit waits for find_element
    drv.set_page_load_timeout(30)   # page load timeout

    try:
        yield drv
    finally:
        drv.quit()

# ====== ADD BELOW YOUR EXISTING CONTENT IN tests/conftest.py ======


def _origin_of(url: str) -> str:
    """Return just the origin (scheme://host[:port]/) so localStorage is same-origin."""
    p = urlsplit(url)
    return urlunsplit((p.scheme, p.netloc, "/", "", ""))

@pytest.fixture
def wait(driver):
    """Explicit wait bound to this driver (20s)."""
    return WebDriverWait(driver, 20)

@pytest.fixture
def by_testid():
    """Selector helper for data-testid attributes."""
    def _sel(tid: str):
        return (By.CSS_SELECTOR, f'[data-testid="{tid}"]')
    return _sel

@pytest.fixture
def set_token(driver, base_url):
    """
    Put a JWT in localStorage BEFORE visiting protected routes.
    Set E2E_JWT in your shell to a valid token for your app.
    """
    import os, pytest
    jwt = os.getenv("E2E_JWT")

    def _set():
        if not jwt:
            pytest.skip("E2E_JWT env var not set; cannot access protected routes.")
        # Navigate to same origin so localStorage write is allowed
        driver.get(_origin_of(base_url))
        driver.execute_script(
            "window.localStorage.setItem('token', arguments[0]);",
            jwt,
        )
    return _set

@pytest.fixture
def goto_settings(driver, wait, base_url, set_token, by_testid):
    """
    Navigate to the settings page and wait until it renders
    (or shows an auth error if the token is invalid).
    Works whether --base-url includes /settings (or /usersettings) or not.
    """
    def _go():
        set_token()

        lower = base_url.lower().rstrip("/")
        if lower.endswith("/settings") or lower.endswith("/usersettings"):
            target = base_url
        else:
            target = base_url.rstrip("/") + "/settings"

        driver.get(target)

        # Selenium-agnostic 'any-of': succeed when either element exists
        wait.until(
            lambda d: d.find_elements(*by_testid("tab-notifications"))
                   or d.find_elements(*by_testid("auth-error"))
        )
    return _go
# ====== END ADD ======
