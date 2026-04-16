# 🌑 Lunar Gateway Autonomy

An autonomous, high-reliability edge computing system designed for simulated lunar habitat environments. It integrates a Go-based control loop for critical life-support systems, a Python/FastAPI AI engine for predictive decision-making, and a real-time React UI for mission control visualization.

## 📑 Table of Contents
- [Features](#-features)
- [Architecture](#-architecture)
- [Technologies Used](#-technologies-used)
- [Installation](#-installation)
- [Usage](#-usage)
- [Contributing](#-contributing)
- [License](#-license)

## 🚀 Features
* **High-Reliability Edge Control:** A Go-based daemon that manages automated 120V/12V load shedding and actuates physical heating relays based on AI triggers or threshold limits.
* **Predictive AI Engine:** A Python and FastAPI service utilizing lightweight ONNX or quantized ML models to predict station freezing events before they happen.
* **Logistics Extraction Pipeline:** An AI pipeline that ingests and structures messy, unstructured JSON/text cargo manifests.
* **Real-Time Mission Control UI:** A React and TypeScript frontend featuring a 3D model of the Gateway, a real-time decision log explaining AI choices, and energy flow diagrams.
* **Disconnected State Management:** Locally buffers telemetry data during disconnections from Earth.
* **Mock Environment Simulator:** A built-in Python simulator capable of generating extreme temperature swings (like solar radiation and eclipses) and publishing telemetry via MQTT or UDP.
* **Edge Kubernetes Ready:** Includes K3s manifests that prioritize critical control pods (which never go down) over the medium-priority AI engine.

## 🏗️ Architecture
The system operates using a multi-service architecture deployed at the edge:
1. **Station Simulator (Python):** The mock environment generator that creates simulated sensor data and manifests.
2. **Edge Controller (Go):** The high-reliability control loop that acts as the primary telemetry subscriber and fail-safe manager.
3. **AI Decision Engine (Python/FastAPI):** The "Autonomous Brain" running on the Gateway's internal network to process complex logistics and telemetry endpoints.
4. **Mission Control UI (React/TypeScript):** The decision visualizer that connects via WebSockets to the Gateway's data buffer.

## 🛠️ Technologies Used
* **Edge Control:** Go (Golang), MQTT
* **AI & Simulation:** Python, FastAPI, ONNX
* **Frontend:** React, TypeScript, WebSockets
* **Infrastructure & Deployment:** Docker, K3s (Lightweight Kubernetes), Redis, GitHub Actions (CI/CD for ARM/x86 binaries)

## 💻 Installation

### Prerequisites
* Docker and Docker Compose installed.
* (Optional) K3s cluster for testing edge deployments.

### Setup Steps
1. Clone the repository:
   ```bash
   git clone [https://github.com/yourusername/lunar-gateway-autonomy.git](https://github.com/yourusername/lunar-gateway-autonomy.git)
   cd lunar-gateway-autonomy
   ```
2. Build and launch the stack using Docker Compose, which bootstraps the Simulator, Go Edge, FastAPI Brain, and React UI:
   ```bash
   docker-compose up --build -d
   ```
   *(Alternatively, use the `Makefile` shortcuts for building and testing.)*

## 🎮 Usage
Once the cluster is running:
1. Access the Mission Control UI via your browser to view the 3D Gateway model and highlight active modules/heaters.
2. Monitor the **Power Grid** component to watch simulated energy moving from solar arrays to batteries.
3. Review the **Decision Log** to see real-time updates on *why* the AI engine made specific choices.
4. View cleanly formatted cargo data in the **Logistics Table**.

## 🤝 Contributing
Contributions are welcome! If you are modifying the edge systems, please ensure your changes pass the automated CI/CD checks defined in `.github/workflows/` for cross-compiling Go binaries and building the AI container.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/NewHeuristics`)
3. Commit your Changes (`git commit -m 'Add new AI prediction model'`)
4. Push to the Branch (`git push origin feature/NewHeuristics`)
5. Open a Pull Request

## 📄 License
Distributed under the MIT License. See `LICENSE` for more information.
