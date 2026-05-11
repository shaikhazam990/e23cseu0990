# Stage 5

# Reliable Notification Processing Architecture

## Existing Problem

The current implementation sends notifications sequentially.

```txt
send_email()
save_to_db()
push_to_app()