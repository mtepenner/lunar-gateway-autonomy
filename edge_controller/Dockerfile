FROM golang:1.22-alpine AS builder
WORKDIR /src
COPY go.mod ./
COPY go.sum* ./
RUN go mod download 2>/dev/null || true
COPY . .
RUN go mod tidy && CGO_ENABLED=0 go build -ldflags="-s -w" -o /edge-controller ./cmd/controller

FROM scratch
COPY --from=builder /edge-controller /edge-controller
ENTRYPOINT ["/edge-controller"]
