const ordersData = [
    {
        "id": "1",
        "category": "Restaurant",
        "name": "Pizza Hut",
        "orderDate": "2024-03-17T17:54:41.322751",
        "orderStatus": "Accepted",
        "details": "R commande 1",
        "logo": require('../assets/images/restaurant_logo.png')
    },
    {
        "id": "2",
        "category": "Restaurant",
        "name": "Subway",
        "orderDate": "2024-03-09T17:54:41.322778",
        "orderStatus": "Delivered",
        "details": "R commande 2",
        "logo": require('../assets/images/restaurant_logo.png')
    },
    {
        "id": "3",
        "category": "Restaurant",
        "name": "Burger King",
        "orderDate": "2024-03-21T17:54:41.322789",
        "orderStatus": "Delivered",
        "details": "R commande 3",
        "logo": require('../assets/images/restaurant_logo.png')
    },
    {
        "id": "4",
        "category": "Restaurant",
        "name": "Burger King",
        "orderDate": "2024-03-06T17:54:41.322801",
        "orderStatus": "Cancelled",
        "details": "R commande 4",
        "logo": require('../assets/images/restaurant_logo.png')
    },
    {
        "id": "5",
        "category": "Restaurant",
        "name": "McDonalds",
        "orderDate": "2024-03-24T17:54:41.322813",
        "orderStatus": "Cancelled",
        "details": "R commande 5",
        "logo": require('../assets/images/restaurant_logo.png')
    },
    {
        "id": "6",
        "category": "Restaurant",
        "name": "KFC",
        "orderDate": "2024-03-01T17:54:41.322822",
        "orderStatus": "Cancelled",
        "details": "R commande 6",
        "logo": require('../assets/images/restaurant_logo.png')
    },
    {
        "id": "7",
        "category": "Restaurant",
        "name": "Burger King",
        "orderDate": "2024-03-19T17:54:41.322831",
        "orderStatus": "Cancelled",
        "details": "R commande 7",
        "logo": require('../assets/images/restaurant_logo.png')
    },
    {
        "id": "8",
        "category": "Restaurant",
        "name": "Burger King",
        "orderDate": "2024-03-07T17:54:41.322843",
        "orderStatus": "Cancelled",
        "details": "R commande 8",
        "logo": require('../assets/images/restaurant_logo.png')
    },
    {
        "id": "9",
        "category": "Restaurant",
        "name": "Pizza Hut",
        "orderDate": "2024-03-10T17:54:41.322856",
        "orderStatus": "Accepted",
        "details": "R commande 9",
        "logo": require('../assets/images/restaurant_logo.png')
    },
    {
        "id": "10",
        "category": "Restaurant",
        "name": "Pizza Hut",
        "orderDate": "2024-03-07T17:54:41.322864",
        "orderStatus": "On progress",
        "details": "R commande 10",
        "logo": require('../assets/images/restaurant_logo.png')
    },
    {
        "id": "11",
        "category": "Kiosk",
        "name": "Local Kiosk",
        "orderDate": "2024-03-11T17:54:41.322872",
        "orderStatus": "On progress",
        "details": "K commande 11",
        "logo": require("../assets/images/kiosque.png")
    },
    {
        "id": "12",
        "category": "Kiosk",
        "name": "Street Deli",
        "orderDate": "2024-03-14T17:54:41.322882",
        "orderStatus": "Delivered",
        "details": "K commande 12",
        "logo": require("../assets/images/kiosque.png")
    },
    {
        "id": "13",
        "category": "Kiosk",
        "name": "Daily Needs",
        "orderDate": "2024-03-15T17:54:41.322889",
        "orderStatus": "Cancelled",
        "details": "K commande 13",
        "logo": require("../assets/images/kiosque.png")
    },
    {
        "id": "14",
        "category": "Kiosk",
        "name": "Snack Corner",
        "orderDate": "2024-03-08T17:54:41.322896",
        "orderStatus": "Cancelled",
        "details": "K commande 14",
        "logo": require("../assets/images/kiosque.png")
    },
    {
        "id": "15",
        "category": "Kiosk",
        "name": "Daily Needs",
        "orderDate": "2024-03-27T17:54:41.322902",
        "orderStatus": "Accepted",
        "details": "K commande 15",
        "logo": require("../assets/images/kiosque.png")
    },
    {
        "id": "16",
        "category": "Kiosk",
        "name": "Snack Corner",
        "orderDate": "2024-02-27T17:54:41.322908",
        "orderStatus": "Cancelled",
        "details": "K commande 16",
        "logo": require("../assets/images/kiosque.png")
    },
    {
        "id": "17",
        "category": "Kiosk",
        "name": "Local Kiosk",
        "orderDate": "2024-03-10T17:54:41.322914",
        "orderStatus": "Cancelled",
        "details": "K commande 17",
        "logo": require("../assets/images/kiosque.png")
    },
    {
        "id": "18",
        "category": "Kiosk",
        "name": "Daily Needs",
        "orderDate": "2024-03-03T17:54:41.322925",
        "orderStatus": "Accepted",
        "details": "K commande 18",
        "logo": require("../assets/images/kiosque.png")
    },
    {
        "id": "19",
        "category": "Kiosk",
        "name": "QuickMart",
        "orderDate": "2024-03-03T17:54:41.322954",
        "orderStatus": "Cancelled",
        "details": "K commande 19",
        "logo": require("../assets/images/kiosque.png")
    },
    {
        "id": "20",
        "category": "Kiosk",
        "name": "Local Kiosk",
        "orderDate": "2024-03-25T17:54:41.322963",
        "orderStatus": "Delivered",
        "details": "K commande 20",
        "logo": require("../assets/images/kiosque.png")
    },
    {
        "id": "21",
        "category": "Pharmacy",
        "name": "City Pharma",
        "orderDate": "2024-03-27T17:54:41.322971",
        "orderStatus": "Accepted",
        "details": "P commande 21",
        "logo": require("../assets/images/phar_logo.png")
    },
    {
        "id": "22",
        "category": "Pharmacy",
        "name": "HealthPlus Pharmacy",
        "orderDate": "2024-03-01T17:54:41.322978",
        "orderStatus": "On progress",
        "details": "P commande 22",
        "logo": require("../assets/images/phar_logo.png")
    },
    {
        "id": "23",
        "category": "Pharmacy",
        "name": "Wellness Drugstore",
        "orderDate": "2024-03-24T17:54:41.322985",
        "orderStatus": "Cancelled",
        "details": "P commande 23",
        "logo": require("../assets/images/phar_logo.png")
    },
    {
        "id": "24",
        "category": "Pharmacy",
        "name": "Family Health Pharmacy",
        "orderDate": "2024-03-01T17:54:41.322992",
        "orderStatus": "On progress",
        "details": "P commande 24",
        "logo": require("../assets/images/phar_logo.png")
    },
    {
        "id": "25",
        "category": "Pharmacy",
        "name": "MediCare",
        "orderDate": "2024-03-18T17:54:41.322999",
        "orderStatus": "Cancelled",
        "details": "P commande 25",
        "logo": require("../assets/images/phar_logo.png")
    },
    {
        "id": "26",
        "category": "Pharmacy",
        "name": "City Pharma",
        "orderDate": "2024-03-26T17:54:41.323007",
        "orderStatus": "Accepted",
        "details": "P commande 26",
        "logo": require("../assets/images/phar_logo.png")
    },
    {
        "id": "27",
        "category": "Pharmacy",
        "name": "City Pharma",
        "orderDate": "2024-03-10T17:54:41.323012",
        "orderStatus": "On progress",
        "details": "P commande 27",
        "logo": require("../assets/images/phar_logo.png")
    },
    {
        "id": "28",
        "category": "Pharmacy",
        "name": "MediCare",
        "orderDate": "2024-03-02T17:54:41.323018",
        "orderStatus": "On progress",
        "details": "P commande 28",
        "logo": require("../assets/images/phar_logo.png")
    },
    {
        "id": "29",
        "category": "Pharmacy",
        "name": "Family Health Pharmacy",
        "orderDate": "2024-03-18T17:54:41.323024",
        "orderStatus": "On progress",
        "details": "P commande 29",
        "logo": require("../assets/images/phar_logo.png")
    },
    {
        "id": "30",
        "category": "Pharmacy",
        "name": "MediCare",
        "orderDate": "2024-03-15T17:54:41.323030",
        "orderStatus": "On progress",
        "details": "P commande 30",
        "logo": require("../assets/images/phar_logo.png")
    }
]

export default ordersData;
