# Project Setup Instructions

## Project Description

This project is a dashboard for analyzing and visualizing data from various social media platforms, including Twitter. It consists of a backend built with FastAPI, a frontend built with React, and a worker system using RabbitMQ and Celery for task scheduling and message processing. MongoDB is used to store user data, keywords, and tweets. The project is designed to provide dynamic, real-time dashboards for users to filter, categorize, and monitor social media activity.

---

## Steps to Set Up the Project

1. **Download and Set Up MongoDB**  
   - Install MongoDB from the [official website](https://www.mongodb.com/try/download/community).  
   - Start the MongoDB server.

2. **Configure MongoDB**  
   - Connect to the MongoDB server and create a database named `twitter`.  
   - Inside the `twitter` database, create the following collections: `users`, `keywords`, and `tweets`.  
   - Create an index for the `tweets` collection:  
     ```bash
     created_at: -1
     text: text
     user.id: -1
     keyword: -1
     ```

3. **Install Python and Node.js**  
   - Download and install Python from [python.org](https://www.python.org/downloads/).  
   - Download and install Node.js from [nodejs.org](https://nodejs.org/).

4. **Run the FastAPI Server**  
   - Navigate to the backend directory and start the FastAPI server using the following command:  
     ```bash
     python -m uvicorn app:app --reload
     ```

5. **Run the React Frontend**  
   - Navigate to the `./frontend` directory and start the React development server:  
     ```bash
     npm run dev
     ```

---

## Steps for Setting Up the Worker

1. **Configure Headers**  
   - Set up the `Headers.json` file with the required configurations.

2. **Install Erlang**  
   - Download and install Erlang from the [official website](https://www.erlang.org/downloads).

3. **Install RabbitMQ**  
   - Download and install RabbitMQ from the [official website](https://www.rabbitmq.com/docs/install-windows).  

4. **Set Up RabbitMQ**  
   - Add RabbitMQ to the environment variables:  
     ```
     C:\Program Files\RabbitMQ Server\rabbitmq_server-4.0.5\sbin
     ```  
   - Enable the RabbitMQ management plugin:  
     ```bash
     rabbitmq-plugins enable rabbitmq_management
     ```  
   - Access the RabbitMQ web UI at [http://localhost:15672](http://localhost:15672) with the default credentials:  
     - **Username:** `guest`  
     - **Password:** `guest`

5. **Run Celery Worker**  
   - Start the Celery worker:  
     ```bash
     python -m celery -A twitterTask worker --loglevel=INFO --pool=solo
     ```

6. **Run the Scheduler**  
   - Start the scheduler script:  
     ```bash
     python scheduler.py
     ```

