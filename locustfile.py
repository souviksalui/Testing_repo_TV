from locust import HttpUser, task, TaskSet
import json

class UserBehavior(TaskSet):

    def on_start(self):
        """
        Called when a virtual user starts. 
        We will set the authentication token here.
        """
        # 1. Paste the token you captured from your browser here
        self.token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwYXlsb2FkIjoiOTU2NjA2ODM1MiIsImlhdCI6MTc1NzkxMjc4MSwiZXhwIjoxNzYwNTkxMTgxfQ.PogNAZyBefPTAPKTAIf7bIcDfTAlkvQMLjJyvFZ1B54"
        
        # 2. Set the authorization header for all subsequent requests
        self.headers = {'Authorization': f'Bearer {self.token}'}
        
        # Optional: You can make a request to a "me" or "profile" endpoint
        # to verify the token works before starting the main tasks.
        # self.client.get("/api/v1/user/profile", headers=self.headers, name="/api/user/profile")

    # @task
    # def view_product(self):
    #     """Simulates viewing a product page."""
    #     # You would replace this with an actual product ID and endpoint
    #     product_id = "scythe-with-50-cm-blade" 
    #     self.client.get(
    #         f"/api/v1/products/{product_id}", 
    #         headers=self.headers,
    #         name="/api/products/[id]"
    #     )

    @task
    def add_to_cart(self):
        """Simulates adding a product to the cart."""
        # IMPORTANT: You need to find the correct API endpoint and payload
        # by watching the Network tab in your browser when you add an item to the cart.
        payload = {
            "product_id": "EXAMPLE_PRODUCT_123",
            "quantity": 1
        }
        self.client.post(
            "/api/v1/cart/add",  # This is an example URL, find the real one
            json=payload,
            headers=self.headers,
            name="/api/cart/add"
        )
        
    @task
    def view_checkout_page(self):
        """Simulates viewing the checkout page."""
        # Find the actual endpoint for viewing the cart or checkout page
        self.client.get(
            "/api/v1/checkout", # This is an example URL, find the real one
            headers=self.headers,
            name="/api/checkout"
        )


class WebsiteUser(HttpUser):
    # Set the host to the base URL of the API
    host = "https://www.toolsvilla.com" 
    tasks = [UserBehavior]
    min_wait = 1000  # 1 second
    max_wait = 5000  # 5 seconds


#     {
#     "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwYXlsb2FkIjoiOTU2NjA2ODM1MiIsImlhdCI6MTc1NzkxMjc4MSwiZXhwIjoxNzYwNTkxMTgxfQ.PogNAZyBefPTAPKTAIf7bIcDfTAlkvQMLjJyvFZ1B54",
#     "user": {
#         "_id": "65e005b8346e88099c21d811",
#         "email": "souvik.salui@toolsvilla.com",
#         "firstname": "Testing purposes",
#         "mobileno": "9566068352",
#         "tvPoints": 718,
#         "interest": [],
#         "state": "West Bengal",
#         "zipcode": "713212",
#         "newQues": false
#     },
#     "message": "succesfully logged in"
# }