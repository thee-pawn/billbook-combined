export const mockInvoicesData = [
    {
        "id": 1,
        "customerId": 2,
        "amount": 1500,
        "date": "2025-05-18",
        "status": "paid",
        "storeId": 1,
        "taxColected": true,
        "items": [
            {
                "type": "product",
                "productId": 1,
                "quantity": 2,
                "tax": 18,
                "discount": 0,
                "discountType": "flat",
            },
            {
                "type": "service",
                "serviceId": 1,
                "quantity": 1,
                "tax": 18,
                "discount": 10,
                "discountType": "percentage",
            },

        ],
        "payments" : [
            {
                "paymentId": 1,
                "amount": 1200,
                "mode": "credit_card",
                "status": "completed",
                "date": "2025-05-18",
                "refrenceNo": "CC123456789",
            },
            {
                "paymentId": 2,
                "amount": 300,
                "mode": "cash",
                "status": "completed",
                "date": "2025-05-18",
                "refrenceNo": null,
            }
        ],
        "dues": 0
    },
    {
        "id": 2,
        "customerId": 2,
        "amount": 2000,
        "date": "2025-05-19",
        "status": "pending",
        "storeId": 1,
        "taxColected": true,
        "items": [
            {
                "type": "product",
                "productId": 2,
                "quantity": 1,
                "tax": 18,
                "discount": 0,
                "discountType": "flat",
            },
            {
                "type": "service",
                "serviceId": 2,
                "quantity": 1,
                "tax": 18,
                "discount": 5,
                "discountType": "percentage",
            },
        ],
        "payments" : [
            {
                "paymentId": 3,
                "amount": 2000,
                "mode": "cash",
                "status": "completed",
                "date": "2025-05-19",
            }
        ],
        "dues": 2000
    },
    
]