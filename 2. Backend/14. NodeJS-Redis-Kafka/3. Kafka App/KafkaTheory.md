# WHAT IS APACHE KAFKA?

ANS: Apache Kafka is a distributed event streaming platform used to handle massive amounts of real-time data. It acts as a high-throughput, fault-tolerant, and scalable message broker between services.

Kafka is commonly used in applications such as Uber, Zomato, Discord, Netflix, LinkedIn, payment systems, analytics platforms, and IoT systems where millions of events are generated every second.

---

# WHAT PROBLEM DOES KAFKA SOLVE?

ANS: Databases are excellent for storing data permanently, but they are not optimized to handle millions of real-time events every second.

Example:

A Zomato rider sends location updates every second.

100,000 riders × 1 update/sec = 100,000 writes/sec

If every update is directly inserted into PostgreSQL:

* Database becomes overloaded.
* Disk I/O increases.
* Queries become slower.
* Analytics and notifications compete for resources.

Kafka acts as a buffer between applications and databases.

Flow:

Producer → Kafka → Consumers → Database

This allows the database to focus on storage while Kafka handles the heavy traffic.

---

# DISCORD EXAMPLE

Problem:

Discord has millions of users sending messages simultaneously.

If every message directly hits the database:

User → Server → Database

The database becomes the bottleneck.

Solution:

User → Server → Kafka

Consumers:

* Message Service
* Notification Service
* Analytics Service
* Moderation Service

Each service independently consumes the message without affecting others.

Benefits:

* High throughput
* Better scalability
* Decoupled architecture

---

# ZOMATO EXAMPLE

Problem:

Every rider sends:

* Latitude
* Longitude
* Speed
* Status

every second.

50,000 riders × 1 update/sec = 50,000 events/sec

Writing directly to SQL is expensive.

Solution:

Rider App (Producer)
→ Kafka Topic (Rider Updates)
→ Consumers

Consumers:

1. Customer Tracking Service
2. ETA Service
3. Analytics Service
4. Database Writer Service

The Database Writer performs bulk inserts instead of individual inserts.

---

# UBER EXAMPLE

Problem:

100,000 drivers sending location updates every second.

Each update is needed by:

* Fare Service
* Analytics Service
* Customer Tracking
* Driver Matching

Without Kafka:

Driver → Database

Every service repeatedly queries the database.

With Kafka:

Driver → Kafka

Consumers:

* Fare Service
* Analytics Service
* Customer Service
* Matching Service

Each service receives the same event independently.

---

# WHY DOES KAFKA HAVE HIGHER THROUGHPUT THAN DATABASES?

ANS:

Databases are optimized for:

* Queries
* Transactions
* Relationships
* Constraints

Kafka is optimized for:

* Sequential writes
* Event streaming
* Large-scale ingestion

Comparison:

Kafka:
* Very High Throughput
* Sequential Disk Writes
* Append-only Log

Database:
* Lower Throughput
* Random Reads/Writes
* Complex Index Management

Example:

Database:
100,000 inserts/sec may become difficult.

Kafka:
Millions of messages/sec are achievable because Kafka simply appends messages to logs.

---

# KAFKA + DATABASE ARCHITECTURE

Traditional:

App → Database

Kafka Architecture:

App → Kafka → Consumer → Database

Benefits:

1. Database receives batched writes.
2. Database load decreases.
3. Services become independent.
4. Failures are isolated.
5. Better scalability.

---

# CORE COMPONENTS OF KAFKA

1. Producer
2. Broker
3. Topic
4. Partition
5. Consumer
6. Consumer Group

---

# WHAT IS A PRODUCER?

ANS:

A producer is any application that sends messages to Kafka.

Examples:

* Zomato Rider App
* Uber Driver App
* Discord Chat Server

Example:

Rider App → Kafka

The Rider App acts as Producer.

---

# WHAT IS A CONSUMER?

ANS:

A consumer reads messages from Kafka.

Examples:

* Analytics Service
* Notification Service
* Database Writer

Example:

Kafka → Analytics Service

Analytics Service acts as Consumer.

---

# WHAT IS A TOPIC?

ANS:

A topic is a category of messages.

Examples:

Topic: rider-updates

Contains:

Rider 1 Location
Rider 2 Location
Rider 3 Location

Another Topic:

hotel-updates

Topics help organize messages.

---

# WHAT IS A PARTITION?

ANS:

A topic is divided into partitions.

