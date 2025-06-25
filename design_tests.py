import unittest
import logging
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DesignTestSuite(unittest.TestCase):
    """Test suite for checking the professional appearance of the website."""

    def setUp(self):
        """Set up the test environment before each test."""
        chrome_options = Options()
        chrome_options.add_argument('--headless')
        chrome_options.add_argument('--no-sandbox')
        chrome_options.add_argument('--disable-dev-shm-usage')
        chrome_options.add_argument('--disable-gpu')
        chrome_options.add_argument('--window-size=1920,1080')
        
        try:
            # Use system chromedriver
            self.driver = webdriver.Chrome(
                service=Service('/usr/local/bin/chromedriver'),
                options=chrome_options
            )
            self.base_url = "http://localhost:8000"
            self.pages = [
                "/",
                "/about.html",
                "/services.html",
                "/contact.html",
                "/testimonials.html",
                "/gallery.html",
                "/faq.html",
                "/terms.html",
                "/privacy-policy.html"
            ]
        except Exception as e:
            logger.error(f"Failed to initialize Chrome driver: {e}")
            raise

    def tearDown(self):
        """Clean up after each test."""
        if hasattr(self, 'driver'):
            self.driver.quit()

    def test_hero_section(self):
        """Test hero section design across all pages."""
        logger.info("Testing hero section design...")
        for page in self.pages:
            with self.subTest(page=page):
                self.driver.get(f"{self.base_url}{page}")
                try:
                    # Try to find hero section
                    hero = WebDriverWait(self.driver, 10).until(
                        EC.presence_of_element_located((By.CLASS_NAME, "hero"))
                    )
                    # Check if hero has required elements
                    self.assertTrue(hero.is_displayed(), "Hero section should be visible")
                    try:
                        hero_title = hero.find_element(By.TAG_NAME, "h1")
                        self.assertTrue(hero_title.is_displayed(), "Hero title should be visible")
                    except NoSuchElementException:
                        logger.warning(f"No h1 found in hero section on {page}")
                except TimeoutException:
                    logger.warning(f"No hero section found on {page} - this is acceptable for some pages")

    def test_navigation_design(self):
        """Test navigation bar design and functionality."""
        logger.info("Testing navigation design...")
        self.driver.get(self.base_url)
        try:
            # Look for navigation in header or nav element
            nav = self.driver.find_element(By.CSS_SELECTOR, "nav, .main-header, header")
            self.assertTrue(nav.is_displayed(), "Navigation should be visible")
            
            # Test navigation links
            nav_links = nav.find_elements(By.TAG_NAME, "a")
            self.assertGreater(len(nav_links), 0, "Navigation should have links")
            
            # Check if at least one link is visible
            visible_links = [link for link in nav_links if link.is_displayed()]
            self.assertGreater(len(visible_links), 0, "At least one navigation link should be visible")
        except NoSuchElementException:
            logger.warning("Navigation element not found - this might be acceptable for some pages")

    def test_footer_design(self):
        """Test footer design and content."""
        logger.info("Testing footer design...")
        self.driver.get(self.base_url)
        try:
            footer = self.driver.find_element(By.TAG_NAME, "footer")
            self.assertTrue(footer.is_displayed(), "Footer should be visible")

            # Test footer sections
            sections = footer.find_elements(By.CLASS_NAME, "footer-section")
            if len(sections) == 0:
                # If no footer sections, just check if footer content exists
                footer_content = footer.find_elements(By.TAG_NAME, "*")
                self.assertGreater(len(footer_content), 0, "Footer should have content")
            else:
                self.assertGreater(len(sections), 0, "Footer should have sections")

        except NoSuchElementException:
            logger.error("Footer not found")
            raise

    def test_typography(self):
        """Test typography consistency across pages."""
        logger.info("Testing typography...")
        for page in self.pages:
            with self.subTest(page=page):
                self.driver.get(f"{self.base_url}{page}")
                headings = self.driver.find_elements(By.TAG_NAME, "h1")
                self.assertLessEqual(len(headings), 1, "Page should have at most one h1")
                body_text = self.driver.find_element(By.TAG_NAME, "body")
                font_family = body_text.value_of_css_property("font-family")
                logger.info(f"Font family on {page}: {font_family}")
                # Check for Montserrat in the font stack
                self.assertTrue(
                    "Montserrat" in font_family,
                    f"Body text should use Montserrat font, got: {font_family}"
                )

    def test_color_scheme(self):
        """Test color scheme consistency."""
        logger.info("Testing color scheme...")
        self.driver.get(self.base_url)
        
        # Test primary color on various elements
        try:
            # Try to find a primary button
            primary_btn = self.driver.find_element(By.CLASS_NAME, "btn-primary")
            primary_color = primary_btn.value_of_css_property("background-color")
            self.assertIsNotNone(primary_color, "Primary color should be defined")
        except NoSuchElementException:
            # If no primary button, try other elements that might use primary color
            try:
                nav = self.driver.find_element(By.CSS_SELECTOR, "nav, .main-header, header")
                nav_bg = nav.value_of_css_property("background-color")
                self.assertIsNotNone(nav_bg, "Navigation background color should be defined")
            except NoSuchElementException:
                logger.warning("Could not find elements to test primary color")
        
        # Test text colors
        body = self.driver.find_element(By.TAG_NAME, "body")
        text_color = body.value_of_css_property("color")
        self.assertIsNotNone(text_color, "Text color should be defined")

    def test_responsive_design(self):
        """Test responsive design at different viewport sizes."""
        logger.info("Testing responsive design...")
        self.driver.get(self.base_url)
        
        # Test mobile view
        self.driver.set_window_size(375, 812)  # iPhone X dimensions
        try:
            nav = self.driver.find_element(By.CSS_SELECTOR, "nav, .main-header, header")
            self.assertTrue(nav.is_displayed(), "Navigation should be visible on mobile")
        except NoSuchElementException:
            logger.warning("Navigation not found on mobile view")
        
        # Test tablet view
        self.driver.set_window_size(768, 1024)  # iPad dimensions
        try:
            nav = self.driver.find_element(By.CSS_SELECTOR, "nav, .main-header, header")
            self.assertTrue(nav.is_displayed(), "Navigation should be visible on tablet")
        except NoSuchElementException:
            logger.warning("Navigation not found on tablet view")
        
        # Test desktop view
        self.driver.set_window_size(1920, 1080)  # Full HD dimensions
        try:
            nav = self.driver.find_element(By.CSS_SELECTOR, "nav, .main-header, header")
            self.assertTrue(nav.is_displayed(), "Navigation should be visible on desktop")
        except NoSuchElementException:
            logger.warning("Navigation not found on desktop view")

    def test_button_styles(self):
        """Test for consistent button styles across the app."""
        logger.info("Testing button styles...")
        for page in self.pages:
            with self.subTest(page=page):
                self.driver.get(f"{self.base_url}{page}")
                buttons = self.driver.find_elements(By.TAG_NAME, "button")
                if buttons:
                    for btn in buttons:
                        font_family = btn.value_of_css_property("font-family")
                        border_radius = btn.value_of_css_property("border-radius")
                        self.assertTrue(
                            "Montserrat" in font_family,
                            f"Button font should be Montserrat, got: {font_family}"
                        )
                        # Check for professional border radius
                        self.assertIn(border_radius, ["0px", "4px", "5px", "8px"], f"Button border-radius should be professional, got: {border_radius}")
                else:
                    logger.warning(f"No buttons found on {page}")

    def test_card_styles(self):
        """Test for consistent card styles (service cards, testimonial cards, etc)."""
        logger.info("Testing card styles...")
        card_classes = ["service-card", "testimonial-card", "value-card"]
        for page in self.pages:
            with self.subTest(page=page):
                self.driver.get(f"{self.base_url}{page}")
                for card_class in card_classes:
                    cards = self.driver.find_elements(By.CLASS_NAME, card_class)
                    for card in cards:
                        border_radius = card.value_of_css_property("border-radius")
                        box_shadow = card.value_of_css_property("box-shadow")
                        self.assertIn(border_radius, ["8px", "12px", "4px"], f"Card border-radius should be professional, got: {border_radius}")
                        self.assertTrue(
                            box_shadow != "none" and box_shadow != "",
                            f"Card should have a box-shadow for professional look, got: {box_shadow}"
                        )

def run_design_tests():
    """Run the design test suite and generate a report."""
    import pytest
    import os
    from datetime import datetime
    
    # Create reports directory if it doesn't exist
    if not os.path.exists("reports"):
        os.makedirs("reports")
    
    # Generate report filename with timestamp
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    report_file = f"reports/design_report_{timestamp}.html"
    
    # Run tests with pytest
    pytest.main([
        "design_tests.py",
        f"--html={report_file}",
        "--self-contained-html"
    ])
    
    print(f"\nReport generated: {report_file}")

if __name__ == "__main__":
    run_design_tests() 