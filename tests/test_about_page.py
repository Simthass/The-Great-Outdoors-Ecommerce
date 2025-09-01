# test_about_page.py
import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

from utils import by_testid, wait_visible

@pytest.fixture
def about_url(base_url):
    # Use exactly what user passes, no extra /about
    return base_url.rstrip("/")

def test_about_smoke(driver, about_url):
    driver.get(about_url)
    wait_visible(driver, by_testid("about-page"))
    wait_visible(driver, by_testid("about-hero"))
    wait_visible(driver, by_testid("about-hero-title"))
    wait_visible(driver, by_testid("about-tagline"))
    wait_visible(driver, by_testid("about-hero-image"))
    wait_visible(driver, by_testid("about-features"))
    wait_visible(driver, by_testid("about-inception-section"))
    wait_visible(driver, by_testid("about-commitment-section"))
    wait_visible(driver, by_testid("about-reviews"))
    wait_visible(driver, by_testid("about-reviews-row-1"))
    wait_visible(driver, by_testid("about-reviews-row-2"))

def test_feature_images_load(driver, about_url):
    driver.get(about_url)
    for tid in ["about-hero-image", "about-inception-image", "about-commitment-image"]:
        img = wait_visible(driver, by_testid(tid))
        # Best-effort check that image has a loaded size (not 0x0)
        natural_w = driver.execute_script("return arguments[0].naturalWidth", img)
        assert natural_w and natural_w > 0, f"Image {tid} did not load"

def test_inception_block_text(driver, about_url):
    driver.get(about_url)
    title = wait_visible(driver, by_testid("about-inception-title"))
    body = wait_visible(driver, by_testid("about-inception-text"))
    assert "Inception Vision" in title.text
    assert len(body.text) > 40  # sanity check that content is present

def test_commitment_block_text(driver, about_url):
    driver.get(about_url)
    title = wait_visible(driver, by_testid("about-commitment-title"))
    body = wait_visible(driver, by_testid("about-commitment-text"))
    assert "Commitment" in title.text
    assert len(body.text) > 30

def test_reviews_six_cards_and_stars(driver, about_url):
    driver.get(about_url)
    # There should be 6 review cards
    cards = []
    for i in range(1, 7):
        cards.append(wait_visible(driver, by_testid(f"review-card-{i}")))
        # Name + Role present
        wait_visible(driver, by_testid(f"review-name-{i}"))
        wait_visible(driver, by_testid(f"review-role-{i}"))
        # 5 stars inside each 'review-stars-i'
        stars_container = wait_visible(driver, by_testid(f"review-stars-{i}"))
        svgs = stars_container.find_elements(By.TAG_NAME, "svg")
        assert len(svgs) >= 5  # tolerate if you later add half-stars etc.

    assert len(cards) == 6