Example:

Topic: rider-updates

Partition 0
Partition 1
Partition 2
Partition 3

Partitions allow Kafka to process messages in parallel.

More partitions = More scalability.

---

# PARTITION EXAMPLE

Suppose:

Topic = Rider Updates

Partitions:

0
1
2
3

Messages are distributed among these partitions.

Each partition maintains its own order.

---

# CONSUMER LOAD BALANCING RULES

Rule 1:

One partition can be consumed by only ONE consumer inside the same consumer group at a time.

Correct:

Partition 0 → Consumer A

Wrong:

Partition 0 → Consumer A
Partition 0 → Consumer B

This is not allowed in the same group.

---

Rule 2:

One consumer can consume multiple partitions.

Example:

Consumer A

Partition 0
Partition 1
Partition 2

Allowed.

---

# SCENARIO 1

Partitions = 2
Consumers = 1

Result:

Consumer 1

Partition 0
Partition 1

One consumer handles both partitions.

---

# SCENARIO 2

Partitions = 2
Consumers = 2

Result:

Consumer 1 → Partition 0

Consumer 2 → Partition 1

Automatic load balancing occurs.

---

# SCENARIO 3

Partitions = 4
Consumers = 5

Result:

Consumer 1 → Partition 0

Consumer 2 → Partition 1

Consumer 3 → Partition 2

Consumer 4 → Partition 3

Consumer 5 → Idle

Reason:

Maximum active consumers = Number of partitions.

---

# WHAT IS A CONSUMER GROUP?

ANS:

A consumer group is a collection of consumers working together.

Example:

Consumer Group: Analytics

Consumer 1
Consumer 2
Consumer 3
Consumer 4

Kafka automatically distributes partitions among them.

Benefits:

* Parallel processing
* Auto load balancing
* Fault tolerance

---

# WHAT HAPPENS IF A CONSUMER DIES?

Example:

Partitions = 4

Consumer 1 → P0

Consumer 2 → P1

Consumer 3 → P2

Consumer 4 → P3

Consumer 2 crashes.

Kafka performs Rebalancing:

Consumer 1 → P0

Consumer 3 → P1, P2

Consumer 4 → P3

No data is lost.

---

# WHY CONSUMER GROUPS ARE NEEDED?

Without Groups:

Every consumer receives every message.

This creates duplicate processing.

With Groups:

Kafka divides partitions automatically.

Benefits:

* Better throughput
* No duplicate work
* Easy horizontal scaling

---

# HOW KAFKA WORKS AS A QUEUE

Queue Behavior:

Producer → Kafka

Consumer Group A

Partition 0 → Consumer 1

Partition 1 → Consumer 2

Each message is processed only once within the group.

This behaves like a traditional queue.

---

# HOW KAFKA WORKS AS PUB/SUB

Topic:

rider-updates

Consumer Group 1:

Analytics Team

Consumer Group 2:

Customer Tracking

Consumer Group 3:

Fraud Detection

All groups receive the same message.

This behaves like Publish/Subscribe.

---

# KAFKA VS RABBITMQ

RabbitMQ:

* Primarily Queue-Oriented
* Excellent for Task Processing
* Lower Event Retention

Kafka:

* Queue + Pub/Sub
* Event Streaming Platform
* Message Retention
* Very High Throughput

---

# WHAT IS ZOOKEEPER?

ANS:

Historically Kafka used Apache ZooKeeper to manage cluster metadata.

ZooKeeper responsibilities:

1. Broker Registration
2. Leader Election
3. Cluster Coordination
4. Configuration Management

Example:

Broker 1 crashes.

ZooKeeper elects another broker as leader.

This keeps the cluster operational.

---

# MODERN KAFKA (KRaft MODE)

Newer Kafka versions no longer require ZooKeeper.

Kafka now uses:

KRaft (Kafka Raft Metadata Mode)

Benefits:

* Simpler Architecture
* Better Performance
* Easier Maintenance

---

# COMPLETE ZOMATO ARCHITECTURE USING KAFKA

Rider App
(Producer)

↓

Kafka Topic
(rider-updates)

↓

Consumer Group 1
Customer Tracking

Consumer Group 2
ETA Calculation

Consumer Group 3
Analytics

Consumer Group 4
Database Writer

↓

PostgreSQL / MongoDB

Benefits:

* Real-time tracking
* Scalable architecture
* Reduced database load
* Fault tolerance
* High throughput
