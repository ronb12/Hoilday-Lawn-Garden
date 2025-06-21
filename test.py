import requests
from bs4 import BeautifulSoup
import sys
import time

class TestRunner:
    def __init__(self):
        self.base_url = "http://localhost:8000"
        self.session = requests.Session()
        self.test_results = []

    def run_tests(self):
        print("Starting automated tests...")
        
        # Test server connection
        self.test_server_connection()
        
        # Test pages
        self.test_page("index.html", "Home Page")
        self.test_page("admin-login.html", "Admin Login")
        self.test_page("login.html", "Customer Login")
        self.test_page("register.html", "Customer Registration")
        self.test_page("customer-dashboard.html", "Customer Dashboard")
        self.test_page("admin-dashboard.html", "Admin Dashboard")
        self.test_page("pay-your-bill.html", "Payment Page")
        
        # Test mobile responsiveness
        self.test_mobile_responsiveness()
        
        # Print results
        self.print_results()

    def test_server_connection(self):
        try:
            response = requests.get(self.base_url)
            self.record_result("Server Connection", response.status_code == 200)
        except requests.exceptions.ConnectionError:
            self.record_result("Server Connection", False, "Server not running")

    def test_page(self, page, name):
        try:
            response = requests.get(f"{self.base_url}/{page}")
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Check for required elements
            has_title = bool(soup.find('title'))
            has_nav = bool(soup.find('nav'))
            has_footer = bool(soup.find('footer'))
            has_main_content = bool(soup.find('main'))
            
            # Check for mobile meta tag
            has_viewport = bool(soup.find('meta', attrs={'name': 'viewport'}))
            
            # Check for required scripts
            has_firebase = bool(soup.find('script', attrs={'src': lambda x: x and 'firebase' in x}))
            
            success = all([has_title, has_nav, has_footer, has_main_content, has_viewport, has_firebase])
            self.record_result(f"{name} Test", success)
            
        except Exception as e:
            self.record_result(f"{name} Test", False, str(e))

    def test_mobile_responsiveness(self):
        pages = [
            "index.html",
            "admin-dashboard.html",
            "customer-dashboard.html",
            "login.html",
            "register.html",
            "pay-your-bill.html"
        ]
        
        for page in pages:
            try:
                response = requests.get(f"{self.base_url}/{page}")
                soup = BeautifulSoup(response.text, 'html.parser')
                
                # Check for mobile-specific elements
                has_mobile_nav = bool(soup.find(class_='nav-menu'))
                has_mobile_styles = bool(soup.find('link', attrs={'href': lambda x: x and 'mobile' in x}))
                
                success = all([has_mobile_nav, has_mobile_styles])
                self.record_result(f"Mobile Responsiveness - {page}", success)
                
            except Exception as e:
                self.record_result(f"Mobile Responsiveness - {page}", False, str(e))

    def record_result(self, test_name, success, error=None):
        self.test_results.append({
            'name': test_name,
            'success': success,
            'error': error
        })

    def print_results(self):
        print("\nTest Results:")
        print("-" * 50)
        
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result['success'])
        
        for result in self.test_results:
            status = "✓ PASS" if result['success'] else "✗ FAIL"
            print(f"{status} - {result['name']}")
            if not result['success'] and result['error']:
                print(f"   Error: {result['error']}")
        
        print("-" * 50)
        print(f"Total Tests: {total_tests}")
        print(f"Passed: {passed_tests}")
        print(f"Failed: {total_tests - passed_tests}")
        
        if passed_tests < total_tests:
            sys.exit(1)

if __name__ == "__main__":
    # Wait for server to start
    print("Waiting for server to start...")
    time.sleep(2)
    
    # Run tests
    runner = TestRunner()
    runner.run_tests() 