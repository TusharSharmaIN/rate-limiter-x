.PHONY: up down build logs restart clean test-call test-load ps redis-cli

## Start everything (builds if needed)
up:
	docker compose up --build

## Start in background
up-d:
	docker compose up --build -d

## Stop and remove containers
down:
	docker compose down

## Rebuild images without cache
build:
	docker compose build --no-cache

## Tail logs of the rate limiter service
logs:
	docker compose logs -f rate-limiter-service

## Restart just the service (after code change, without touching Redis)
restart:
	docker compose restart rate-limiter-service

## Stop and wipe volumes (fresh Redis state)
clean:
	docker compose down -v

## Show running containers
ps:
	docker compose ps

## Open a redis-cli shell into the running Redis container
redis-cli:
	docker exec -it rate-limiter-redis redis-cli

## Single test gRPC call
test-call:
	grpcurl -plaintext -import-path ./proto -proto rate_limiter.proto \
		-d '{"key": "user:123"}' \
		localhost:50051 ratelimiter.RateLimiter/CheckLimit

## Fire N concurrent calls to prove atomicity (usage: make test-load N=20)
N ?= 20
test-load:
	for i in $$(seq 1 $(N)); do \
		grpcurl -plaintext -import-path ./proto -proto rate_limiter.proto \
			-d '{"key": "concurrency-test"}' \
			localhost:50051 ratelimiter.RateLimiter/CheckLimit & \
	done; wait