# Stage 5

This stage redesigns the notification delivery workflow to handle large-scale notification traffic more reliably.

Topics covered:

* queue-based architecture
* asynchronous processing
* retry handling
* dead letter queue
* background workers
* notification reliability
* scalability improvements

The proposed design improves performance during placement season and prevents failures in external services, such as email APIs, from affecting the core notification system.
