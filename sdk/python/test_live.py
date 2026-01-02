from helm_analytics import HelmAnalytics
import time
import sys

# Use the Site ID you were using for funnels
SITE_ID = "e3d3d060-dc0d-4301-894a-5994f65e2216"

def test_sdk():
    print(f"Initializing Helm Analytics with Site ID: {SITE_ID}")
    helm = HelmAnalytics(site_id=SITE_ID)
    
    # Mocking a request object for testing
    class MockRequest:
        url = "http://test-python-sdk.com/integration-test"
        remote_addr = "1.2.3.4"
        headers = {
            "User-Agent": "Helm-Python-SDK-Test/1.0",
            "Referer": "http://pypi.org"
        }

    print("Sending test event: 'pageview'...")
    helm.track(MockRequest(), event_type="pageview", metadata={"status": "success"})
    
    # Wait a bit for the background thread to fire
    time.sleep(2)
    print("Event sent! Check your dashboard.")

if __name__ == "__main__":
    try:
        test_sdk()
    except ImportError:
        print("Error: helm_analytics package not found.")
        print("Please run: pip install helm-analytics")
