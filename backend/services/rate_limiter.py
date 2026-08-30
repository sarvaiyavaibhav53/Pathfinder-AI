import time
from collections import deque, defaultdict
from fastapi import HTTPException

class SlidingWindowRateLimiter:
    def __init__(self, max_requests: int = 15, window_seconds: int = 60):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.user_requests = defaultdict(deque)

    def check_rate_limit(self, user_id: int):
        now = time.time()
        user_timestamps = self.user_requests[user_id]
        
        # Evict timestamps outside the window
        while user_timestamps and now - user_timestamps[0] > self.window_seconds:
            user_timestamps.popleft()

        if len(user_timestamps) >= self.max_requests:
            raise HTTPException(
                status_code=429,
                detail=f"Rate limit exceeded. You can only send up to {self.max_requests} messages per minute."
            )

        user_timestamps.append(now)

rate_limiter = SlidingWindowRateLimiter(max_requests=15, window_seconds=60)
