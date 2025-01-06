hasura_apply:
	hasura metadata apply
	hasura migrate apply --database-name 'default'

console:
	hasura console

up:
	docker-compose up -d

down:
	docker-compose down

dev: up hasura_apply console

