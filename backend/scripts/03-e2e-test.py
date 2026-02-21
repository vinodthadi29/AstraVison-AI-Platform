#!/usr/bin/env python3
"""
End-to-End Integration Test for AstraVision
Tests the complete pipeline: Register → Login → Upload → Embed → Store → Search → Display
"""

import os
import sys
import time
import json
import logging
import requests
from io import BytesIO
from PIL import Image
import numpy as np

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - [%(levelname)s] %(message)s'
)
logger = logging.getLogger(__name__)

class AstraVisionE2ETest:
    def __init__(self, base_url='http://localhost:5000'):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.session = requests.Session()
        self.test_email = f"e2e_test_{int(time.time())}@test.local"
        self.test_password = "TestPassword123!"
        self.access_token = None
        self.user_id = None
        self.uploaded_image_id = None
        
    def log_test(self, stage, message, status='INFO'):
        """Log test progress."""
        symbol = "✓" if status == "PASS" else "✗" if status == "FAIL" else "→"
        print(f"\n{symbol} [{stage}] {message}")
        
    def check_health(self):
        """1. Check if backend is running."""
        self.log_test("HEALTH", "Checking backend health...")
        try:
            response = requests.get(f"{self.api_url}/health")
            if response.status_code == 200:
                self.log_test("HEALTH", "Backend is online", "PASS")
                return True
            else:
                self.log_test("HEALTH", f"Unexpected status: {response.status_code}", "FAIL")
                return False
        except Exception as e:
            self.log_test("HEALTH", f"Backend unreachable: {e}", "FAIL")
            return False
    
    def register_user(self):
        """2. Register a new test user."""
        self.log_test("REGISTER", f"Registering user: {self.test_email}...")
        try:
            response = self.session.post(
                f"{self.api_url}/auth/register",
                json={
                    "email": self.test_email,
                    "password": self.test_password
                }
            )
            
            if response.status_code == 201:
                data = response.json()
                if data.get('success'):
                    self.access_token = data['data']['access_token']
                    self.user_id = data['data']['user']['id']
                    self.log_test("REGISTER", f"User registered: {self.user_id}", "PASS")
                    return True
            
            self.log_test("REGISTER", f"Registration failed: {response.text}", "FAIL")
            return False
        except Exception as e:
            self.log_test("REGISTER", f"Registration error: {e}", "FAIL")
            return False
    
    def login_user(self):
        """3. Login with the test user."""
        self.log_test("LOGIN", f"Logging in: {self.test_email}...")
        try:
            response = self.session.post(
                f"{self.api_url}/auth/login",
                json={
                    "email": self.test_email,
                    "password": self.test_password
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    self.access_token = data['data']['access_token']
                    self.user_id = data['data']['user']['id']
                    self.session.headers.update({
                        "Authorization": f"Bearer {self.access_token}"
                    })
                    self.log_test("LOGIN", "Login successful", "PASS")
                    return True
            
            self.log_test("LOGIN", f"Login failed: {response.text}", "FAIL")
            return False
        except Exception as e:
            self.log_test("LOGIN", f"Login error: {e}", "FAIL")
            return False
    
    def upload_image(self):
        """4. Upload a test image."""
        self.log_test("UPLOAD", "Generating and uploading test image...")
        try:
            # Generate random test image
            img_array = np.random.randint(0, 256, (256, 256, 3), dtype=np.uint8)
            img = Image.fromarray(img_array)
            
            # Convert to bytes
            img_bytes = BytesIO()
            img.save(img_bytes, format='PNG')
            img_bytes.seek(0)
            
            upload_start = time.time()
            response = self.session.post(
                f"{self.api_url}/images/upload",
                files={'file': ('test_image.png', img_bytes, 'image/png')}
            )
            upload_time = (time.time() - upload_start) * 1000
            
            if response.status_code == 201:
                data = response.json()
                if data.get('success'):
                    self.uploaded_image_id = data['data']['id']
                    size = data['data']['size']
                    self.log_test("UPLOAD", 
                        f"Image uploaded: {self.uploaded_image_id[:8]}... ({size} bytes, {upload_time:.2f}ms)", 
                        "PASS")
                    return True
            
            self.log_test("UPLOAD", f"Upload failed: {response.text}", "FAIL")
            return False
        except Exception as e:
            self.log_test("UPLOAD", f"Upload error: {e}", "FAIL")
            return False
    
    def verify_embedding(self):
        """5. Verify embedding was stored."""
        self.log_test("EMBEDDING", f"Verifying embedding for image {self.uploaded_image_id[:8]}...")
        try:
            response = self.session.get(
                f"{self.api_url}/images/{self.uploaded_image_id}"
            )
            
            if response.status_code == 200:
                data = response.json()
                image_data = data.get('image', {})
                embedding = image_data.get('embedding', [])
                
                if embedding and len(embedding) == 1280:
                    self.log_test("EMBEDDING", 
                        f"Valid embedding found: {len(embedding)} dimensions", "PASS")
                    return True
                else:
                    self.log_test("EMBEDDING", 
                        f"Invalid embedding: {len(embedding) if embedding else 0} dimensions", "FAIL")
                    return False
            
            self.log_test("EMBEDDING", f"Verification failed: {response.text}", "FAIL")
            return False
        except Exception as e:
            self.log_test("EMBEDDING", f"Embedding verification error: {e}", "FAIL")
            return False
    
    def search_similar_images(self):
        """6. Search for similar images."""
        self.log_test("SEARCH", f"Searching for images similar to {self.uploaded_image_id[:8]}...")
        try:
            search_start = time.time()
            response = self.session.post(
                f"{self.api_url}/images/search?image_id={self.uploaded_image_id}&limit=5"
            )
            search_time = (time.time() - search_start) * 1000
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    results = data['data']['results']
                    processing_time = data['data']['processing_time_ms']
                    
                    self.log_test("SEARCH", 
                        f"Found {len(results)} similar images ({processing_time}ms processing)", 
                        "PASS")
                    
                    # Log results
                    for i, result in enumerate(results[:3]):
                        score = result['similarity_score']
                        filename = result['filename']
                        logger.info(f"  #{i+1}: {filename} (similarity: {score:.2f}%)")
                    
                    return len(results) > 0
            
            self.log_test("SEARCH", f"Search failed: {response.text}", "FAIL")
            return False
        except Exception as e:
            self.log_test("SEARCH", f"Search error: {e}", "FAIL")
            return False
    
    def run_full_pipeline(self):
        """Run complete E2E test pipeline."""
        print("\n" + "="*60)
        print("🚀 AstraVision E2E Integration Test")
        print("="*60)
        
        tests = [
            self.check_health,
            self.register_user,
            self.login_user,
            self.upload_image,
            self.verify_embedding,
            self.search_similar_images,
        ]
        
        results = []
        for test in tests:
            try:
                result = test()
                results.append((test.__name__, result))
                if not result:
                    logger.error(f"Test {test.__name__} failed - stopping pipeline")
                    break
            except Exception as e:
                logger.error(f"Unexpected error in {test.__name__}: {e}")
                results.append((test.__name__, False))
                break
        
        # Print summary
        print("\n" + "="*60)
        print("📊 Test Summary")
        print("="*60)
        
        passed = sum(1 for _, result in results if result)
        total = len(results)
        
        for test_name, result in results:
            status = "✓ PASS" if result else "✗ FAIL"
            print(f"{status} - {test_name}")
        
        print(f"\n{passed}/{total} tests passed")
        
        if passed == total:
            print("\n🎉 All tests passed! System is operational.")
            return True
        else:
            print(f"\n⚠️ {total - passed} test(s) failed. Please review logs above.")
            return False


def main():
    """Main entry point."""
    import argparse
    
    parser = argparse.ArgumentParser(description='AstraVision E2E Integration Test')
    parser.add_argument('--url', default='http://localhost:5000', 
                       help='Backend base URL (default: http://localhost:5000)')
    args = parser.parse_args()
    
    tester = AstraVisionE2ETest(base_url=args.url)
    success = tester.run_full_pipeline()
    
    sys.exit(0 if success else 1)


if __name__ == '__main__':
    main()
