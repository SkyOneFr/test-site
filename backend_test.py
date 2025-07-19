#!/usr/bin/env python3
"""
Backend API Testing Suite for L'envers Website
Tests all backend endpoints according to test_result.md priorities
"""

import requests
import json
import uuid
from datetime import datetime, date
import os
import sys

# Get backend URL from frontend .env file
def get_backend_url():
    try:
        with open('/app/frontend/.env', 'r') as f:
            for line in f:
                if line.startswith('REACT_APP_BACKEND_URL='):
                    return line.split('=', 1)[1].strip()
    except Exception as e:
        print(f"Error reading frontend .env: {e}")
        return None

BASE_URL = get_backend_url()
if not BASE_URL:
    print("ERROR: Could not get REACT_APP_BACKEND_URL from frontend/.env")
    sys.exit(1)

API_BASE = f"{BASE_URL}/api"
print(f"Testing backend at: {API_BASE}")

class BackendTester:
    def __init__(self):
        self.results = {
            "health_check": {"status": "PENDING", "details": ""},
            "database_connection": {"status": "PENDING", "details": ""},
            "reservation_create": {"status": "PENDING", "details": ""},
            "reservation_get": {"status": "PENDING", "details": ""},
            "events_get": {"status": "PENDING", "details": ""},
            "events_create": {"status": "PENDING", "details": ""},
            "newsletter_subscribe": {"status": "PENDING", "details": ""},
            "newsletter_duplicate": {"status": "PENDING", "details": ""},
            "contact_form": {"status": "PENDING", "details": ""}
        }
        
    def test_health_check(self):
        """Test /api/health endpoint"""
        print("\n=== Testing API Health Check ===")
        try:
            response = requests.get(f"{API_BASE}/health", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("status") == "healthy" and data.get("service") == "L'envers API":
                    self.results["health_check"] = {
                        "status": "PASS", 
                        "details": f"Health check successful. Response: {data}"
                    }
                    print("✅ Health check PASSED")
                else:
                    self.results["health_check"] = {
                        "status": "FAIL", 
                        "details": f"Unexpected response format: {data}"
                    }
                    print("❌ Health check FAILED - unexpected response format")
            else:
                self.results["health_check"] = {
                    "status": "FAIL", 
                    "details": f"HTTP {response.status_code}: {response.text}"
                }
                print(f"❌ Health check FAILED - HTTP {response.status_code}")
                
        except Exception as e:
            self.results["health_check"] = {
                "status": "FAIL", 
                "details": f"Connection error: {str(e)}"
            }
            print(f"❌ Health check FAILED - Connection error: {e}")
    
    def test_events_get(self):
        """Test GET /api/events endpoint"""
        print("\n=== Testing Events GET API ===")
        try:
            response = requests.get(f"{API_BASE}/events", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if "events" in data and isinstance(data["events"], list):
                    events = data["events"]
                    if len(events) > 0:
                        # Check sample event structure
                        sample_event = events[0]
                        required_fields = ["id", "title", "description", "date", "time", "category"]
                        missing_fields = [field for field in required_fields if field not in sample_event]
                        
                        if not missing_fields:
                            self.results["events_get"] = {
                                "status": "PASS", 
                                "details": f"Retrieved {len(events)} events with proper structure"
                            }
                            print(f"✅ Events GET PASSED - Found {len(events)} events")
                            
                            # Test database connection implicitly
                            self.results["database_connection"] = {
                                "status": "PASS", 
                                "details": "Database connection verified through events retrieval"
                            }
                            print("✅ Database connection VERIFIED")
                        else:
                            self.results["events_get"] = {
                                "status": "FAIL", 
                                "details": f"Event missing required fields: {missing_fields}"
                            }
                            print(f"❌ Events GET FAILED - Missing fields: {missing_fields}")
                    else:
                        self.results["events_get"] = {
                            "status": "PASS", 
                            "details": "No events found but endpoint working correctly"
                        }
                        print("✅ Events GET PASSED - No events but endpoint working")
                else:
                    self.results["events_get"] = {
                        "status": "FAIL", 
                        "details": f"Unexpected response format: {data}"
                    }
                    print("❌ Events GET FAILED - unexpected response format")
            else:
                self.results["events_get"] = {
                    "status": "FAIL", 
                    "details": f"HTTP {response.status_code}: {response.text}"
                }
                print(f"❌ Events GET FAILED - HTTP {response.status_code}")
                
        except Exception as e:
            self.results["events_get"] = {
                "status": "FAIL", 
                "details": f"Connection error: {str(e)}"
            }
            print(f"❌ Events GET FAILED - Connection error: {e}")
    
    def test_events_create(self):
        """Test POST /api/events endpoint"""
        print("\n=== Testing Events CREATE API ===")
        try:
            test_event = {
                "title": "Test Event - Concert Jazz",
                "description": "Un concert de jazz exceptionnel pour tester l'API",
                "date": "2025-03-15",
                "time": "20:30",
                "image_url": "https://example.com/test-image.jpg",
                "price": "15€",
                "category": "Concert"
            }
            
            response = requests.post(f"{API_BASE}/events", json=test_event, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and "event" in data:
                    created_event = data["event"]
                    if created_event.get("title") == test_event["title"] and "id" in created_event:
                        self.results["events_create"] = {
                            "status": "PASS", 
                            "details": f"Event created successfully with ID: {created_event['id']}"
                        }
                        print("✅ Events CREATE PASSED")
                    else:
                        self.results["events_create"] = {
                            "status": "FAIL", 
                            "details": f"Event data mismatch: {created_event}"
                        }
                        print("❌ Events CREATE FAILED - data mismatch")
                else:
                    self.results["events_create"] = {
                        "status": "FAIL", 
                        "details": f"Unexpected response format: {data}"
                    }
                    print("❌ Events CREATE FAILED - unexpected response")
            else:
                self.results["events_create"] = {
                    "status": "FAIL", 
                    "details": f"HTTP {response.status_code}: {response.text}"
                }
                print(f"❌ Events CREATE FAILED - HTTP {response.status_code}")
                
        except Exception as e:
            self.results["events_create"] = {
                "status": "FAIL", 
                "details": f"Connection error: {str(e)}"
            }
            print(f"❌ Events CREATE FAILED - Connection error: {e}")
    
    def test_reservation_create(self):
        """Test POST /api/reservations endpoint"""
        print("\n=== Testing Reservation CREATE API ===")
        try:
            test_reservation = {
                "name": "Marie Dubois",
                "email": "marie.dubois@example.com",
                "phone": "06 12 34 56 78",
                "date": "2025-02-20",
                "time": "19:30",
                "party_size": 4,
                "special_requests": "Table près de la fenêtre si possible"
            }
            
            response = requests.post(f"{API_BASE}/reservations", json=test_reservation, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and "reservation_id" in data:
                    self.results["reservation_create"] = {
                        "status": "PASS", 
                        "details": f"Reservation created with ID: {data['reservation_id']}"
                    }
                    print("✅ Reservation CREATE PASSED")
                else:
                    self.results["reservation_create"] = {
                        "status": "FAIL", 
                        "details": f"Unexpected response format: {data}"
                    }
                    print("❌ Reservation CREATE FAILED - unexpected response")
            else:
                self.results["reservation_create"] = {
                    "status": "FAIL", 
                    "details": f"HTTP {response.status_code}: {response.text}"
                }
                print(f"❌ Reservation CREATE FAILED - HTTP {response.status_code}")
                
        except Exception as e:
            self.results["reservation_create"] = {
                "status": "FAIL", 
                "details": f"Connection error: {str(e)}"
            }
            print(f"❌ Reservation CREATE FAILED - Connection error: {e}")
    
    def test_reservation_get(self):
        """Test GET /api/reservations endpoint"""
        print("\n=== Testing Reservation GET API ===")
        try:
            response = requests.get(f"{API_BASE}/reservations", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if "reservations" in data and isinstance(data["reservations"], list):
                    reservations = data["reservations"]
                    self.results["reservation_get"] = {
                        "status": "PASS", 
                        "details": f"Retrieved {len(reservations)} reservations"
                    }
                    print(f"✅ Reservation GET PASSED - Found {len(reservations)} reservations")
                else:
                    self.results["reservation_get"] = {
                        "status": "FAIL", 
                        "details": f"Unexpected response format: {data}"
                    }
                    print("❌ Reservation GET FAILED - unexpected response format")
            else:
                self.results["reservation_get"] = {
                    "status": "FAIL", 
                    "details": f"HTTP {response.status_code}: {response.text}"
                }
                print(f"❌ Reservation GET FAILED - HTTP {response.status_code}")
                
        except Exception as e:
            self.results["reservation_get"] = {
                "status": "FAIL", 
                "details": f"Connection error: {str(e)}"
            }
            print(f"❌ Reservation GET FAILED - Connection error: {e}")
    
    def test_newsletter_subscribe(self):
        """Test POST /api/newsletter/subscribe endpoint"""
        print("\n=== Testing Newsletter Subscription API ===")
        try:
            # Test with new email
            test_email = f"test.{uuid.uuid4().hex[:8]}@example.com"
            subscription_data = {
                "email": test_email,
                "name": "Jean Testeur"
            }
            
            response = requests.post(f"{API_BASE}/newsletter/subscribe", json=subscription_data, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success"):
                    self.results["newsletter_subscribe"] = {
                        "status": "PASS", 
                        "details": f"Newsletter subscription successful for {test_email}"
                    }
                    print("✅ Newsletter subscription PASSED")
                    
                    # Test duplicate email
                    print("\n--- Testing duplicate email subscription ---")
                    response2 = requests.post(f"{API_BASE}/newsletter/subscribe", json=subscription_data, timeout=10)
                    
                    if response2.status_code == 200:
                        data2 = response2.json()
                        if data2.get("success") and "déjà abonné" in data2.get("message", "").lower():
                            self.results["newsletter_duplicate"] = {
                                "status": "PASS", 
                                "details": "Duplicate email handling works correctly"
                            }
                            print("✅ Newsletter duplicate email handling PASSED")
                        else:
                            self.results["newsletter_duplicate"] = {
                                "status": "FAIL", 
                                "details": f"Duplicate email not handled properly: {data2}"
                            }
                            print("❌ Newsletter duplicate email handling FAILED")
                    else:
                        self.results["newsletter_duplicate"] = {
                            "status": "FAIL", 
                            "details": f"Duplicate test failed with HTTP {response2.status_code}"
                        }
                        print(f"❌ Newsletter duplicate test FAILED - HTTP {response2.status_code}")
                        
                else:
                    self.results["newsletter_subscribe"] = {
                        "status": "FAIL", 
                        "details": f"Unexpected response: {data}"
                    }
                    print("❌ Newsletter subscription FAILED - unexpected response")
            else:
                self.results["newsletter_subscribe"] = {
                    "status": "FAIL", 
                    "details": f"HTTP {response.status_code}: {response.text}"
                }
                print(f"❌ Newsletter subscription FAILED - HTTP {response.status_code}")
                
        except Exception as e:
            self.results["newsletter_subscribe"] = {
                "status": "FAIL", 
                "details": f"Connection error: {str(e)}"
            }
            print(f"❌ Newsletter subscription FAILED - Connection error: {e}")
    
    def test_contact_form(self):
        """Test POST /api/contact endpoint"""
        print("\n=== Testing Contact Form API ===")
        try:
            contact_data = {
                "name": "Sophie Martin",
                "email": "sophie.martin@example.com",
                "subject": "Demande d'information sur privatisation",
                "message": "Bonjour, je souhaiterais avoir des informations sur la privatisation de votre espace pour un événement d'entreprise. Merci !"
            }
            
            response = requests.post(f"{API_BASE}/contact", json=contact_data, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success"):
                    self.results["contact_form"] = {
                        "status": "PASS", 
                        "details": "Contact form submission successful"
                    }
                    print("✅ Contact form PASSED")
                else:
                    self.results["contact_form"] = {
                        "status": "FAIL", 
                        "details": f"Unexpected response: {data}"
                    }
                    print("❌ Contact form FAILED - unexpected response")
            else:
                self.results["contact_form"] = {
                    "status": "FAIL", 
                    "details": f"HTTP {response.status_code}: {response.text}"
                }
                print(f"❌ Contact form FAILED - HTTP {response.status_code}")
                
        except Exception as e:
            self.results["contact_form"] = {
                "status": "FAIL", 
                "details": f"Connection error: {str(e)}"
            }
            print(f"❌ Contact form FAILED - Connection error: {e}")
    
    def run_all_tests(self):
        """Run all backend tests in priority order"""
        print("🚀 Starting L'envers Backend API Testing Suite")
        print("=" * 60)
        
        # HIGH PRIORITY TESTS
        print("\n🔥 HIGH PRIORITY TESTS")
        self.test_health_check()
        self.test_events_get()  # This also tests database connection
        self.test_reservation_create()
        self.test_reservation_get()
        self.test_events_create()
        
        # MEDIUM PRIORITY TESTS
        print("\n📋 MEDIUM PRIORITY TESTS")
        self.test_newsletter_subscribe()  # This also tests duplicate handling
        self.test_contact_form()
        
        # Print summary
        self.print_summary()
    
    def print_summary(self):
        """Print test results summary"""
        print("\n" + "=" * 60)
        print("📊 TEST RESULTS SUMMARY")
        print("=" * 60)
        
        passed = 0
        failed = 0
        
        for test_name, result in self.results.items():
            status = result["status"]
            if status == "PASS":
                print(f"✅ {test_name.replace('_', ' ').title()}: PASSED")
                passed += 1
            elif status == "FAIL":
                print(f"❌ {test_name.replace('_', ' ').title()}: FAILED")
                print(f"   Details: {result['details']}")
                failed += 1
            else:
                print(f"⏸️  {test_name.replace('_', ' ').title()}: PENDING")
        
        print(f"\n📈 OVERALL RESULTS: {passed} PASSED, {failed} FAILED")
        
        if failed == 0:
            print("🎉 ALL TESTS PASSED! Backend is working correctly.")
        else:
            print("⚠️  Some tests failed. Check details above.")
        
        return self.results

if __name__ == "__main__":
    tester = BackendTester()
    results = tester.run_all_tests()