// Package state_manager buffers telemetry locally when disconnected from Earth.
package state_manager

import (
	"context"
	"encoding/json"
	"log"
	"time"

	"github.com/go-redis/redis/v8"
)

// Decision represents an autonomous decision made by the edge controller.
type Decision struct {
	Subsystem string  `json:"subsystem"`
	Action    string  `json:"action"`
	Reason    string  `json:"reason"`
	Timestamp float64 `json:"timestamp"`
}

// StateSync manages local state buffering via Redis.
type StateSync struct {
	rdb *redis.Client
}

// New creates a StateSync connected to the given Redis address.
func New(addr string) *StateSync {
	rdb := redis.NewClient(&redis.Options{
		Addr:        addr,
		DialTimeout: 5 * time.Second,
	})
	return &StateSync{rdb: rdb}
}

// BufferTelemetry stores the latest telemetry in Redis.
func (s *StateSync) BufferTelemetry(ctx context.Context, data interface{}) {
	payload, err := json.Marshal(data)
	if err != nil {
		log.Printf("[STATE] Marshal error: %v", err)
		return
	}
	if err := s.rdb.Set(ctx, "telemetry:latest", payload, 30*time.Second).Err(); err != nil {
		log.Printf("[STATE] Redis write failed (buffering locally): %v", err)
		return
	}
	// Also push to a list for the UI to stream
	s.rdb.LPush(ctx, "telemetry:stream", payload)
	s.rdb.LTrim(ctx, "telemetry:stream", 0, 499)
}

// PublishDecision stores an autonomous decision in Redis.
func (s *StateSync) PublishDecision(subsystem, action, reason string) {
	d := Decision{
		Subsystem: subsystem,
		Action:    action,
		Reason:    reason,
		Timestamp: float64(time.Now().UnixMilli()) / 1000.0,
	}
	payload, _ := json.Marshal(d)
	ctx := context.Background()
	s.rdb.LPush(ctx, "decisions:log", payload)
	s.rdb.LTrim(ctx, "decisions:log", 0, 199)
	s.rdb.Publish(ctx, "decisions:live", payload)
}
