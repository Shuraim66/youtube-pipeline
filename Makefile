.PHONY: build run test clean deps research script images voice metadata upload full

BINARY_NAME=youtube-pipeline
BUILD_DIR=build

build:
	go build -o $(BUILD_DIR)/$(BINARY_NAME) ./cmd/pipeline

build-all:
	GOOS=linux GOARCH=amd64 go build -o $(BUILD_DIR)/$(BINARY_NAME)-linux ./cmd/pipeline
	GOOS=windows GOARCH=amd64 go build -o $(BUILD_DIR)/$(BINARY_NAME)-windows.exe ./cmd/pipeline
	GOOS=darwin GOARCH=amd64 go build -o $(BUILD_DIR)/$(BINARY_NAME)-macos ./cmd/pipeline

run:
	go run ./cmd/pipeline -config configs/config.yaml

research:
	go run ./cmd/research -config configs/config.yaml

script:
	go run ./cmd/script -config configs/config.yaml

images:
	go run ./cmd/images -config configs/config.yaml

voice:
	go run ./cmd/voice -config configs/config.yaml

metadata:
	go run ./cmd/metadata -config configs/config.yaml

upload:
	go run ./cmd/upload -config configs/config.yaml

full:
	go run ./cmd/pipeline -config configs/config.yaml -mode full

test:
	go test ./...

deps:
	go mod download
	go mod tidy

clean:
	rm -rf $(BUILD_DIR)
	rm -f temp_chunk_*.wav concat_list.txt

install:
	go install ./cmd/pipeline

# Development helpers
dev:
	go run ./cmd/pipeline -config configs/config.yaml -mode full

watch:
	@echo "Watching for changes... (requires reflex or similar)"
	@reflex -g '*.go' -s -- go run ./cmd/pipeline

# Create required directories
init-dirs:
	mkdir -p data/{topics,scripts,images,voice,videos,output}
	mkdir -p configs
	mkdir -p build