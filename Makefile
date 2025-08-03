all:
	@echo "\033[35m🚀 Starting Pong Game Development Environment...\033[0m"
	@echo "\033[32m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\033[0m"
	@make backend-bg
	@make frontend-bg
	@make websocket-test-bg
	@echo "\033[32m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\033[0m"
	@echo "\033[36m🎉 All services are running!\033[0m"
	@echo "\033[36m📦 Backend: \033[33mhttp://localhost:3000\033[0m"
	@echo "\033[36m🎨 Frontend: \033[33mhttp://localhost:8080\033[0m"
	@echo "\033[36m🔌 WebSocket Test: \033[33mhttp://localhost:8081\033[0m"
	@echo "\033[31m⚠️  Press Ctrl+C to stop all services\033[0m"
	@echo "\033[32m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\033[0m"

backend-bg:
	@echo "\033[32m🔧 Starting backend server in background...\033[0m"
	@cd backend && npm install && npm run dev &
	@sleep 2
	@echo "\033[32m✅ Backend ready at http://localhost:3000\033[0m"

frontend-bg:
	@echo "\033[34m🎮 Starting frontend server in background...\033[0m"
	@cd frontend-v2 && npm install && npm run dev &
	@sleep 2
	@echo "\033[34m✅ Frontend ready at http://localhost:8080\033[0m"

websocket-test-bg:
	@echo "\033[35m🔌 Starting websocket test app in background...\033[0m"
	@cd websocket-test-app && npm install && npm run dev &
	@sleep 2
	@echo "\033[35m✅ WebSocket test app ready at http://localhost:8081\033[0m"

clean:
	@echo "\033[33m🧹 Cleaning up node_modules and dist folders...\033[0m"
	@cd backend && rm -rf node_modules
	@cd frontend-v2 && rm -rf node_modules dist
	@cd websocket-test-app && rm -rf node_modules dist
	@echo "\033[32m✅ Cleanup completed!\033[0m"

kill:
	@echo "\033[31m💀 Killing running processes...\033[0m"
	@echo "\033[35m🔪 Stopping Node.js processes...\033[0m"
	-pkill -f "node.*dev"
	-pkill -f "npm.*dev"
	@echo "\033[36m🐍 Stopping Python HTTP servers...\033[0m"
	-pkill -f "python3 -m http.server"
	@echo "\033[33m🚪 Stopping processes on common ports...\033[0m"
	-lsof -ti:3000 | xargs kill -9 2>/dev/null || true
	-lsof -ti:8080 | xargs kill -9 2>/dev/null || true
	-lsof -ti:8081 | xargs kill -9 2>/dev/null || true
	@echo "\033[32m🎉 All processes killed successfully!\033[0m"

fclean: kill clean
	@echo "\033[35m🌟 Full cleanup completed! Ready for fresh start! 🌟\033[0m"

help:
	@echo "\033[35m🎮 PONG GAME DEVELOPMENT COMMANDS 🎮\033[0m"
	@echo "\033[32m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\033[0m"
	@echo "\033[36m🚀 make all           \033[0m- Start all services in background"
	@echo "\033[32m🔧 make backend       \033[0m- Start only backend server (foreground)"
	@echo "\033[32m🔧 make backend-bg    \033[0m- Start only backend server (background)"
	@echo "\033[34m🎨 make frontend      \033[0m- Start only frontend server (background)"
	@echo "\033[34m🎨 make frontend-bg   \033[0m- Start only frontend server (background)"
	@echo "\033[35m🔌 make websocket-test\033[0m- Start only websocket test app (foreground)"
	@echo "\033[35m🔌 make websocket-test-bg\033[0m- Start only websocket test app (background)"
	@echo "\033[33m🧹 make clean         \033[0m- Remove node_modules and dist folders"
	@echo "\033[31m💀 make kill          \033[0m- Kill all running processes"
	@echo "\033[36m📊 make status        \033[0m- Check running services status"
	@echo "\033[35m🌟 make fclean        \033[0m- Full cleanup (kill + clean)"
	@echo "\033[36m❓ make help          \033[0m- Show this help message"
	@echo "\033[32m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\033[0m"

re: fclean
	@echo "\033[35m🔄 Rebuilding project...\033[0m"
	@make all

.PHONY: all backend frontend clean kill fclean help re
