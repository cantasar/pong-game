all:
	@echo "\033[35m🚀 Starting Pong Game Development Environment...\033[0m"
	@echo "\033[36m📦 Backend will run on \033[33mhttp://localhost:3000\033[0m"
	@echo "\033[36m🎨 Frontend will run on \033[33mhttp://localhost:8080\033[0m"
	@echo "\033[31m⚠️  Press Ctrl+C to stop both services\033[0m"
	@echo "\033[32m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\033[0m"
	make backend & \
	make frontend & \
	wait

backend:
	@echo "\033[32m🔧 Starting backend server...\033[0m"
	@cd backend && npm install --silent && npm run dev

frontend:
	@echo "\033[34m🎮 Starting frontend server...\033[0m"
	@cd frontend-v2 && npm install --silent && npm run dev

clean:
	@echo "\033[33m🧹 Cleaning up node_modules...\033[0m"
	@cd backend && rm -rf node_modules
	@cd frontend-v2 && rm -rf node_modules
	@echo "\033[32m✅ Cleanup completed!\033[0m"

kill:
	@echo "\033[31m💀 Killing running processes...\033[0m"
	@echo "\033[35m🔪 Stopping Node.js processes...\033[0m"
	-pkill -f "node.*dev"
	-pkill -f "npm.*dev"
	@echo "\033[36m⚡ Stopping frontend processes...\033[0m"
	-pkill -f "vite"
	-pkill -f "webpack"
	-pkill -f "parcel"
	-pkill -f "rollup"
	@echo "\033[33m🚪 Stopping processes on common ports...\033[0m"
	-lsof -ti:3000 | xargs kill -9 2>/dev/null || true
	-lsof -ti:3001 | xargs kill -9 2>/dev/null || true
	-lsof -ti:4173 | xargs kill -9 2>/dev/null || true
	-lsof -ti:5000 | xargs kill -9 2>/dev/null || true
	-lsof -ti:5173 | xargs kill -9 2>/dev/null || true
	-lsof -ti:8000 | xargs kill -9 2>/dev/null || true
	-lsof -ti:8080 | xargs kill -9 2>/dev/null || true
	-lsof -ti:8081 | xargs kill -9 2>/dev/null || true
	@echo "\033[32m🎉 All processes killed successfully!\033[0m"

fclean: kill clean
	@echo "\033[35m🌟 Full cleanup completed! Ready for fresh start! 🌟\033[0m"

help:
	@echo "\033[35m🎮 PONG GAME DEVELOPMENT COMMANDS 🎮\033[0m"
	@echo "\033[32m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\033[0m"
	@echo "\033[36m🚀 make all      \033[0m- Start both backend and frontend"
	@echo "\033[32m🔧 make backend  \033[0m- Start only backend server"
	@echo "\033[34m🎨 make frontend \033[0m- Start only frontend server"
	@echo "\033[33m🧹 make clean    \033[0m- Remove node_modules"
	@echo "\033[31m💀 make kill     \033[0m- Kill all running processes"
	@echo "\033[35m🌟 make fclean   \033[0m- Full cleanup (kill + clean)"
	@echo "\033[36m❓ make help     \033[0m- Show this help message"
	@echo "\033[32m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\033[0m"

re: fclean
	@echo "\033[35m🔄 Rebuilding project...\033[0m"
	@make all

.PHONY: all backend frontend clean kill fclean help
